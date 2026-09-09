import { BarChart3, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import LoginButton from "@/components/LoginButton";
import { authOptions } from "@/auth-options";
import { findDashboardUser } from "@/lib/auth-users";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

function safeCallbackUrl(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email && findDashboardUser(session.user.email)) redirect("/");

  const query = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <BarChart3 size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">営業実績管理</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          登録済みのGoogleアカウントでログインしてください。
        </p>
        <LoginButton callbackUrl={safeCallbackUrl(query.callbackUrl)} />
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          ログイン以外のGoogle Drive・Google Sheets権限は要求しません。
        </div>
      </section>
    </main>
  );
}
