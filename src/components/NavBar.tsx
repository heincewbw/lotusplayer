"use client"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"

const links = [
  { href: "/sessions", label: "Sessions" },
  { href: "/sessions/new", label: "+ New Session" },
  { href: "/players", label: "Players" },
  { href: "/stats", label: "Stats" },
]

export default function NavBar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-slate-800 dark:border-transparent text-gray-900 dark:text-white px-4 py-3 shadow-sm dark:shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-bold text-lg mr-3 text-green-600 dark:text-green-400">🃏 Lotus</span>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname.startsWith(l.href) && l.href !== "/sessions/new"
                  ? "bg-gray-200 text-gray-900 dark:bg-slate-600 dark:text-white"
                  : l.href === "/sessions/new"
                  ? "bg-green-600 hover:bg-green-700 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
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
      </div>
    </nav>
  )
}
