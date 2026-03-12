import type { Metadata } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headingFont = Oxanium({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crackd Admin",
  description: "Admin application scaffolded from the cracked visual system.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={[
          bodyFont.variable,
          headingFont.variable,
          "min-h-screen text-zinc-100 antialiased",
          "bg-[#0b0b10]",
          "bg-[radial-gradient(900px_circle_at_78%_-10%,rgba(123,60,255,0.28),transparent_55%),radial-gradient(700px_circle_at_8%_12%,rgba(255,100,0,0.12),transparent_60%),linear-gradient(180deg,rgba(12,12,18,1),rgba(8,8,12,1))]",
          "[font-family:var(--font-body)]",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
