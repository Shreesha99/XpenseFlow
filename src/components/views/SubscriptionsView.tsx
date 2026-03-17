import Calculator from "../Calculator";
import { Stats } from "../../types";

type Props = {
  stats: Stats | null;
  currentBalance: number;
};

export default function SubscriptionsView({ stats, currentBalance }: Props) {
  return (
    <div className="space-y-8">
      {/* No extra card wrapper */}
      <Calculator stats={stats} currentBalance={currentBalance} />
    </div>
  );
}
