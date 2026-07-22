import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Music2 } from "lucide-react";
import { Logo } from "./Logo";

const INSTAGRAM_URL = "https://www.instagram.com/genz___s?igsh=NGRlY2h6YXFmcGNj";
const TIKTOK_URL = "https://www.tiktok.com/@genz__s?_r=1&_t=ZS-98ESBIHt1Xj";
const EMAIL = "contact@genz-s.com";

export function Footer() {
  return (
    <footer className="mt-24 bg-[oklch(0.14_0.015_155)] text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <Logo className="h-10 w-10" />
            <span className="font-display text-xl font-bold tracking-tight text-white">GenZ</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Egyptian streetwear rooted in culture. Designed in Cairo, worn everywhere.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/apply" className="hover:text-white transition-colors">Apply</Link></li>
            <li><Link to="/signin" className="hover:text-white transition-colors">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" /> {EMAIL}
          </a>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Instagram, href: INSTAGRAM_URL, label: "Instagram" },
              { Icon: Music2, href: TIKTOK_URL, label: "TikTok" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all hover:bg-white hover:text-[oklch(0.14_0.015_155)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} GenZ. All rights reserved.</p>
          <p>Made in Cairo.</p>
        </div>
      </div>
    </footer>
  );
}
