import { Mountain, Menu, User, BookUser, Database, Trash } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import SignIn from "../sign-in";
import SignOut from "../sign-out";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/d/chat", label: "Chat" },
  { href: "/d/user", label: "Repositories" },
];

const ADMIN_USERS = process.env.NEXT_PUBLIC_ADMIN_USERS?.split(",") || [];

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  const isAdmin = user?.email && ADMIN_USERS.includes(user.email);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-zinc-900">
                DocQuery
              </span>
            </Link>
          </div>

          {session ? (
            <>
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

                {/* Admin-only Ingest Link */}
                {isAdmin && (
                  <Link
                    href="/d/ingest"
                    className={cn(
                      "text-sm font-medium text-emerald-600 flex items-center gap-1.5",
                      "hover:text-emerald-800 hover:underline underline-offset-4",
                      "bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200"
                    )}
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>Admin</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8 transition-opacity hover:opacity-80">
                        {user?.image ? (
                          <AvatarImage
                            src={user.image}
                            alt={user.name || "User avatar"}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/d/user/`} className="cursor-pointer">
                        <BookUser className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin link in dropdown */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/d/ingest" className="cursor-pointer">
                            <Database className="mr-2 h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/d/repos" className="cursor-pointer">
                            <Trash className="mr-2 h-4 w-4 text-red-600" />
                            <span className="text-red-600 font-medium">Manage Repositories</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <SignOut />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>

              {/* Mobile Navigation */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  <div className="flex flex-col gap-6 h-full">
                    <div className="flex items-center gap-2 mt-4">
                      {user?.image ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.image}
                            alt={user.name || "User"}
                          />
                        </Avatar>
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    <nav className="flex flex-col gap-3">
                      {navItems.map((item) => (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100"
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}

                      {/* Admin links in mobile menu */}
                      {isAdmin && (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/d/ingest"
                              className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-emerald-600 rounded-md bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                            >
                              <Database className="h-4 w-4" />
                              <span>Admin Dashboard</span>
                              <span className="h-2 w-2 ml-auto rounded-full bg-emerald-500 animate-pulse" />
                            </Link>
                          </SheetClose>
                          
                          <SheetClose asChild>
                            <Link
                              href="/d/repos"
                              className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-red-600 rounded-md bg-red-50 border border-red-200 hover:bg-red-100"
                            >
                              <Trash className="h-4 w-4" />
                              <span>Manage Repositories</span>
                            </Link>
                          </SheetClose>
                        </>
                      )}

                      <SheetClose asChild>
                        <Link
                          href="/d/user/"
                          className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100"
                        >
                          <BookUser className="h-4 w-4" />
                          Profile
                        </Link>
                      </SheetClose>
                    </nav>

                    <div className="mt-auto">
                      {/* Fix: Wrap SignOut in a div instead of using SheetClose */}
                      <div className="w-full">
                        <SignOut />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <SignIn />
          )}
        </div>
      </div>
    </header>
  );
}