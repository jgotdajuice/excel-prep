import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-brand-dark m-0">
        {value}
      </p>
    </Card>
  );
}
