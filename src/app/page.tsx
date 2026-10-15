import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Index() {
  const supabase = await createClient();
  let user = null;
  try {
    const res = await supabase.auth.getUser();
    user = res.data?.user;
  } catch {
    user = null;
  }
  redirect(user ? "/home" : "/onboarding");
}
