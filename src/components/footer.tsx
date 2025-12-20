"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import quickbotsIcon from "@/assets/quickbots-logo.png";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url?: string;
    external?: boolean;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src?: string;
    alt?: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer = ({
  logo = {
    url: "/",
    title: "QuickBots",
    alt: "QuickBots AI Bot Platform",
  },
  tagline = "Create intelligent AI bots with ease. No coding required.",
  menuItems = [
    {
      title: "Features",
      links: [
        { text: "AI-assisted onboarding", url: undefined },
        { text: "Runtime controls & quotas", url: undefined },
        { text: "Embeddable QuickBots widget", url: undefined },
        { text: "Analytics & guardrails", url: undefined },
        { text: "Developer-friendly APIs", url: undefined },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", url: "/privacy" },
        { text: "Terms of Service", url: "/terms" },
      ],
    },
  ],
}: FooterProps) => {
  return (
    <footer className="relative border-t border-border/30 bg-background  w-full">
      <div className="container mx-auto px-4">
        <div className="py-12">
          {/* Main footer content */}
          <div className="flex flex-col lg:flex-row gap-12 justify-between mb-8">
            {/* Brand section */}
            <div className="shrink-0">
              <Link
                href={logo.url}
                className="flex items-center gap-2 mb-4 group"
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                    <Image
                      src={quickbotsIcon}
                      alt="QuickBots logo"
                      className="h-5 w-5"
                      width={32}
                      height={32}
                      priority
                    />
                  </div>
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {logo.title}
                </span>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
                {tagline}
              </p>
              <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                <p>© 2025 {logo.title}. All rights reserved.</p>
              </div>
            </div>

            {/* ASCII art / vibe block */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="rounded-2xl px-4 py-6 sm:px-6 sm:py-8 flex items-center justify-center">
                <pre className="text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight font-mono text-primary text-center whitespace-pre">
                  {`   ____        _      _    ____        _                  _____ 
  / __ \\      (_)    | |  |  _ \\      | |           /\\   |_   _|
 | |  | |_   _ _  ___| | _| |_) | ___ | |_ ___     /  \\    | |  
 | |  | | | | | |/ __| |/ /  _ < / _ \\| __/ __|   / /\\ \\   | |  
 | |__| | |_| | | (__|   <| |_) | (_) | |_\\__ \\  / ____ \\ _| |_ 
  \\___\\_\\\\__,_|_|\\___|_|\\_\\____/ \\___/ \\__|___/ /_/    \\_\\_____|
                                                                
                                                                 `}
                </pre>
              </div>
            </div>

            {/* Menu sections */}
            <div className="flex gap-12">
              {menuItems.map((section, sectionIdx) => (
                <div key={sectionIdx} className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        {link.url ? (
                          link.external ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                            >
                              {link.text}
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <Link
                              href={link.url}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                              {link.text}
                            </Link>
                          )
                        ) : (
                          <span
                            className="relative inline-block text-sm text-muted-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary/60 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100 focus-visible:outline-none focus-visible:text-foreground"
                            tabIndex={0}
                          >
                            {link.text}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
