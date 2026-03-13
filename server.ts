import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("expenses.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL, -- 'credit' or 'expense'
    mode TEXT NOT NULL, -- 'digital' or 'in_hand'
    category TEXT NOT NULL,
    account_id INTEGER DEFAULT 1,
    date TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insert default account and categories if they don't exist
  INSERT OR IGNORE INTO accounts (name) VALUES ('Main Bank');
  INSERT OR IGNORE INTO categories (name) VALUES ('Salary'), ('Food'), ('Rent'), ('Utilities'), ('Entertainment'), ('Transport'), ('Shopping'), ('Health'), ('Subscriptions'), ('Other');
`);

try {
  db.prepare("ALTER TABLE accounts ADD COLUMN logo_url TEXT").run();
} catch (e) {
  // Column already exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Accounts API
  app.get("/api/accounts", (req, res) => {
    try {
      const accounts = db.prepare("SELECT * FROM accounts").all();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", (req, res) => {
    const { name, logo_url } = req.body;
    try {
      const info = db.prepare("INSERT INTO accounts (name, logo_url) VALUES (?, ?)").run(name, logo_url);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add account" });
    }
  });

  app.delete("/api/accounts/:id", (req, res) => {
    const { id } = req.params;
    try {
      // Delete transactions associated with the account
      db.prepare("DELETE FROM transactions WHERE account_id = ?").run(id);
      // Delete the account
      db.prepare("DELETE FROM accounts WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Categories API
  app.get("/api/categories", (req, res) => {
    try {
      const categories = db.prepare("SELECT * FROM categories").all();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add category" });
    }
  });

  app.put("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // API Routes
  app.get("/api/transactions", (req, res) => {
    const { account_id, month } = req.query;
    try {
      let query = `
        SELECT t.*, a.name as account_name, a.logo_url as account_logo_url
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (account_id && account_id !== '0') {
        query += " AND t.account_id = ?";
        params.push(account_id);
      }

      if (month) {
        query += " AND strftime('%Y-%m', date) = ?";
        params.push(month);
      }

      query += " ORDER BY date DESC, id DESC";
      const transactions = db.prepare(query).all(...params);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", (req, res) => {
    const { title, amount, type, mode, category, date, description, account_id } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO transactions (title, amount, type, mode, category, date, description, account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(title, amount, type, mode, category, date, description, account_id || 1);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add transaction" });
    }
  });

  app.post("/api/transactions/bulk", (req, res) => {
    const transactions = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const insert = db.prepare(
      "INSERT INTO transactions (title, amount, type, mode, category, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    const insertMany = db.transaction((data) => {
      for (const item of data) {
        insert.run(
          item.title, 
          item.amount, 
          item.type || 'expense', 
          item.mode || 'digital', 
          item.category, 
          item.date, 
          item.description || ""
        );
      }
    });

    try {
      insertMany(transactions);
      res.json({ success: true, count: transactions.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to bulk insert transactions" });
    }
  });

  app.delete("/api/transactions/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.get("/api/stats", (req, res) => {
    const { account_id, month } = req.query;
    try {
      let whereClause = "WHERE 1=1";
      const params: any[] = [];

      if (account_id && account_id !== '0') {
        whereClause += " AND account_id = ?";
        params.push(account_id);
      }

      if (month) {
        whereClause += " AND strftime('%Y-%m', date) = ?";
        params.push(month);
      }

      const categoryStats = db.prepare(`
        SELECT 
          category, 
          COALESCE(SUM(CASE WHEN type = 'expense' AND mode = 'digital' THEN amount ELSE 0 END), 0) as digital_expense,
          COALESCE(SUM(CASE WHEN type = 'expense' AND mode = 'in_hand' THEN amount ELSE 0 END), 0) as in_hand_expense,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
          COALESCE(SUM(CASE WHEN type = 'credit' AND mode = 'digital' THEN amount ELSE 0 END), 0) as digital_credit,
          COALESCE(SUM(CASE WHEN type = 'credit' AND mode = 'in_hand' THEN amount ELSE 0 END), 0) as in_hand_credit,
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as total_credit
        FROM transactions 
        ${whereClause}
        GROUP BY category
      `).all(...params);

      const summary = db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'credit' AND mode = 'digital' THEN amount ELSE 0 END), 0) as digital_credits,
          COALESCE(SUM(CASE WHEN type = 'credit' AND mode = 'in_hand' THEN amount ELSE 0 END), 0) as in_hand_credits,
          COALESCE(SUM(CASE WHEN type = 'expense' AND mode = 'digital' THEN amount ELSE 0 END), 0) as digital_expenses,
          COALESCE(SUM(CASE WHEN type = 'expense' AND mode = 'in_hand' THEN amount ELSE 0 END), 0) as in_hand_expenses
        FROM transactions
        ${whereClause}
      `).get(...params);

      res.json({ categoryStats, summary });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/accounts/balances", (req, res) => {
    try {
      const balances = db.prepare(`
        SELECT 
          a.id, 
          a.name,
          a.logo_url,
          COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 0) as balance
        FROM accounts a
        LEFT JOIN transactions t ON a.id = t.account_id
        GROUP BY a.id
      `).all();
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch account balances" });
    }
  });

  app.post("/api/transfer", (req, res) => {
    const { from_account_id, to_account_id, amount, date, description } = req.body;
    
    if (!from_account_id || !to_account_id || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer details" });
    }

    const transfer = db.transaction(() => {
      // 1. Create expense from source account
      db.prepare(`
        INSERT INTO transactions (title, amount, type, mode, category, date, description, account_id)
        VALUES (?, ?, 'expense', 'digital', 'Transfer', ?, ?, ?)
      `).run(`Transfer to Account #${to_account_id}`, amount, date, description || "Internal Transfer", from_account_id);

      // 2. Create credit to destination account
      db.prepare(`
        INSERT INTO transactions (title, amount, type, mode, category, date, description, account_id)
        VALUES (?, ?, 'credit', 'digital', 'Transfer', ?, ?, ?)
      `).run(`Transfer from Account #${from_account_id}`, amount, date, description || "Internal Transfer", to_account_id);
    });

    try {
      transfer();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Transfer failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
