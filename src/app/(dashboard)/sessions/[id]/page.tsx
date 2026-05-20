"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

type Entry = {
  player: { name: string }
  rowNumber: number
  ambil: number
  sisa: number
}

type Session = {
  id: number
  date: string
  notes: string | null
  entries: Entry[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

export default function SessionDetailPage() {
  const { id } = useParams()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then(setSession)
  }, [id])

  if (!session) return <p className="text-slate-400 text-sm">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Detail Session</h1>
          <p className="text-slate-500 text-sm">{formatDate(session.date)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/result/${session.id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Lihat Hasil
          </Link>
          <Link
            href="/sessions"
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
          >
            ← Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] border-b border-slate-200 bg-slate-50">
          <div className="px-2 py-3 text-xs font-semibold text-slate-500 text-center border-r border-slate-200">#</div>
          <div className="px-4 py-3 text-xs font-semibold text-slate-500 border-r border-slate-200">Nama Player</div>
          <div className="px-2 py-3 text-xs font-semibold text-slate-500 text-right border-r border-slate-200">Ambil</div>
          <div className="px-2 py-3 text-xs font-semibold text-slate-500 text-right border-r border-slate-200">Sisa</div>
          <div className="px-2 py-3 text-xs font-semibold text-slate-500 text-right">Profit/Loss</div>
        </div>

        {session.entries.map((e, i) => {
          const pl = e.sisa - e.ambil
          return (
            <div
              key={i}
              className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] border-b border-slate-100 last:border-0"
            >
              <div className="px-2 py-3 text-xs text-slate-400 text-center border-r border-slate-100">{e.rowNumber}</div>
              <div className="px-4 py-3 text-sm font-medium text-slate-800 border-r border-slate-100">{e.player.name}</div>
              <div className="px-2 py-3 text-sm text-right text-slate-600 border-r border-slate-100">{e.ambil.toLocaleString()}</div>
              <div className="px-2 py-3 text-sm text-right text-slate-600 border-r border-slate-100">{e.sisa.toLocaleString()}</div>
              <div className={`px-2 py-3 text-sm font-medium text-right ${pl > 0 ? "text-green-600" : pl < 0 ? "text-red-500" : "text-slate-400"}`}>
                {fmt(pl)}
              </div>
            </div>
          )
        })}

        {/* Balance footer */}
        <div className="grid grid-cols-[2rem_1fr_7rem_7rem_7rem] bg-slate-50 border-t-2 border-slate-300">
          <div className="col-span-4 px-4 py-3 text-sm font-semibold text-slate-600 text-right border-r border-slate-200">
            Balance
          </div>
          <div className="px-2 py-3 text-sm font-bold text-green-600 text-right">0</div>
        </div>
      </div>
    </div>
  )
}
