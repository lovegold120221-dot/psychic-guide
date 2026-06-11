import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit — Video Meetings, Reimagined",
  description:
    "Orbit is a modern video conferencing platform. Host meetings, share screens, chat with your team — all in one place.",
  keywords: ["video conferencing", "meetings", "orbit", "zoom alternative", "team chat"],
  authors: [{ name: "Orbit Team" }],
  openGraph: {
    title: "Orbit — Video Meetings, Reimagined",
    description: "Host meetings, share screens, chat with your team.",
    type: "website",
  },
  icons: {
    icon: "https://eburon.ai/icon-eburon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen-safe w-screen-safe flex flex-col overflow-hidden bg-orbit-darker text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
