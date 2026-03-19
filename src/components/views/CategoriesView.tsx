import { motion } from "motion/react";
import { Tags, Plus, Settings, Trash2 } from "lucide-react";
import { Category, Stats } from "../../types";

type Props = {
  categories: Category[];
  stats: Stats | null;
  onAdd: () => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  openPrompt: (config: {
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (val: string) => void;
  }) => void;
};

export default function CategoriesView({
  categories,
  stats,
  onAdd,
  onEdit,
  onDelete,
  openPrompt,
}: Props) {
  return (
    <motion.div
      key="categories"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 md:space-y-12"
    >
      {/* Header */}
      <div
        id="tour-categories-header"
        className="flex flex-col items-start md:flex-row md:items-center justify-between gap-4 mb-12"
      >
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your finances with custom categories.
          </p>
        </div>

        <button
          id="tour-categories-new"
          onClick={onAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Empty State */}
      {categories.length === 0 ? (
        <div className="relative overflow-hidden p-12 md:p-16 rounded-[2.5rem] border border-border bg-linear-to-b from-card to-muted/20 text-center">
          {/* glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-75 h-75 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-3xl rounded-full" />
          </div>

          <div className="relative flex flex-col items-center gap-6">
            {/* icon */}
            <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur border border-border flex items-center justify-center">
              <Tags className="w-7 h-7 text-emerald-500" />
            </div>

            {/* text */}
            <div className="space-y-2">
              <p className="text-xl font-bold tracking-tight text-foreground">
                No categories yet
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create categories to organize your income and expenses clearly.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={onAdd}
              className="mt-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition active:scale-95"
            >
              Create First Category
            </button>

            {/* hint */}
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Helps you track spending better
            </p>
          </div>
        </div>
      ) : (
        <div
          id="tour-categories-grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {categories.map((cat) => {
            const stat = stats?.categoryStats.find(
              (s) => s.category === cat.name
            );

            return (
              <div
                key={cat.id}
                className="p-6 bg-card border border-border rounded-3xl hover:border-emerald-500/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                    <Tags className="w-6 h-6" />
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() =>
                        openPrompt({
                          title: "Edit Category",
                          message: "Enter new name",
                          defaultValue: cat.name,
                          onConfirm: (val) => val && onEdit(cat.id, val.trim()),
                        })
                      }
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(cat.id)}
                      className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-bold">{cat.name}</p>

                {stat ? (
                  <div className="mt-4 pt-4 border-t border-border/50 text-[10px] font-bold space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-500">INCOME</span>
                      <span>₹{stat.total_credit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-500">EXPENSE</span>
                      <span>₹{stat.total_expense.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    No activity
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
