import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pointmaxxer — the right card for every purchase",
  description: "Ranks your credit cards by real value back for any purchase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
