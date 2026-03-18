import { useMemo } from "react";
import { Transaction } from "../../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  isSameMonth,
} from "date-fns";
import { TrendingUp, CreditCard, Smartphone, Banknote } from "lucide-react";

interface DashboardInsightsProps {
  transactions: Transaction[];
}

export default function DashboardInsights({
  transactions,
}: DashboardInsightsProps) {
  // 1. Cash Flow Data (Last 6 Months)
  const getThemeColor = (variable: string) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  };
  const emerald = getThemeColor("--emerald-500");
  const amber = getThemeColor("--amber-500");
  const cashFlowData = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 5);
    const months = eachMonthOfInterval({ start, end });

    return months.map((month) => {
      const monthTrans = transactions.filter((t) =>
        isSameMonth(parseISO(String(t.date)), month)
      );
      const income = monthTrans
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTrans
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: format(month, "MMM"),
        income,
        expense,
        net: income - expense,
      };
    });
  }, [transactions]);

  // 2. Spending by Mode
  const modeData = useMemo(() => {
    const digital = transactions
      .filter((t) => t.type === "expense" && t.mode === "digital")
      .reduce((sum, t) => sum + t.amount, 0);
    const inHand = transactions
      .filter((t) => t.type === "expense" && t.mode === "in_hand")
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: "Digital", value: digital, color: emerald },
      { name: "Cash", value: inHand, color: amber },
    ];
  }, [transactions]);
  const total = modeData.reduce((a, b) => a + b.value, 0);
  const digitalPercent = total
    ? Math.round((modeData[0].value / total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Cash Flow Chart */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight">Cash Flow</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Income vs Expense (6m)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                Income
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                Expense
              </span>
            </div>
          </div>
        </div>

        <div className="h-60 min-h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="border"
                opacity={0.2}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 600,
                  fill: "currentColor",
                  opacity: 0.8,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 600,
                  fill: "currentColor",
                  opacity: 0.5,
                }}
                tickFormatter={(val) =>
                  `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="bg-card border border-border rounded-2xl p-3 shadow-xl backdrop-blur-xl">
                      <p className="text-[10px] uppercase text-muted-foreground mb-2">
                        {label}
                      </p>

                      {payload.map((entry, i) => (
                        <div
                          key={i}
                          className="flex justify-between gap-4 text-sm font-semibold"
                        >
                          <span style={{ color: entry.color }}>
                            {entry.name}
                          </span>
                          <span>₹{Number(entry.value).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={emerald}
                strokeWidth={3.5}
                strokeOpacity={1}
                fill="url(#colorIncome)"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(16,185,129,0.25))",
                }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="rose"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Mode & Insights */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col">
        <div className="space-y-1 mb-8">
          <h3 className="text-lg font-bold tracking-tight">Spending Mode</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Digital vs Cash Breakdown
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div className="h-45 min-h-45 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {modeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <TrendingUp className="w-4 h-4 text-emerald-500 mb-1 opacity-80" />

              <p className="text-2xl font-bold text-foreground leading-none">
                {digitalPercent}%
              </p>

              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Digital
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {modeData.map((item) => {
              const percent =
                total > 0 ? Math.round((item.value / total) * 100) : 0;

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {item.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      ₹{item.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {percent}%
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-border mt-4">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                {modeData[0].value > modeData[1].value
                  ? "Most of your spending is digital. Great for tracking!"
                  : "Cash spending is high. Consider digitizing for better insights."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
