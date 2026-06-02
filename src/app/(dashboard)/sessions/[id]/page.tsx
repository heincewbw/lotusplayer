"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"

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
  const { data: authSession } = useSession()
  const isAdmin = authSession?.user?.role === "admin"

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then(setSession)
  }, [id])

  if (!session) return <p className="text-gray-400 dark:text-slate-500 text-sm">Loading...</p>

  return (
    <div>
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Detail Session</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{formatDate(session.date)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Link
              href={`/sessions/${session.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
            >
              Edit
            </Link>
          )}
          <Link
            href={`/result/${session.id}`}
            className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800"
          >
            Lihat Hasil
          </Link>
          <Link
            href="/sessions"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2.5"
          >
            ← Kembali
          </Link>
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="mb-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400">
          📝 {session.notes}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_6rem] border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <div className="px-2 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-600">#</div>
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-600">Nama Player</div>
          <div className="px-2 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 text-right">Profit/Loss</div>
        </div>

        {session.entries.map((e, i) => {
          const pl = e.sisa - e.ambil
          return (
            <div
              key={i}
              className="grid grid-cols-[2.5rem_1fr_6rem] border-b border-gray-100 dark:border-slate-700 last:border-0 min-h-[44px]"
            >
              <div className="px-2 py-3 text-xs text-gray-400 dark:text-slate-500 text-center border-r border-gray-100 dark:border-slate-700 flex items-center justify-center">{e.rowNumber}</div>
              <div className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100 border-r border-gray-100 dark:border-slate-700 flex items-center">{e.player.name}</div>
              <div className={`px-2 py-3 text-sm font-semibold text-right flex items-center justify-end ${pl > 0 ? "text-green-600 dark:text-green-400" : pl < 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-slate-500"}`}>
                {fmt(pl)}
              </div>
            </div>
          )
        })}

        {/* Balance footer */}
        <div className="grid grid-cols-[2.5rem_1fr_6rem] bg-gray-50 dark:bg-slate-700 border-t-2 border-gray-200 dark:border-slate-600">
          <div className="col-span-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 text-right border-r border-gray-200 dark:border-slate-600">
            Balance
          </div>
          <div className="px-2 py-3 text-sm font-bold text-green-600 dark:text-green-400 text-right">0</div>
        </div>
      </div>
    </div>
  )
}
