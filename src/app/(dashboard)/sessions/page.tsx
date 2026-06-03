"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

type SessionEntry = {
  player: { name: string }
  pl: number
}

type Session = {
  id: number
  date: string
  entries: SessionEntry[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")
  const { data: authSession } = useSession()
  const isAdmin = authSession?.user?.role === "admin"

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { setSessions(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredSessions = sessions.filter((s) => {
    const dateStr = s.date.split("T")[0]
    if (filterStart && dateStr < filterStart) return false
    if (filterEnd && dateStr > filterEnd) return false
    return true
  })

  async function handleDelete(id: number) {
    if (!confirm("Hapus session ini?")) return
    await fetch(`/api/sessions/${id}`, { method: "DELETE" })
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) return <p className="text-gray-400 dark:text-slate-500 text-sm">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Riwayat Session</h1>
        <Link
          href="/sessions/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + New Session
        </Link>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-xs text-gray-500 dark:text-slate-400">Filter:</span>
        <input
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
        <input
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {(filterStart || filterEnd) && (
          <button
            onClick={() => { setFilterStart(""); setFilterEnd("") }}
            className="text-xs text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
          >
            Reset
          </button>
        )}
        {(filterStart || filterEnd) && (
          <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
            {filteredSessions.length} session
          </span>
        )}
      </div>

      {filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {filterStart || filterEnd ? "Tidak ada session dalam periode ini." : "Belum ada session."}
          </p>
          {!filterStart && !filterEnd && (
            <Link href="/sessions/new" className="text-green-600 dark:text-green-400 text-sm mt-2 inline-block hover:underline">
              Buat session pertama →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Tanggal</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Players</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                    {formatDate(s.date)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {(() => {
                      const sorted = [...s.entries].sort((a, b) => b.pl - a.pl)
                      const pls = sorted.map((e) => e.pl)
                      const maxPl = Math.max(...pls)
                      const minPl = Math.min(...pls)
                      return sorted.map((e, i) => {
                        const pl = e.pl
                        const isWinner = pl === maxPl && maxPl > 0
                        const isLoser = pl === minPl && minPl < 0
                        return (
                          <span key={e.player.name}>
                            {i > 0 && <span className="text-gray-400 dark:text-slate-500">, </span>}
                            <span className={isWinner ? "text-green-600 dark:text-green-400 font-medium" : isLoser ? "text-red-500 dark:text-red-400 font-medium" : "text-gray-600 dark:text-slate-300"}>
                              {e.player.name}
                            </span>
                          </span>
                        )
                      })
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <Link
                        href={`/sessions/${s.id}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/result/${s.id}`}
                        className="text-xs text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
                      >
                        Hasil
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
