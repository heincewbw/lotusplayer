"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Player = { id: number; name: string }
type InputMode = "ambilsisa" | "plusminus"
type RowData = { playerId: string; ambil: string; sisa: string; pl: string }

const emptyRow = (): RowData => ({ playerId: "", ambil: "", sisa: "", pl: "" })
const NUM_ROWS = 9

function getPL(row: RowData, mode: InputMode): number | null {
  if (mode === "plusminus") {
    if (!row.pl) return null
    const v = parseInt(row.pl)
    return isNaN(v) ? null : v
  }
  if (!row.ambil || !row.sisa) return null
  const a = parseInt(row.ambil)
  const s = parseInt(row.sisa)
  if (isNaN(a) || isNaN(s)) return null
  return s - a
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

export default function NewSessionPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [inputMode, setInputMode] = useState<InputMode>("ambilsisa")
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [rows, setRows] = useState<RowData[]>(Array.from({ length: NUM_ROWS }, emptyRow))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then(setPlayers)
  }, [])

  function updateRow(i: number, field: keyof RowData, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  function switchMode(mode: InputMode) {
    setInputMode(mode)
    setRows(Array.from({ length: NUM_ROWS }, emptyRow))
  }

  const filledRows = rows.filter((r) => {
    if (inputMode === "plusminus") return r.playerId && r.pl !== ""
    return r.playerId && r.ambil && r.sisa
  })

  const balance = rows.reduce((sum, row) => {
    const pl = getPL(row, inputMode)
    return pl !== null ? sum + pl : sum
  }, 0)

  const isBalanced = balance === 0
  const canSubmit = filledRows.length >= 2 && isBalanced

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError("")

    const entries = rows
      .map((row, i) => ({ ...row, rowNumber: i + 1 }))
      .filter((row) => {
        if (inputMode === "plusminus") return row.playerId && row.pl !== ""
        return row.playerId && row.ambil && row.sisa
      })
      .map((row) => {
        if (inputMode === "plusminus") {
          const pl = parseInt(row.pl)
          const ambil = pl < 0 ? -pl : 0
          const sisa = pl > 0 ? pl : 0
          return { playerId: parseInt(row.playerId), rowNumber: row.rowNumber, ambil, sisa }
        }
        return {
          playerId: parseInt(row.playerId),
          rowNumber: row.rowNumber,
          ambil: parseInt(row.ambil),
          sisa: parseInt(row.sisa),
        }
      })

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, entries }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Gagal menyimpan session")
      setSubmitting(false)
      return
    }

    const data = await res.json()
    router.push(`/result/${data.id}`)
  }

  // Get list of player IDs already selected in other rows
  function usedPlayerIds(currentIdx: number) {
    return rows
      .filter((_, i) => i !== currentIdx && _.playerId)
      .map((r) => parseInt(r.playerId))
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Session Baru</h1>

      {/* Input mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => switchMode("ambilsisa")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "ambilsisa"
              ? "bg-green-600 text-white"
              : "bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Chip Buy / Chip Sisa
        </button>
        <button
          type="button"
          onClick={() => switchMode("plusminus")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "plusminus"
              ? "bg-green-600 text-white"
              : "bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600"
          }`}
        >
          +/- Langsung
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Session table */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
          {/* Session header row */}
          <div className="grid grid-cols-2 border-b border-slate-600 bg-slate-700">
            <div className="px-4 py-3 font-semibold text-slate-200 text-sm border-r border-slate-600">
              Session
            </div>
            <div className="px-4 py-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm text-slate-200 font-medium bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1"
                required
              />
            </div>
          </div>

          {/* Column headers */}
          {inputMode === "ambilsisa" ? (
            <div className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] border-b border-slate-600 bg-slate-700">
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 text-center border-r border-slate-600">#</div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-r border-slate-600">Nama Player</div>
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 text-right border-r border-slate-600">Chip Buy</div>
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 text-right border-r border-slate-600">Chip Sisa</div>
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 text-right">Profit/Loss</div>
            </div>
          ) : (
            <div className="grid grid-cols-[2rem_1fr_8rem] border-b border-slate-600 bg-slate-700">
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 text-center border-r border-slate-600">#</div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-r border-slate-600">Nama Player</div>
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 text-right">Profit / Loss</div>
            </div>
          )}

          {/* Data rows */}
          {rows.map((row, i) => {
            const pl = getPL(row, inputMode)
            const used = usedPlayerIds(i)
            if (inputMode === "plusminus") {
              return (
                <div key={i} className="grid grid-cols-[2rem_1fr_8rem] border-b border-slate-700 last:border-0">
                  <div className="px-2 py-2 text-xs text-slate-500 text-center border-r border-slate-700 flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="border-r border-slate-700">
                    <select
                      value={row.playerId}
                      onChange={(e) => updateRow(i, "playerId", e.target.value)}
                      className="w-full h-full px-2 py-2 text-sm bg-slate-800 text-slate-100 focus:outline-none focus:bg-slate-700"
                    >
                      <option value=""></option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id} disabled={used.includes(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={row.pl}
                      onChange={(e) => updateRow(i, "pl", e.target.value)}
                      className={`w-full px-2 py-2 text-sm text-right bg-slate-800 focus:outline-none focus:bg-slate-700 font-medium ${
                        pl === null ? "text-slate-100" : pl > 0 ? "text-green-400" : pl < 0 ? "text-red-400" : "text-slate-500"
                      }`}
                      placeholder="0"
                    />
                  </div>
                </div>
              )
            }
            return (
              <div
                key={i}
                className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] border-b border-slate-700 last:border-0"
              >
                <div className="px-2 py-2 text-xs text-slate-500 text-center border-r border-slate-700 flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="border-r border-slate-700">
                  <select
                    value={row.playerId}
                    onChange={(e) => updateRow(i, "playerId", e.target.value)}
                    className="w-full h-full px-2 py-2 text-sm bg-slate-800 text-slate-100 focus:outline-none focus:bg-slate-700"
                  >
                    <option value=""></option>
                    {players.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={used.includes(p.id)}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="border-r border-slate-700">
                  <input
                    type="number"
                    value={row.ambil}
                    onChange={(e) => updateRow(i, "ambil", e.target.value)}
                    className="w-full px-2 py-2 text-sm text-right bg-slate-800 text-slate-100 focus:outline-none focus:bg-slate-700"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="border-r border-slate-700">
                  <input
                    type="number"
                    value={row.sisa}
                    onChange={(e) => updateRow(i, "sisa", e.target.value)}
                    className="w-full px-2 py-2 text-sm text-right bg-slate-800 text-slate-100 focus:outline-none focus:bg-slate-700"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-center justify-end px-2 py-2">
                  {pl !== null ? (
                    <span
                      className={`text-sm font-medium ${
                        pl > 0 ? "text-green-400" : pl < 0 ? "text-red-400" : "text-slate-500"
                      }`}
                    >
                      {fmt(pl)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Balance footer row */}
          {inputMode === "ambilsisa" ? (
            <div className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] bg-slate-700 border-t-2 border-slate-600">
              <div className="col-span-4 px-4 py-3 text-sm font-semibold text-slate-300 text-right border-r border-slate-600">
                Balance
              </div>
              <div className="px-2 py-3 flex items-center justify-end">
                <span className={`text-sm font-bold ${isBalanced ? "text-green-400" : "text-red-400"}`}>
                  {isBalanced ? "0 ✓" : fmt(balance)}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[2rem_1fr_8rem] bg-slate-700 border-t-2 border-slate-600">
              <div className="col-span-2 px-4 py-3 text-sm font-semibold text-slate-300 text-right border-r border-slate-600">
                Balance
              </div>
              <div className="px-2 py-3 flex items-center justify-end">
                <span className={`text-sm font-bold ${isBalanced ? "text-green-400" : "text-red-400"}`}>
                  {isBalanced ? "0 ✓" : fmt(balance)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Validation messages */}
        <div className="mt-3 space-y-1">
          {filledRows.length < 2 && (
            <p className="text-slate-500 text-xs">Minimal 2 player harus diisi</p>
          )}
          {filledRows.length >= 2 && !isBalanced && (
            <p className="text-red-400 text-xs">
              ⚠ Balance harus 0 sebelum bisa submit. Selisih: {fmt(balance)}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-2 text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Submit */}
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Menyimpan..." : "Submit Session"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2.5"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
