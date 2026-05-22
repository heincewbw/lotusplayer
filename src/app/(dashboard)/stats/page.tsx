"use client"
import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
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
}

type TrendRow = Record<string, string | number>

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function StatsPage() {
  const [playerTotals, setPlayerTotals] = useState<PlayerTotal[]>([])
  const [trend, setTrend] = useState<TrendRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setPlayerTotals(data.playerTotals)
        setTrend(data.trend)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>

  if (playerTotals.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-slate-800 mb-4">Statistik</h1>
        <p className="text-slate-400 text-sm">Belum ada data session.</p>
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
      <h1 className="text-xl font-bold text-slate-100">Statistik</h1>

      {/* Ranking table */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-700">
          <h2 className="font-semibold text-slate-200 text-sm">Ranking All-Time</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2">Rank</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2">Player</th>
              <th className="text-right text-xs font-semibold text-slate-400 px-4 py-2">Total P/L</th>
              <th className="text-right text-xs font-semibold text-slate-400 px-4 py-2">Menang</th>
              <th className="text-right text-xs font-semibold text-slate-400 px-4 py-2">Kalah</th>
            </tr>
          </thead>
          <tbody>
            {playerTotals.map((p, i) => (
              <tr key={p.name} className="border-b border-slate-700 last:border-0">
                <td className="px-4 py-3 text-sm text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-100">{p.name}</td>
                <td
                  className={`px-4 py-3 text-sm font-semibold text-right ${
                    p.total > 0 ? "text-green-400" : p.total < 0 ? "text-red-400" : "text-slate-500"
                  }`}
                >
                  {p.total > 0 ? `+${p.total.toLocaleString()}` : p.total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-400">{p.wins}</td>
                <td className="px-4 py-3 text-sm text-right text-red-400">{p.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart - total P/L */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4">
        <h2 className="font-semibold text-slate-200 text-sm mb-4">Total Profit/Loss per Player</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={playerTotals} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#94a3b8" }}
              formatter={(value) =>
                typeof value === "number"
                  ? value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString()
                  : value
              }
            />
            <Bar
              dataKey="total"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              label={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart - trend per session */}
      {trend.length > 1 && (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4">
          <h2 className="font-semibold text-slate-200 text-sm mb-4">Tren P/L per Session</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#94a3b8" }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8" }} />
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
