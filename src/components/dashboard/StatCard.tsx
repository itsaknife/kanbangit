import { Card } from "@/components/ui";

interface StatCardProps {
  label: string;
  value: number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-3xl font-semibold">{value}</span>
    </Card>
  );
}
