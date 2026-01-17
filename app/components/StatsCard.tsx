interface StatsCardProps {
  icon: string;
  value: string;
  label: string;
  color: string;
}

export default function StatsCard({ icon, value, label, color }: StatsCardProps) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform`}>
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-white/80">{label}</div>
    </div>
  );
}
