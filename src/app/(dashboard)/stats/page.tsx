"use client"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

type PlayerTotal = {
  name: string
  total: number
  wins: number
  losses: number
  played: number
}

type TrendRow = Record<string, string | number>

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function StatsPage() {
  const [playerTotals, setPlayerTotals] = useState<PlayerTotal[]>([])
  const [trend, setTrend] = useState<TrendRow[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (startDate) params.set("start", startDate)
    if (endDate) params.set("end", endDate)
    const url = `/api/stats${params.toString() ? "?" + params.toString() : ""}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setPlayerTotals(data.playerTotals)
        setTrend(data.trend)
        setLoading(false)
      })
  }, [startDate, endDate])

  if (loading) return <p className="text-gray-400 dark:text-slate-400 text-sm">Loading...</p>

  if (playerTotals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Statistik</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-slate-400">Periode:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
            <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(""); setEndDate("") }} className="text-xs text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400">Reset</button>
            )}
          </div>
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          {startDate || endDate ? "Tidak ada data untuk periode ini." : "Belum ada data session."}
        </p>
      </div>
    )
  }

  // Get unique player names for the line chart
  const playerNames = Array.from(
    new Set(
      trend.flatMap((row) =>
        Object.keys(row).filter((k) => k !== "date")
      )
    )
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Statistik</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-slate-400">Periode:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(""); setEndDate("") }}
              className="text-xs text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Ranking table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Ranking All-Time</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Rank</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Player</th>
              <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Total P/L</th>
              <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Total Main</th>
              <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Menang</th>
              <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 px-4 py-2">Kalah</th>
            </tr>
          </thead>
          <tbody>
            {playerTotals.map((p, i) => (
              <tr key={p.name} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">{p.name}</td>
                <td
                  className={`px-4 py-3 text-sm font-semibold text-right ${
                    p.total > 0 ? "text-green-600 dark:text-green-400" : p.total < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  {p.total > 0 ? `+${p.total.toLocaleString()}` : p.total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-slate-300">{p.played}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">{p.wins}</td>
                <td className="px-4 py-3 text-sm text-right text-red-500 dark:text-red-400">{p.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart - total P/L */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Total Profit/Loss per Player</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={playerTotals} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e5e7eb"} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }} />
            <Tooltip
              contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`, borderRadius: "8px" }}
              labelStyle={{ color: isDark ? "#e2e8f0" : "#111827" }}
              itemStyle={{ color: isDark ? "#94a3b8" : "#6b7280" }}
              formatter={(value) =>
                typeof value === "number"
                  ? value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString()
                  : value
              }
            />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
              label={false}
            >
              {playerTotals.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.total > 0 ? "#22c55e" : entry.total < 0 ? "#ef4444" : "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart - trend per session */}
      {trend.length > 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-4">Tren P/L per Session</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e5e7eb"} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#6b7280" }} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "#475569" : "#e5e7eb"}`, borderRadius: "8px" }}
                labelStyle={{ color: isDark ? "#e2e8f0" : "#111827" }}
                itemStyle={{ color: isDark ? "#94a3b8" : "#6b7280" }}
              />
              <Legend wrapperStyle={{ color: isDark ? "#94a3b8" : "#6b7280" }} />
              {playerNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
