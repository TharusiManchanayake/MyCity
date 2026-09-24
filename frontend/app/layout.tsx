import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyCity",
  description: "Report and track local civic issues",
};

const domPatchScript = `
  if (typeof Node === 'function' && Node.prototype && !Node.prototype.__patchedForTranslate) {
    Node.prototype.__patchedForTranslate = true;

    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child.parentNode !== this) {
        if (console) {
          console.warn('Cannot remove a node that is not a child of this node. Skipped (likely caused by a browser extension or translation tool).');
        }
        return child;
      }
      return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.warn('Cannot insert before a reference node that is not a child of this node. Appending instead (likely caused by a browser extension or translation tool).');
        }
        return this.appendChild(newNode);
      }
      return originalInsertBefore.apply(this, arguments);
    };
  }
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Plain script tag (not next/script) — runs synchronously, immediately,
            on every page including client-side navigations, with no Next.js
            timing restrictions. Must load before Google Translate can mutate the DOM. */}
        <script dangerouslySetInnerHTML={{ __html: domPatchScript }} />

        <style>{`
          /* Tame Google Translate's default styling to fit the green theme */
          #google_translate_element { display: inline-block; }
          #google_translate_element .goog-te-gadget { font-family: inherit !important; font-size: 0 !important; }
          #google_translate_element .goog-te-gadget > span > a { display: none !important; }
          .goog-te-gadget-simple {
            background: #f0fdf4 !important;
            border: 1px solid #bdf0ca !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            display: inline-flex !important;
            align-items: center !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value span {
            color: #16a34a !important;
            font-size: 13px !important;
            font-weight: 600 !important;
          }
          .goog-te-gadget-icon { display: none !important; }
          body { top: 0 !important; }
          .goog-te-banner-frame { display: none !important; }
        `}</style>

        <Navbar />
        {children}

        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  includedLanguages: 'en,si,ta',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                },
                'google_translate_element'
              );
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}