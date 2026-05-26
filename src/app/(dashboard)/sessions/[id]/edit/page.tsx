"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

type Player = { id: number; name: string }
type InputMode = "ambilsisa" | "plusminus"
type RowData = { playerId: string; ambil: string; sisa: string; pl: string }

type EntryDetail = {
  player: { id: number; name: string }
  rowNumber: number
  ambil: number
  sisa: number
}

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

export default function EditSessionPage() {
  const router = useRouter()
  const { id } = useParams()
  const [players, setPlayers] = useState<Player[]>([])
  const [inputMode, setInputMode] = useState<InputMode>("ambilsisa")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [rows, setRows] = useState<RowData[]>(Array.from({ length: NUM_ROWS }, emptyRow))
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/players").then((r) => r.json()),
      fetch(`/api/sessions/${id}`).then((r) => r.json()),
    ]).then(([playersData, sessionData]) => {
      setPlayers(playersData)
      setDate(sessionData.date.split("T")[0])
      setNotes(sessionData.notes ?? "")
      const newRows = Array.from({ length: NUM_ROWS }, emptyRow)
      for (const e of (sessionData.entries as EntryDetail[])) {
        const idx = e.rowNumber - 1
        if (idx >= 0 && idx < NUM_ROWS) {
          newRows[idx] = {
            playerId: String(e.player.id),
            ambil: String(e.ambil),
            sisa: String(e.sisa),
            pl: "",
          }
        }
      }
      setRows(newRows)
      setLoading(false)
    })
  }, [id])

  function updateRow(i: number, field: keyof RowData, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  function switchMode(mode: InputMode) {
    setInputMode(mode)
    setRows(Array.from({ length: NUM_ROWS }, emptyRow))
  }

  function toggleSign(i: number) {
    setRows((prev) => prev.map((r, idx) => {
      if (idx !== i) return r
      const val = r.pl
      if (val.startsWith("-")) return { ...r, pl: val.slice(1) }
      return { ...r, pl: val ? "-" + val : "-" }
    }))
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

    const res = await fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, notes, entries }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Gagal menyimpan perubahan")
      setSubmitting(false)
      return
    }

    router.push(`/sessions/${id}`)
  }

  function usedPlayerIds(currentIdx: number) {
    return rows
      .filter((_, i) => i !== currentIdx && _.playerId)
      .map((r) => parseInt(r.playerId))
  }

  if (loading) return <p className="text-gray-400 dark:text-slate-500 text-sm">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Edit Session</h1>
        <Link
          href={`/sessions/${id}`}
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2"
        >
          ← Batal
        </Link>
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => switchMode("plusminus")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "plusminus"
              ? "bg-green-600 text-white"
              : "bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          +/- Langsung
        </button>
        <button
          type="button"
          onClick={() => switchMode("ambilsisa")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "ambilsisa"
              ? "bg-green-600 text-white"
              : "bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          Chip Buy / Chip Sisa
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-4">
          {/* Session header row */}
          <div className="grid grid-cols-2 border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
            <div className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200 text-sm border-r border-gray-200 dark:border-slate-600">
              Session
            </div>
            <div className="px-4 py-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm text-gray-800 dark:text-slate-200 font-medium bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1"
                required
              />
            </div>
          </div>

          {/* Column headers */}
          {inputMode === "ambilsisa" ? (
            <div className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-600">#</div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-600">Nama Player</div>
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-right border-r border-gray-200 dark:border-slate-600">Chip Buy</div>
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-right border-r border-gray-200 dark:border-slate-600">Chip Sisa</div>
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-right">Profit/Loss</div>
            </div>
          ) : (
            <div className="grid grid-cols-[2rem_1fr_8rem] border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-600">#</div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-600">Nama Player</div>
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-right">Profit / Loss</div>
            </div>
          )}

          {/* Data rows */}
          {rows.map((row, i) => {
            const pl = getPL(row, inputMode)
            const used = usedPlayerIds(i)
            if (inputMode === "plusminus") {
              return (
                <div key={i} className="grid grid-cols-[2rem_1fr_8rem] border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <div className="px-2 py-2 text-xs text-gray-400 dark:text-slate-500 text-center border-r border-gray-100 dark:border-slate-700 flex items-center justify-center">{i + 1}</div>
                  <div className="border-r border-gray-100 dark:border-slate-700">
                    <select
                      value={row.playerId}
                      onChange={(e) => updateRow(i, "playerId", e.target.value)}
                      className="w-full h-full px-2 py-2 text-sm bg-white text-gray-900 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700"
                    >
                      <option value=""></option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id} disabled={used.includes(p.id)}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onPointerDown={(e) => { e.preventDefault(); toggleSign(i) }}
                      className={`flex-shrink-0 w-8 h-full py-2 text-base font-bold border-r border-gray-100 dark:border-slate-700 select-none ${
                        row.pl.startsWith("-")
                          ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                          : "text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800"
                      }`}
                    >
                      −
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.pl.startsWith("-") ? row.pl.slice(1) : row.pl}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "")
                        const isNeg = row.pl.startsWith("-")
                        updateRow(i, "pl", isNeg ? (digits ? "-" + digits : "-") : digits)
                      }}
                      className={`flex-1 min-w-0 px-2 py-2 text-sm text-right bg-white dark:bg-slate-800 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700 font-medium ${
                        pl === null ? "text-gray-900 dark:text-slate-100" : pl > 0 ? "text-green-600 dark:text-green-400" : pl < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"
                      }`}
                      placeholder="0"
                    />
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] border-b border-gray-100 dark:border-slate-700 last:border-0">
                <div className="px-2 py-2 text-xs text-gray-400 dark:text-slate-500 text-center border-r border-gray-100 dark:border-slate-700 flex items-center justify-center">{i + 1}</div>
                <div className="border-r border-gray-100 dark:border-slate-700">
                  <select
                    value={row.playerId}
                    onChange={(e) => updateRow(i, "playerId", e.target.value)}
                    className="w-full h-full px-2 py-2 text-sm bg-white text-gray-900 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700"
                  >
                    <option value=""></option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id} disabled={used.includes(p.id)}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="border-r border-gray-100 dark:border-slate-700">
                  <input
                    type="number"
                    value={row.ambil}
                    onChange={(e) => updateRow(i, "ambil", e.target.value)}
                    className="w-full px-2 py-2 text-sm text-right bg-white text-gray-900 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="border-r border-gray-100 dark:border-slate-700">
                  <input
                    type="number"
                    value={row.sisa}
                    onChange={(e) => updateRow(i, "sisa", e.target.value)}
                    className="w-full px-2 py-2 text-sm text-right bg-white text-gray-900 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-center justify-end px-2 py-2">
                  {pl !== null ? (
                    <span className={`text-sm font-medium ${pl > 0 ? "text-green-600 dark:text-green-400" : pl < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"}`}>
                      {fmt(pl)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Balance footer row */}
          {inputMode === "ambilsisa" ? (
            <div className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] bg-gray-50 dark:bg-slate-700 border-t-2 border-gray-200 dark:border-slate-600">
              <div className="col-span-4 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 text-right border-r border-gray-200 dark:border-slate-600">Balance</div>
              <div className="px-2 py-3 flex items-center justify-end">
                <span className={`text-sm font-bold ${isBalanced ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {isBalanced ? "0 ✓" : fmt(balance)}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[2rem_1fr_8rem] bg-gray-50 dark:bg-slate-700 border-t-2 border-gray-200 dark:border-slate-600">
              <div className="col-span-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 text-right border-r border-gray-200 dark:border-slate-600">Balance</div>
              <div className="px-2 py-3 flex items-center justify-end">
                <span className={`text-sm font-bold ${isBalanced ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {isBalanced ? "0 ✓" : fmt(balance)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Catatan (opsional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Tambahkan catatan..."
            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  )
}
