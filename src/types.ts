export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'credit' | 'expense';
  mode: 'digital' | 'in_hand';
  category: string;
  account_id: number;
  date: string;
  description?: string;
  created_at: string;
}

export interface Account {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoryStat {
  category: string;
  digital_expense: number;
  in_hand_expense: number;
  total_expense: number;
  digital_credit: number;
  in_hand_credit: number;
  total_credit: number;
}

export interface Summary {
  digital_credits: number;
  in_hand_credits: number;
  digital_expenses: number;
  in_hand_expenses: number;
}

export interface Stats {
  categoryStats: CategoryStat[];
  summary: Summary;
}
