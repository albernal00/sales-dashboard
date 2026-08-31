import KpiCard from "../components/KpiCard";
import Sidebar from "../components/Sidebar";
import StoreProgress from "../components/StoreProgress";
import StaffRanking from "../components/StaffRanking";
import Header from "../components/Header";
import { BadgeJapaneseYen, ChartNoAxesCombined, Target, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <KpiCard
              title="今月実績"
              value="27件"
              subtext="先月比 +18件"
              icon={ChartNoAxesCombined}
              tone="blue"
            />

            <KpiCard
              title="目標件数"
              value="35件"
              subtext="残り8件"
              icon={Target}
              tone="violet"
            />

            <KpiCard
              title="達成率"
              value="77.1%"
              subtext="今月目標"
              icon={Trophy}
              tone="amber"
            />

            <KpiCard
              title="報酬見込"
              value="487,266円"
              subtext="確定 + 未確定"
              icon={BadgeJapaneseYen}
              tone="emerald"
            />
          </div>

          <div className="mt-5 grid gap-5 2xl:grid-cols-3">
            <div className="min-w-0 2xl:col-span-2">
              <StoreProgress />
            </div>

            <StaffRanking />
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
