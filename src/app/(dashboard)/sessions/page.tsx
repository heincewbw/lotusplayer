"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

type SessionEntry = {
  player: { name: string }
  ambil: number
  sisa: number
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

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { setSessions(data); setLoading(false) })
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("Hapus session ini?")) return
    await fetch(`/api/sessions/${id}`, { method: "DELETE" })
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-100">Riwayat Session</h1>
        <Link
          href="/sessions/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-8 text-center">
          <p className="text-slate-400 text-sm">Belum ada session.</p>
          <Link href="/sessions/new" className="text-green-400 text-sm mt-2 inline-block hover:underline">
            Buat session pertama →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3">Tanggal</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3">Players</th>
                <th className="text-right text-xs font-semibold text-slate-400 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-700">
                  <td className="px-4 py-3 text-sm font-medium text-slate-100">
                    {formatDate(s.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {s.entries.map((e) => e.player.name).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <Link
                        href={`/sessions/${s.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/result/${s.id}`}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Hasil
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Hapus
                      </button>
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
