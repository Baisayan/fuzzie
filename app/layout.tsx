import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codenakama.baisayan.tech"),
  title: {
    default: "CodeNakama - AI PR Reviewer",
    template: "%s | CodeNakama",
  },
  description:
    "CodeNakama reviews GitHub pull requests using AI and repository context. Built with RAG, webhooks, and background jobs.",
  keywords: [
    "github",
    "code analysis",
    "ai",
    "AI code review",
    "Github PR review",
    "RAG",
    "retrieval augmented generation",
    "open source",
    "developer tools",
  ],
  authors: [{ name: "Baisayan", url: "https://github.com/Baisayan" }],
  creator: "Baisayan",
  publisher: "CodeNakama",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codenakama.baisayan.tech/",
    title: "CodeNakama - AI PR Reviewer",
    description:
      "CodeNakama reviews GitHub pull requests using AI and repository context. Built with RAG, webhooks, and background jobs.",
    images: [
      {
        url: "/image.png",
        width: 1200,
        height: 630,
        alt: "CodeNakama - AI PR Reviewer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@Baisayan",
    title: "CodeNakama - AI PR Reviewer",
    description:
      "CodeNakama reviews GitHub pull requests using AI and repository context. Built with RAG, webhooks, and background jobs.",
    images: [
      {
        url: "/image.png",
        alt: "CodeNakama - AI PR Reviewer",
      },
    ],
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
