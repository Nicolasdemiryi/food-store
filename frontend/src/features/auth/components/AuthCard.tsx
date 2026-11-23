import type { ReactNode } from 'react'

export function AuthCard({ titulo, subtitulo, children, pie }: { titulo: string; subtitulo: string; children: ReactNode; pie: ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-lg">
        <p className="text-center text-4xl" aria-hidden="true">
          🍔
        </p>
        <h1 className="mt-2 text-center text-2xl font-extrabold">{titulo}</h1>
        <p className="mb-6 text-center text-sm text-stone-500">{subtitulo}</p>
        {children}
        <p className="mt-6 text-center text-sm text-stone-600">{pie}</p>
      </div>
    </main>
  )
}
