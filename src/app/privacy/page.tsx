import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Free SVG Viewer handles files, browser storage, and privacy.',
  alternates: { canonical: '/privacy' },
};

const githubUrl = 'https://github.com/sen-priyansh/freesvgviewer';

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="privacy-header-content">
          <Link href="/" className="privacy-back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to viewer</span>
          </Link>

          <Link href="/" className="privacy-brand" aria-label="Free SVG Viewer home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/freesvg.svg" alt="" width="22" height="22" />
            <span className="privacy-brand-name">Free SVG Viewer</span>
          </Link>

          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="privacy-github-btn" aria-label="View the project on GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="privacy-container">
        <div className="privacy-hero">
          <p className="privacy-kicker">Privacy policy</p>
          <h1 className="privacy-title">Your SVGs stay on your device.</h1>
          <p className="privacy-subtitle">
            Free SVG Viewer is designed to open and convert files in your browser. We do not ask you
            to create an account, and this site does not upload the SVGs you open.
          </p>
          <p className="privacy-meta">Last updated September 28, 2026</p>
        </div>

        <section className="privacy-section">
          <h2>What this policy covers</h2>
          <p>This policy covers the Free SVG Viewer website and web app. It explains what the app does with files you choose, what it stores in your browser, and what happens when you leave this site for another service.</p>
        </section>

        <section className="privacy-section">
          <h2>Your files</h2>
          <p>When you select or drop an SVG into the viewer, the browser reads it locally. The file is used to show the preview, inspect the SVG markup, or create an export. It is not sent to a Free SVG Viewer upload service, because the app does not have one.</p>
          <p>PNG and ICO exports are created in the browser as well. Closing the tab, refreshing the page, or choosing another file removes the current file from the app. We do not keep a gallery, history, or copy of the files you work with.</p>
          <p>As with any website, your browser may make normal requests for the site itself—such as the page, scripts, styles, icons, and updates. Those requests are separate from the SVG file you choose in the app.</p>
        </section>

        <section className="privacy-section">
          <h2>Cookies and tracking</h2>
          <p>Free SVG Viewer does not use cookies for advertising, analytics, login, or tracking. It does not include analytics products, tracking pixels, session-replay tools, or a newsletter signup.</p>
          <p>We do not collect a record of the SVG filenames you open, the images you export, or how you use the editor. There is no user account and no conversion history attached to you.</p>
        </section>

        <section className="privacy-section">
          <h2>Browser storage and offline use</h2>
          <p>The app uses browser-managed storage for offline use:</p>
          <ul>
            <li><strong>Offline cache.</strong> A service worker may cache site files such as pages, scripts, styles, and icons so the app can open while you are offline. Your selected SVG files and exported images are not deliberately added to this cache.</li>
          </ul>
          <p>You can remove this information at any time by clearing this site&apos;s data in your browser settings. That may also remove the offline version of the app.</p>
        </section>

        <section className="privacy-section">
          <h2>Information handled by your browser or network</h2>
          <p>Your browser and the company that hosts or delivers this website may handle routine technical information needed to load a webpage, such as an IP address, browser type, request time, and the page requested. That is part of operating websites on the internet, not data collected by the viewer from your SVG files.</p>
          <p>Browser extensions, security software, or network administrators can also have their own rules and visibility. Their handling of data is outside this app&apos;s control.</p>
        </section>

        <section className="privacy-section">
          <h2>External links</h2>
          <p>The app links to its public GitHub repository. If you open that link, you leave Free SVG Viewer and GitHub&apos;s privacy policy applies. GitHub may collect information under its own terms, including if you sign in or interact with the project there.</p>
        </section>

        <section className="privacy-section">
          <h2>Children&apos;s privacy</h2>
          <p>The app does not knowingly collect personal information from anyone, including children. It is a file-viewing tool and does not provide accounts, comments, or direct messaging.</p>
        </section>

        <section className="privacy-section">
          <h2>Changes to this policy</h2>
          <p>We may update this policy when the app changes or when a clearer explanation is needed. The date at the top of this page shows when it was last revised. If a future change would affect how files or personal information are handled, this page will be updated to say so.</p>
        </section>

        <section className="privacy-section">
          <h2>Questions</h2>
          <p>If you have a privacy question or spot something that does not match the app&apos;s behavior, please open an issue in the <a href={`${githubUrl}/issues`} target="_blank" rel="noopener noreferrer" className="privacy-text-link">project&apos;s GitHub issues</a>. The source code is public, so you can also review how the viewer works yourself.</p>
        </section>
      </main>

      <footer className="privacy-footer"><p>Free SVG Viewer · Free and open source</p></footer>
    </div>
  );
}
