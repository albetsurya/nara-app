import type { Metadata, Viewport } from "next";
import { Nunito, Figtree } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { Providers } from "./providers";

// Next injects Font Awesome's CSS via the import above; stop FA adding it a second time.
config.autoAddCss = false;

const display = Nunito({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600", "700", "800"] });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Nara", template: "%s · Nara" },
  description: "Your thoughts, ideas, and stories. All welcome here.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Nara", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
  openGraph: {
    title: "Nara",
    description: "A quiet place for your notes. Small time, big feelings.",
    type: "website",
  },
  twitter: { card: "summary", title: "Nara", description: "A quiet place for your notes." },
};

export const viewport: Viewport = {
  themeColor: "#FDE68A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          {/* Phone-shaped column; on desktop it sits centred on a slightly deeper canvas */}
          <div className="mx-auto min-h-dvh w-full max-w-md bg-canvas sm:shadow-float">{children}</div>
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
