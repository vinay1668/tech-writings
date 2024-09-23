import Link from 'next/link';
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Vinay's Writings",
  description: "Personal blog and thoughts by Vinay",
  icons: {
    icon: 'favicon.ico', // Path to your new favicon
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white font-lato">
        <header className="py-6 mb-12">
          <div className="container px-4 flex justify-between items-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-montserrat"></h1>
            <nav>
              <ul className="flex space-x-8">
                <li><Link href="/" className="font-montserrat no-underline">Writings</Link></li>
                <li><Link href="/about" className="font-montserrat no-underline">About</Link></li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 max-w-2xl">
          {children}
        </main>
      </body>
    </html>
  );
}