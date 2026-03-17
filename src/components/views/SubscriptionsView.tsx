import Calculator from "../Calculator";
import { Stats } from "../../types";

type Props = {
  stats: Stats | null;
  currentBalance: number;

  filterMode: "day" | "month" | "year" | "custom";
  filterDate: Date;
  customRange: { start: Date; end: Date };
};

export default function SubscriptionsView({
  stats,
  currentBalance,
  filterMode,
  filterDate,
  customRange,
}: Props) {
  return (
    <div className="space-y-8">
      <Calculator
        stats={stats}
        currentBalance={currentBalance}
        filterMode={filterMode}
        filterDate={filterDate}
        customRange={customRange}
      />
    </div>
  );
}
