import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatePulseLogo } from "@/components/StatePulseLogo";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function StatePulseHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sidebar-border px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-none min-w-0" style={{ background: '#163320' }}>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <SidebarTrigger />
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <StatePulseLogo className="text-primary" size={24} />
          <span className="text-base font-semibold font-headline truncate hidden sm:block text-white">
            StatePulse
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex gap-6 items-center ml-4">
          {[
            { href: '/comparison', label: 'Policy Comparison' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-label text-sm text-white/70 hover:text-white transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 flex-wrap min-w-0">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <div className="flex flex-row gap-2">
            <SignInButton mode="modal">
              <Button size="sm" variant="ghost" className="font-label text-sm text-white border border-white/50 hover:bg-white/10 hover:text-white">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="font-label text-sm text-white rounded-xl" style={{ background: '#2d6b3e' }}>
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}
