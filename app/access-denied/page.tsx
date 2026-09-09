import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <ShieldX size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-slate-950">アクセスできません</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          このアカウントには利用権限がありません
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          ログイン画面へ戻る
        </Link>
      </section>
    </main>
  );
}
