import {
  Mountain,
  Menu as MenuIcon,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { getServerFlags } from "../flagsmith/flagsmith-server";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#benefits", label: "Benefits" },
  { href: "#tech-stack", label: "Tech Stack" },
];

export async function LandingHeader() {
  const { hasFeature, getValue } = await getServerFlags();

  const maintenance_mode = hasFeature("maintenance_mode");
  const maintenance_message = getValue(
    "maintenance_message",
    "Site is under maintenance. Some features may be unavailable.",
  );
  const maintenance_severity = getValue("maintenance_severity", "info");

  // Configure banner styles based on severity
  const bannerStyles = {
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
      icon: Info,
    },
    warning: {
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      iconColor: "text-amber-600",
      icon: AlertTriangle,
    },
    critical: {
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
      icon: AlertCircle,
    },
  };

  const bannerStyle =
    bannerStyles[maintenance_severity as keyof typeof bannerStyles] ||
    bannerStyles.warning;
  const Icon = bannerStyle.icon;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b">
      {maintenance_mode && (
        <div
          className={`${bannerStyle.bgColor} border-b ${bannerStyle.borderColor}`}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${bannerStyle.iconColor}`} />
                <span
                  className={`text-sm font-medium ${bannerStyle.textColor}`}
                >
                  {maintenance_message}
                </span>
              </div>
              <a
                href="https://status.docquery.io"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs ${bannerStyle.textColor} hover:underline hidden sm:block`}
              >
                Check Status
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-colors hover:opacity-80"
          >
            <Mountain className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              DocQuery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium text-zinc-600",
                  "hover:text-zinc-900 hover:underline underline-offset-4",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild>
              <Link href="/d/chat">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild className="font-medium text-primary">
                <Link href="/d/chat">Get Started</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
