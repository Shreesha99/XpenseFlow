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
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your finances with custom categories.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Empty State */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-3xl bg-muted/20">
          <Tags className="w-10 h-10 text-muted-foreground mb-4" />

          <h3 className="text-lg font-bold tracking-tight mb-1">
            No Categories Yet
          </h3>

          <p className="text-xs text-muted-foreground max-w-xs mb-6">
            Categories help organize your spending and income.
          </p>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
