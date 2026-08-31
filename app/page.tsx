import KpiCard from "@/components/KpiCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">
        ダッシュボード
      </h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="今月実績"
          value="27件"
          subtext="先月比 +18件"
        />

        <KpiCard
          title="目標件数"
          value="35件"
          subtext="残り8件"
        />

        <KpiCard
          title="達成率"
          value="77.1%"
          subtext="今月目標"
        />

        <KpiCard
          title="報酬見込"
          value="487,266円"
          subtext="確定 + 未確定"
        />
      </div>
    </main>
  );
}