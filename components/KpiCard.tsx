type KpiCardProps = {
  title: string;
  value: string;
  subtext?: string;
};

export default function KpiCard({
  title,
  value,
  subtext,
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

      {subtext && (
        <p className="mt-2 text-sm text-gray-500">
          {subtext}
        </p>
      )}
    </div>
  );
}