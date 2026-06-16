"use client"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { useState, useEffect } from "react"

const baseLinks = [
  { href: "/sessions", label: "Sessions" },
  { href: "/sessions/new", label: "+ New Session" },
  { href: "/players", label: "Players" },
  { href: "/stats", label: "Stats" },
]

export default function NavBar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const { data: authSession } = useSession()
  const isAdmin = authSession?.user?.role === "admin"
  const [drawerOpen, setDrawerOpen] = useState(false)

  const links = isAdmin
    ? [...baseLinks, { href: "/users", label: "Users" }]
    : baseLinks

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  function linkClass(href: string) {
    const active = pathname.startsWith(href) && href !== "/sessions/new"
    if (href === "/sessions/new") return "block px-4 py-3 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
    if (active) return "block px-4 py-3 rounded text-sm bg-gray-200 text-gray-900 dark:bg-slate-600 dark:text-white transition-colors"
    return "block px-4 py-3 rounded text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
  }

  function desktopLinkClass(href: string) {
    const active = pathname.startsWith(href) && href !== "/sessions/new"
    if (href === "/sessions/new") return "px-3 py-1.5 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
    if (active) return "px-3 py-1.5 rounded text-sm bg-gray-200 text-gray-900 dark:bg-slate-600 dark:text-white transition-colors"
    return "px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 dark:bg-slate-800 dark:border-transparent text-gray-900 dark:text-white px-4 py-3 shadow-sm dark:shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <span className="font-bold text-lg text-green-600 dark:text-green-400">🃏 Lotus</span>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1 mx-4 flex-wrap">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={desktopLinkClass(l.href)}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="text-lg leading-none px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile right controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="text-lg leading-none px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {/* Hamburger button */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-slate-700">
          <span className="font-bold text-lg text-green-600 dark:text-green-400">🃏 Lotus</span>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-slate-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-sm text-left px-4 py-3 rounded text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
