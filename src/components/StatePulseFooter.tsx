import { StatePulseLogo } from "@/components/StatePulseLogo";
import Link from "next/link";
import { Github, Instagram, Mail } from "lucide-react";

export function StatePulseFooter() {
  return (
    <footer className="bg-card/50 border-t border-border/30 py-16 px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <StatePulseLogo className="text-primary flex-shrink-0" size={22} />
              <span className="font-headline text-lg text-foreground">StatePulse</span>
            </div>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              The premier platform for U.S. state legislative tracking and civic
              engagement. Deciphering policy complexity for everyone.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://github.com/lightningbolts/state-pulse" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/mystatepulse/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:contact@statepulse.me" aria-label="Email" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div>
              <h5 className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-5">
                Intelligence
              </h5>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li><Link href="/tracker" className="hover:text-primary transition-colors">Policy Tracking</Link></li>
                <li><Link href="/comparison" className="hover:text-primary transition-colors">Comparison Tool</Link></li>
                <li><Link href="/legislation" className="hover:text-primary transition-colors">Policy Updates</Link></li>
                <li><Link href="/summaries" className="hover:text-primary transition-colors">AI Summaries</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-5">
                Company
              </h5>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/learn" className="hover:text-primary transition-colors">Learn</Link></li>
                <li><Link href="/posts" className="hover:text-primary transition-colors">Community</Link></li>
                <li><a href="https://buymeacoffee.com/timberlake2025" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Support Us</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-5">
                Legal
              </h5>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:contact@statepulse.me" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] font-label uppercase tracking-widest text-muted-foreground/50">
          <span>© {new Date().getFullYear()} StatePulse. All rights reserved.</span>
          <span>Built with civic engagement in mind.</span>
        </div>
      </div>
    </footer>
  );
}
