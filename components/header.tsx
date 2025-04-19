"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, LogOut, Settings, User } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Header = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <MobileNavLinks pathname={pathname} />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-1">
            <ClipboardCheck className="h-6 w-6" />
            <span className="font-bold">DevLog</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <DesktopNavLinks pathname={pathname} />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm font-medium">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/auth/signup" className="text-sm font-medium">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

const DesktopNavLinks = ({ pathname }: { pathname: string }) => {
  const { user } = useAuth()

  if (!user) return null

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/logs", label: "My Logs" },
    ...(user.role === "manager" ? [{ href: "/team", label: "Team View" }] : []),
  ]

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname?.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}

const MobileNavLinks = ({ pathname }: { pathname: string }) => {
  const { user } = useAuth()

  const authLinks = [
    { href: "/auth/login", label: "Log in" },
    { href: "/auth/signup", label: "Sign up" },
  ]

  const userLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/logs", label: "My Logs" },
    ...(user?.role === "manager" ? [{ href: "/team", label: "Team View" }] : []),
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
  ]

  const links = user ? userLinks : authLinks

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname?.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}

const UserMenu = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { ClipboardCheck } from "lucide-react"

export default Header
