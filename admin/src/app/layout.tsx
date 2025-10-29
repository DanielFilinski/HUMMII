import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Hummii Admin Panel",
  description: "Administrative panel for Hummii platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}

