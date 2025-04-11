import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "./ClientLayout";

// Configure Geist fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Server-side metadata
export const metadata = {
  title: "NoteExchange",
  description: "Share and read touching love stories",
  icons: {
    icon: "/heart.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>{/* <link rel="icon" href="/red-heart.svg" sizes="any" /> */}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
