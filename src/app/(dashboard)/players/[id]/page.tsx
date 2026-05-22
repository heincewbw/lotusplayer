"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type SessionRow = {
  sessionId: number
  date: string
  ambil: number
  sisa: number
  pl: number
}

type PlayerStats = {
  player: { id: number; name: string }
  sessions: SessionRow[]
  total: number
  wins: number
  losses: number
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })
}

export default function PlayerDetailPage() {
  const { id } = useParams()
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    fetch(`/api/players/${id}/stats`)
      .then((r) => r.json())
      .then(setStats)
  }, [id])

  if (!stats) return <p className="text-gray-400 dark:text-slate-500 text-sm">Loading...</p>

  const { player, sessions, total, wins, losses } = stats
  const played = sessions.length
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0

  // Build trend data for chart
  const trendData = sessions.map((s, i) => ({
    session: i + 1,
    date: s.date,
    pl: s.pl,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{player.name}</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Statistik Player</p>
        </div>
        <Link
          href="/players"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2"
        >
          ← Kembali
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total P/L</p>
          <p className={`text-lg font-bold ${total > 0 ? "text-green-600 dark:text-green-400" : total < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"}`}>
            {fmt(total)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Session</p>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{played}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Menang / Kalah</p>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
            <span className="text-green-600 dark:text-green-400">{wins}</span>
            <span className="text-gray-400 dark:text-slate-500 text-sm mx-1">/</span>
            <span className="text-red-500 dark:text-red-400">{losses}</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Win Rate</p>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{winRate}%</p>
        </div>
      </div>

      {/* P/L trend chart */}
      {trendData.length > 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Tren P/L per Session</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e5e7eb"} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }}
                tickFormatter={(v) => formatDate(v)}
              />
              <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`, borderRadius: "8px" }}
                labelStyle={{ color: isDark ? "#e2e8f0" : "#111827" }}
                labelFormatter={(v) => formatDate(String(v))}
                formatter={(value) =>
                  typeof value === "number"
                    ? [value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString(), "P/L"]
                    : [value, "P/L"]
                }
              />
              <Line
                type="monotone"
                dataKey="pl"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session history table */}
      {sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-sm">Belum ada data session untuk player ini.</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
            <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Riwayat Session</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Tanggal</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Ambil</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Sisa</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">P/L</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {[...sessions].reverse().map((s, i) => (
                <tr key={s.sessionId} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <td className="px-4 py-3 text-sm text-gray-400 dark:text-slate-500">{sessions.length - i}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">{formatDate(s.date)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-slate-300">{s.ambil.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-slate-300">{s.sisa.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-sm font-semibold text-right ${s.pl > 0 ? "text-green-600 dark:text-green-400" : s.pl < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"}`}>
                    {fmt(s.pl)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sessions/${s.sessionId}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                    >
                      Detail
                    </Link>
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
