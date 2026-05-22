"use client"
import Link from "next/link"

type Entry = {
  rowNumber: number
  ambil: number
  sisa: number
  player: { name: string }
}

type Session = {
  id: number
  date: Date | string
  entries: Entry[]
}

function formatDate(dateStr: Date | string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

export default function ResultView({ session }: { session: Session }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-start pt-8 px-4">
      <div className="w-full max-w-md">
        {/* Print-friendly table */}
        <div className="border-2 border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
          {/* Session header */}
          <div className="grid grid-cols-2 border-b-2 border-gray-300 dark:border-slate-600">
            <div className="px-4 py-3 font-bold text-gray-800 dark:text-slate-200 border-r-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
              Session
            </div>
            <div className="px-4 py-3 font-bold text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-slate-800">
              {formatDate(session.date)}
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] border-b border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
            <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-600">#</div>
            <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-600">Nama Player</div>
            <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 text-right border-r border-gray-200 dark:border-slate-600">Ambil</div>
            <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 text-right border-r border-gray-200 dark:border-slate-600">Sisa</div>
            <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 text-right">Profit/Loss</div>
          </div>

          {/* All 9 rows (filled + empty) */}
          {Array.from({ length: 9 }, (_, i) => {
            const entry = session.entries.find((e) => e.rowNumber === i + 1)
            const pl = entry ? entry.sisa - entry.ambil : null
            return (
              <div
                key={i}
                className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] border-b border-gray-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800"
              >
                <div className="px-2 py-2.5 text-xs text-gray-400 dark:text-slate-500 text-center border-r border-gray-100 dark:border-slate-700">
                  {i + 1}
                </div>
                <div className="px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-slate-100 border-r border-gray-100 dark:border-slate-700">
                  {entry?.player.name ?? ""}
                </div>
                <div className="px-2 py-2.5 text-sm text-right text-gray-700 dark:text-slate-300 border-r border-gray-100 dark:border-slate-700">
                  {entry ? entry.ambil.toLocaleString() : ""}
                </div>
                <div className="px-2 py-2.5 text-sm text-right text-gray-700 dark:text-slate-300 border-r border-gray-100 dark:border-slate-700">
                  {entry ? entry.sisa.toLocaleString() : ""}
                </div>
                <div
                  className={`px-2 py-2.5 text-sm font-semibold text-right ${
                    pl !== null
                      ? pl > 0
                        ? "text-green-600 dark:text-green-400"
                        : pl < 0
                        ? "text-red-500 dark:text-red-400"
                        : "text-gray-400 dark:text-slate-500"
                      : ""
                  }`}
                >
                  {pl !== null ? fmt(pl) : ""}
                </div>
              </div>
            )
          })}

          {/* Balance footer */}
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] border-t-2 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
            <div className="col-span-4 px-4 py-3 text-sm font-bold text-gray-700 dark:text-slate-300 text-right border-r border-gray-200 dark:border-slate-600">
              Balance
            </div>
            <div className="px-2 py-3 text-sm font-bold text-gray-700 dark:text-slate-300 text-right">
              0
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3 justify-center print:hidden">
          <Link
            href="/sessions/new"
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Session Baru
          </Link>
          <Link
            href="/sessions"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg"
          >
            Riwayat
          </Link>
        </div>
      </div>
    </div>
  )
}
