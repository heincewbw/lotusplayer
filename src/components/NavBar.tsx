"use client"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

const links = [
  { href: "/sessions", label: "Sessions" },
  { href: "/sessions/new", label: "+ New Session" },
  { href: "/players", label: "Players" },
  { href: "/stats", label: "Stats" },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-slate-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-bold text-lg mr-3 text-green-400">🃏 Lotus</span>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname.startsWith(l.href) && l.href !== "/sessions/new"
                  ? "bg-slate-600 text-white"
                  : l.href === "/sessions/new"
                  ? "bg-green-600 hover:bg-green-700 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-400 hover:text-white transition-colors ml-2"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
