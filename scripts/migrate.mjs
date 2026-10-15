#!/usr/bin/env node
/**
 * Auto-migrasi Supabase: menjalankan semua file di supabase/migrations/*.sql
 * ke database cloud, berurutan sesuai nama file.
 *
 * Kredensial (salah satu):
 *   SUPABASE_DB_PASSWORD=...   password database (Dashboard > Project Settings > Database)
 *   DATABASE_URL=postgres://postgres:<password>@db.<ref>.supabase.co:5432/postgres
 *
 * Host diambil otomatis dari NEXT_PUBLIC_SUPABASE_URL di .env.local.
 * File migrasi dibuat idempoten, jadi aman dijalankan ulang.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  }
}

loadEnv();

const { Client } = pg;

function connectionConfig() {
  if (process.env.DATABASE_URL) return { connectionString: process.env.DATABASE_URL };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  if (!ref) throw new Error("NEXT_PUBLIC_SUPABASE_URL tidak valid di .env.local");
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    throw new Error(
      "SUPABASE_DB_PASSWORD belum diisi.\n" +
        "Ambil di Supabase Dashboard > Project Settings > Database > Database password,\n" +
        "lalu tambahkan baris ini ke .env.local:\n  SUPABASE_DB_PASSWORD=<password-anda>"
    );
  }
  return {
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

const dir = join(root, "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
if (files.length === 0) {
  console.log("Tidak ada file migrasi di supabase/migrations.");
  process.exit(0);
}

try {
  const client = new Client(connectionConfig());
  await client.connect();
  console.log(`Terhubung. Menjalankan ${files.length} migrasi...`);
  for (const f of files) {
    const sql = readFileSync(join(dir, f), "utf8");
    await client.query(sql);
    console.log(`  OK  ${f}`);
  }
  await client.end();
  console.log("Semua migrasi berhasil.");
} catch (err) {
  console.error(`Gagal: ${err.message}`);
  process.exit(1);
}
