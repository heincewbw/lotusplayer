"use client"
import Link from "next/link"

type Entry = {
  rowNumber: number
  pl: number
  player: { name: string }
}

type Session = {
  id: number
  date: Date | string
  notes?: string | null
  entries: Entry[]
}

function formatDate(dateStr: Date | string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
}

function fmt(n: number) {
  return n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString()
}

function buildWhatsAppText(session: Session): string {
  const date = formatDate(session.date)
  const rows = session.entries
    .slice()
    .sort((a, b) => a.rowNumber - b.rowNumber)
    .map((e) => {
      const pl = e.pl
      return `${e.player.name}: ${fmt(pl)}`
    })
  const lines: string[] = [
    `🃏 *Lotus — ${date}*`,
    `─────────────────`,
    ...rows,
    `─────────────────`,
    `Balance: 0 ✓`,
  ]
  if (session.notes) lines.push(`📝 ${session.notes}`)
  return lines.join("\n")
}

export default function ResultView({ session }: { session: Session }) {
  function shareWA() {
    const text = buildWhatsAppText(session)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-start pt-6 px-4 pb-8">
      <div className="w-full max-w-sm">
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
          <div className="grid grid-cols-[2.5rem_1fr_6rem] border-b border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
            <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 text-center border-r border-gray-200 dark:border-slate-600">#</div>
            <div className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-600">Nama Player</div>
            <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-slate-400 text-right">Profit/Loss</div>
          </div>

          {/* All 9 rows (filled + empty) */}
          {Array.from({ length: 9 }, (_, i) => {
            const entry = session.entries.find((e) => e.rowNumber === i + 1)
            const pl = entry ? entry.pl : null
            return (
              <div
                key={i}
                className="grid grid-cols-[2.5rem_1fr_6rem] border-b border-gray-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800 min-h-[40px]"
              >
                <div className="px-2 py-2.5 text-xs text-gray-400 dark:text-slate-500 text-center border-r border-gray-100 dark:border-slate-700 flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-slate-100 border-r border-gray-100 dark:border-slate-700 flex items-center">
                  {entry?.player.name ?? ""}
                </div>
                <div
                  className={`px-2 py-2.5 text-sm font-semibold text-right flex items-center justify-end ${
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

          {/* Balance + Total footer */}
          <div className="grid grid-cols-[2.5rem_1fr_6rem] border-t-2 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
            <div className="col-span-2 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-slate-300 text-right border-r border-gray-200 dark:border-slate-600">
              Balance
            </div>
            <div className="px-2 py-2.5 text-sm font-bold text-gray-700 dark:text-slate-300 text-right">
              0
            </div>
          </div>
          {(() => {
            const totalMain = session.entries.reduce((sum, e) => {
              const pl = e.pl
              return pl > 0 ? sum + pl : sum
            }, 0)
            return totalMain > 0 ? (
              <div className="grid grid-cols-[2.5rem_1fr_6rem] border-t border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
                <div className="col-span-2 px-4 py-2 text-xs text-gray-500 dark:text-slate-400 text-right border-r border-gray-200 dark:border-slate-600">
                  Total Main
                </div>
                <div className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 text-right">
                  {totalMain.toLocaleString()}
                </div>
              </div>
            ) : null
          })()}
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="mt-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400">
            📝 {session.notes}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex flex-col gap-2 print:hidden">
          {/* WhatsApp share */}
          <button
            type="button"
            onClick={shareWA}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a84f] text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share ke WhatsApp
          </button>

          <div className="flex gap-2">
            <Link
              href="/sessions/new"
              className="flex-1 text-center bg-green-600 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800"
            >
              Session Baru
            </Link>
            <Link
              href="/sessions"
              className="flex-1 text-center text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg"
            >
              Riwayat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
