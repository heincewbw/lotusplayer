"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

type Player = { id: number; name: string }
type RowData = { playerId: string; pl: string }

const MAX_ROWS = 9
const INIT_ROWS = 6

const emptyRow = (): RowData => ({ playerId: "", pl: "" })

function getPL(row: RowData): number | null {
  if (!row.pl) return null
  const v = parseInt(row.pl)
  return isNaN(v) ? null : v
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

// Searchable player picker
function PlayerPicker({
  value,
  onChange,
  players,
  usedIds,
}: {
  value: string
  onChange: (id: string) => void
  players: Player[]
  usedIds: number[]
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedName = value ? (players.find((p) => String(p.id) === value)?.name ?? "") : ""
  const displayValue = open ? query : selectedName

  const filtered = players.filter(
    (p) =>
      !usedIds.includes(p.id) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onOutsideClick)
    return () => document.removeEventListener("mousedown", onOutsideClick)
  }, [])

  function select(p: Player) {
    onChange(String(p.id))
    setQuery("")
    setOpen(false)
  }

  function clear() {
    onChange("")
    setQuery("")
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className="flex items-center h-full min-h-[40px]">
        <input
          type="text"
          value={displayValue}
          onFocus={() => { setOpen(true); setQuery("") }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          placeholder="Cari player..."
          autoComplete="off"
          className="flex-1 min-w-0 min-h-[40px] px-2 text-sm bg-transparent text-gray-900 dark:text-slate-100 focus:outline-none placeholder-gray-300 dark:placeholder-slate-600"
        />
        {value ? (
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); clear() }}
            className="flex-shrink-0 px-2 py-1 text-gray-400 dark:text-slate-500 text-xl leading-none select-none"
          >
            ×
          </button>
        ) : (
          <span className="flex-shrink-0 px-2 text-gray-300 dark:text-slate-600 text-sm select-none">▾</span>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-b-lg shadow-xl max-h-52 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onPointerDown={(e) => { e.preventDefault(); select(p) }}
                className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-slate-100 hover:bg-green-50 dark:hover:bg-slate-700 active:bg-green-100 border-b border-gray-100 dark:border-slate-700 last:border-0"
              >
                {p.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-gray-400 dark:text-slate-500">
              {query ? "Tidak ditemukan" : "Semua sudah dipilih"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type ParsedEntry = { rawName: string; pl: number }
type MappingEntry = { rawName: string; pl: number; selectedPlayerId: string }

function parseTextInput(text: string): ParsedEntry[] {
  const entries: ParsedEntry[] = []
  const regex = /([a-zA-Z][a-zA-Z0-9]*)\s*([+-]\s*[0-9]+|[0-9]+)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const rawName = match[1]
    const plStr = match[2].replace(/\s/g, "")
    const pl = parseInt(plStr, 10)
    if (!isNaN(pl)) entries.push({ rawName, pl })
  }
  return entries
}

export default function NewSessionPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [rows, setRows] = useState<RowData[]>(Array.from({ length: INIT_ROWS }, emptyRow))
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Text input states
  const [textModalOpen, setTextModalOpen] = useState(false)
  const [rawText, setRawText] = useState("")
  const [autoEntries, setAutoEntries] = useState<{ playerId: number; pl: number }[]>([])
  const [mappingEntries, setMappingEntries] = useState<MappingEntry[]>([])
  const [mappingModalOpen, setMappingModalOpen] = useState(false)

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then(setPlayers)
  }, [])

  function updateRow(i: number, field: keyof RowData, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  function toggleSign(i: number) {
    setRows((prev) => prev.map((r, idx) => {
      if (idx !== i) return r
      const val = r.pl
      if (val.startsWith("-")) return { ...r, pl: val.slice(1) }
      return { ...r, pl: val ? "-" + val : "-" }
    }))
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) return
    setRows((prev) => [...prev, emptyRow()])
  }

  function applyEntries(entries: { playerId: number; pl: number }[]) {
    const newRows: RowData[] = entries.slice(0, MAX_ROWS).map((e) => ({
      playerId: String(e.playerId),
      pl: String(e.pl),
    }))
    while (newRows.length < INIT_ROWS) newRows.push(emptyRow())
    setRows(newRows)
  }

  function processTextInput() {
    const parsed = parseTextInput(rawText)
    if (parsed.length === 0) return

    const auto: { playerId: number; pl: number }[] = []
    const unmatched: MappingEntry[] = []

    for (const entry of parsed) {
      const found = players.find((p) => p.name.toLowerCase() === entry.rawName.toLowerCase())
      if (found) {
        auto.push({ playerId: found.id, pl: entry.pl })
      } else {
        unmatched.push({ rawName: entry.rawName, pl: entry.pl, selectedPlayerId: "" })
      }
    }

    setAutoEntries(auto)
    setTextModalOpen(false)

    if (unmatched.length > 0) {
      setMappingEntries(unmatched)
      setMappingModalOpen(true)
    } else {
      applyEntries(auto)
      setRawText("")
    }
  }

  function applyMappings() {
    const allEntries = [
      ...autoEntries,
      ...mappingEntries
        .filter((e) => e.selectedPlayerId)
        .map((e) => ({ playerId: parseInt(e.selectedPlayerId), pl: e.pl })),
    ]
    applyEntries(allEntries)
    setMappingModalOpen(false)
    setMappingEntries([])
    setAutoEntries([])
    setRawText("")
  }

  const filledRows = rows.filter((r) => r.playerId && getPL(r) !== null)

  const balance = rows.reduce((sum, row) => {
    const pl = getPL(row)
    return pl !== null ? sum + pl : sum
  }, 0)

  const totalMain = rows.reduce((sum, row) => {
    const pl = getPL(row)
    return pl !== null && pl > 0 ? sum + pl : sum
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
      .filter((row) => row.playerId && getPL(row) !== null)
      .map((row) => {
        const pl = parseInt(row.pl)
        return { playerId: parseInt(row.playerId), rowNumber: row.rowNumber, pl }
      })

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, notes: notes || null, entries }),
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

  function usedPlayerIds(currentIdx: number) {
    return rows
      .filter((_, i) => i !== currentIdx && _.playerId)
      .map((r) => parseInt(r.playerId))
  }

  return (
    <div className="pb-24 sm:pb-0">

      <form id="new-session-form" onSubmit={handleSubmit}>
        {/* Session table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Session header row */}
          <div className="grid grid-cols-2 border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
            <div className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200 text-sm border-r border-gray-200 dark:border-slate-600 flex items-center">
              Tanggal
            </div>
            <div className="px-4 py-2 flex items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm text-gray-800 dark:text-slate-200 font-medium bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1 min-h-[40px]"
                required
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2rem_minmax(0,1fr)_7rem] border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
            <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-600">#</div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-600">Nama Player</div>
            <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 text-right">P/L</div>
          </div>

          {/* Data rows */}
          {rows.map((row, i) => {
            const pl = getPL(row)
            const used = usedPlayerIds(i)
            return (
              <div key={i} className="grid grid-cols-[2rem_minmax(0,1fr)_7rem] border-b border-gray-100 dark:border-slate-700 last:border-0 min-h-[40px]">
                <div className="text-xs text-gray-400 dark:text-slate-500 text-center border-r border-gray-100 dark:border-slate-700 flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="border-r border-gray-100 dark:border-slate-700 overflow-visible">
                  <PlayerPicker
                    value={row.playerId}
                    onChange={(id) => updateRow(i, "playerId", id)}
                    players={players}
                    usedIds={used}
                  />
                </div>
                <div className="flex items-stretch">
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); toggleSign(i) }}
                    className={`flex-shrink-0 w-9 text-xs font-bold border-r border-gray-100 dark:border-slate-700 select-none active:opacity-75 ${
                      row.pl.startsWith("-")
                        ? "text-white bg-red-500 dark:bg-red-600"
                        : "text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800"
                    }`}
                  >
                    (-)
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
                    className={`flex-1 min-w-0 px-1 text-sm text-right bg-white dark:bg-slate-800 focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-700 font-medium ${
                      pl === null ? "text-gray-900 dark:text-slate-100" : pl > 0 ? "text-green-600 dark:text-green-400" : pl < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>
            )
          })}

          {/* Add row button */}
          {rows.length < MAX_ROWS && (
            <div className="border-b border-gray-100 dark:border-slate-700 last:border-0">
              <button
                type="button"
                onClick={addRow}
                className="w-full py-3 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors flex items-center justify-center gap-1 active:opacity-75"
              >
                <span className="text-base font-bold">+</span> Tambah Baris
              </button>
            </div>
          )}

          {/* Balance + Total footer */}
          <div className="grid grid-cols-[2.5rem_1fr_7rem] bg-gray-50 dark:bg-slate-700 border-t-2 border-gray-200 dark:border-slate-600">
            <div className="col-span-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 text-right border-r border-gray-200 dark:border-slate-600">
              Balance
            </div>
            <div className="px-2 py-2 flex items-center justify-end">
              <span className={`text-sm font-bold ${isBalanced ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                {isBalanced ? "0 ✓" : fmt(balance)}
              </span>
            </div>
          </div>
          {totalMain > 0 && (
            <div className="grid grid-cols-[2.5rem_1fr_7rem] bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
              <div className="col-span-2 px-4 py-2 text-xs text-gray-500 dark:text-slate-400 text-right border-r border-gray-200 dark:border-slate-600">
                Total Main
              </div>
              <div className="px-2 py-2 flex items-center justify-end">
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">{totalMain.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes / Catatan */}
        <div className="mt-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan — lokasi, keterangan, dll (opsional)"
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Validation messages */}
        <div className="mt-3 space-y-1">
          {filledRows.length < 2 && (
            <p className="text-gray-400 dark:text-slate-500 text-xs">Minimal 2 player harus diisi</p>
          )}
          {filledRows.length >= 2 && !isBalanced && (
            <p className="text-red-500 dark:text-red-400 text-xs">
              ⚠ Balance harus 0 sebelum bisa submit. Selisih: {fmt(balance)}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Desktop submit buttons */}
        <div className="mt-4 hidden sm:flex gap-3 items-center">
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
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 px-4 py-2.5"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => setTextModalOpen(true)}
            className="ml-auto flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 px-3 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors active:opacity-75"
          >
            <span className="text-base leading-none">⌨</span> Input Teks
          </button>
        </div>
      </form>

      {/* Mobile sticky bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 z-20 shadow-lg">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-slate-400">Balance</p>
          <p className={`text-sm font-bold leading-tight ${isBalanced ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
            {isBalanced ? "0 ✓" : fmt(balance)}
          </p>
          {totalMain > 0 && (
            <p className="text-xs text-gray-400 dark:text-slate-500 leading-tight">Total: {totalMain.toLocaleString()}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 dark:text-slate-400 px-3 py-2.5"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => setTextModalOpen(true)}
          className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 px-3 py-2 rounded-lg active:opacity-75"
        >
          <span className="leading-none">⌨</span>
        </button>
        <button
          type="submit"
          form="new-session-form"
          disabled={!canSubmit || submitting}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:bg-green-800"
        >
          {submitting ? "..." : "Submit"}
        </button>
      </div>

      {/* Text Input Modal */}
      {textModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-1">Input Teks</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
              Tempel teks hasil sesi. Contoh: <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">philip -6000</code> atau <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">john -700  hk-5300</code>
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
              placeholder={"philip -6000\njohn -700  hk-5300\nedy +4000\nwilly +6000"}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              autoFocus
            />
            <div className="mt-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setTextModalOpen(false); setRawText("") }}
                className="text-sm text-gray-500 dark:text-slate-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={processTextInput}
                disabled={!rawText.trim()}
                className="text-sm font-semibold bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
              >
                Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Mapping Modal */}
      {mappingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90dvh] overflow-y-auto">
            <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-1">Cocokkan Nama Player</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Nama berikut tidak ditemukan di database. Pilih player yang sesuai atau biarkan kosong untuk melewati.
            </p>
            <div className="space-y-3">
              {mappingEntries.map((entry, i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                      &quot;{entry.rawName}&quot;
                    </span>
                    <span className={`text-sm font-bold ${entry.pl > 0 ? "text-green-600 dark:text-green-400" : entry.pl < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400"}`}>
                      {entry.pl > 0 ? `+${entry.pl.toLocaleString()}` : entry.pl.toLocaleString()}
                    </span>
                  </div>
                  <select
                    value={entry.selectedPlayerId}
                    onChange={(e) => {
                      const val = e.target.value
                      setMappingEntries((prev) => prev.map((m, idx) => idx === i ? { ...m, selectedPlayerId: val } : m))
                    }}
                    className="w-full text-sm bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg px-3 py-2 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">— Lewati —</option>
                    {players.map((p) => (
                      <option key={p.id} value={String(p.id)}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setMappingModalOpen(false); setMappingEntries([]); setAutoEntries([]); setTextModalOpen(true) }}
                className="text-sm text-gray-500 dark:text-slate-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={applyMappings}
                className="text-sm font-semibold bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
