import type { Metadata } from "next";
import "./globals.css";
import { getAppName } from "@/lib/app-name";

export const metadata: Metadata = {
  title: {
    default: getAppName(),
    template: `%s · ${getAppName()}`,
  },
  description:
    "Vantrex Classroom — platform kelas daring untuk owner, guru, dan murid: materi, tugas, kuis, dan nilai dalam satu tempat.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
