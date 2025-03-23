import Header from "@/components/dashboard/header";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { getServerFlags } from "@/components/flagsmith/flagsmith-server";
import { Mountain, Settings, Clock, AlertTriangle, ExternalLink, Home, HammerIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const { hasFeature, getValue } = await getServerFlags();

  const maintenance_mode = hasFeature("maintenance_mode");
  const maintenance_message = getValue(
    "maintenance_message",
    "Site is under maintenance. Some features may be unavailable.",
  );
  const maintenance_severity = getValue("maintenance_severity", "warning");
  const estimated_completion = getValue("estimated_completion", "1 days");

  if (maintenance_mode) {
    // Configure styles based on severity
    const severityConfig = {
      critical: {
        bgGradient: "from-red-50 to-white",
        iconColor: "text-red-500",
        accentColor: "bg-red-500",
        textColor: "text-red-700",
        iconBg: "bg-red-100",
      },
      warning: {
        bgGradient: "from-amber-50 to-white",
        iconColor: "text-amber-500",
        accentColor: "bg-amber-500",
        textColor: "text-amber-700",
        iconBg: "bg-amber-100",
      },
      info: {
        bgGradient: "from-blue-50 to-white",
        iconColor: "text-blue-500",
        accentColor: "bg-blue-500",
        textColor: "text-blue-700",
        iconBg: "bg-blue-100",
      },
    };
    
    const config = severityConfig[maintenance_severity as keyof typeof severityConfig] || severityConfig.info;

    return (
      <div className="min-h-screen bg-gradient-to-b w-full flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Mountain className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  DocQuery
                </span>
              </Link>
              
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.iconBg} ${config.textColor}`}>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Maintenance Mode
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Maintenance Content */}
        <div className={`flex-grow bg-gradient-to-b ${config.bgGradient}`}>
          <div className="max-w-5xl mx-auto px-4 py-12 sm:py-24 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center">
            {/* Left side - Icon and decorations */}
            <div className="lg:w-1/2 mb-12 lg:mb-0 flex justify-center lg:justify-end lg:pr-12">
              <div className="relative">
                {/* Main icon with animation */}
                <div className={`rounded-full w-40 h-40 sm:w-56 sm:h-56 ${config.iconBg} flex items-center justify-center shadow-lg relative z-10`}>
                  <Settings className={`h-24 w-24 sm:h-32 ${config.iconColor} animate-spin`} />
                </div>
                
                {/* Decorative smaller icons */}
                <div className={`absolute -top-4 -left-4 rounded-full w-12 h-12 ${config.iconBg} flex items-center justify-center shadow-md`}>
                  <HammerIcon className={`h-6 w-6 ${config.iconColor}`} />
                </div>
                <div className={`absolute bottom-10 -right-6 rounded-full w-16 h-16 ${config.iconBg} flex items-center justify-center shadow-md`}>
                  <Clock className={`h-8 w-8 ${config.iconColor}`} />
                </div>
                
                {/* Decorative dots */}
                <div className={`absolute top-1/4 -right-10 rounded-full w-3 h-3 ${config.accentColor}`}></div>
                <div className={`absolute top-2/3 -left-10 rounded-full w-5 h-5 ${config.accentColor}`}></div>
                <div className={`absolute -bottom-2 left-1/4 rounded-full w-4 h-4 ${config.accentColor}`}></div>
              </div>
            </div>
            
            {/* Right side - Text content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                System Maintenance
              </h1>
              
              <div className={`h-1 w-12 ${config.accentColor} mb-6 mx-auto lg:mx-0`}></div>
              
              <p className={`text-lg sm:text-xl ${config.textColor} mb-6`}>
                {maintenance_message}
              </p>
              
              {estimated_completion && (
                <div className="flex items-center justify-center lg:justify-start text-sm text-gray-600 mb-8">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Expected completion: {estimated_completion}</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Return to Home</span>
                  </Link>
                </Button>
                
                <Button size="lg" className="gap-2" asChild>
                  <Link href="https://github.com/md-abid-hussain/docquery" target="_blank" rel="noopener noreferrer">
                    <span>Check Status</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-white border-t py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              Thank you for your patience while we improve DocQuery.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  const allow_anonymous = hasFeature("allow_anonymous");

  if (!allow_anonymous && !session) {
    redirect("/signin");
  }

  return (
    <div>
      <SessionProvider>
        <Header />
        <div className="mt-16">{children}</div>
        <Toaster />
      </SessionProvider>
    </div>
  );
}