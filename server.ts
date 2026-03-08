import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("shapnajatra.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    member_id TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    joined_date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
    payment_type TEXT,
    remarks TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
  );

  CREATE TABLE IF NOT EXISTS committee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    designation TEXT UNIQUE NOT NULL,
    phone TEXT,
    order_index INTEGER DEFAULT 0
  );

  -- Seed Data
  INSERT OR IGNORE INTO members (name, member_id, phone, email, address) VALUES 
  ('আব্দুর রহমান', 'SJ-001', '01711223344', 'rahman@example.com', 'ঢাকা, বাংলাদেশ'),
  ('ফাতেমা বেগম', 'SJ-002', '01811223344', 'fatema@example.com', 'চট্টগ্রাম, বাংলাদেশ'),
  ('কামাল হোসেন', 'SJ-003', '01911223344', 'kamal@example.com', 'সিলেট, বাংলাদেশ');

  INSERT OR IGNORE INTO payments (member_id, amount, payment_type, remarks) VALUES 
  ('SJ-001', 500, 'মাসিক', 'জানুয়ারি ২০২৪'),
  ('SJ-001', 500, 'মাসিক', 'ফেব্রুয়ারি ২০২৪'),
  ('SJ-002', 1000, 'দান', 'বিশেষ অনুদান'),
  ('SJ-003', 500, 'মাসিক', 'জানুয়ারি ২০২৪');

  INSERT OR IGNORE INTO committee (name, designation, phone, order_index) VALUES 
  ('মোঃ রফিকুল ইসলাম', 'সভাপতি', '01700000001', 1),
  ('নাসরিন আক্তার', 'সাধারণ সম্পাদক', '01700000002', 2),
  ('আরিফ আহমেদ', 'কোষাধ্যক্ষ', '01700000003', 3);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/members", (req, res) => {
    const members = db.prepare("SELECT * FROM members ORDER BY name ASC").all();
    res.json(members);
  });

  app.post("/api/members", (req, res) => {
    const { name, member_id, phone, email, address } = req.body;
    try {
      // Use INSERT OR REPLACE for upsert logic like PHP's ON DUPLICATE KEY UPDATE
      const info = db.prepare(
        "INSERT OR REPLACE INTO members (name, member_id, phone, email, address) VALUES (?, ?, ?, ?, ?)"
      ).run(name, member_id, phone, email, address);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/members/:member_id", (req, res) => {
    const { member_id } = req.params;
    try {
      db.prepare("DELETE FROM members WHERE member_id = ?").run(member_id);
      // Also delete payments associated with this member
      db.prepare("DELETE FROM payments WHERE member_id = ?").run(member_id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/payments", (req, res) => {
    const payments = db.prepare(`
      SELECT p.*, m.name as member_name 
      FROM payments p 
      JOIN members m ON p.member_id = m.member_id 
      ORDER BY p.payment_date DESC
    `).all();
    res.json(payments);
  });

  app.post("/api/payments", (req, res) => {
    const { member_id, amount, payment_type, remarks } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO payments (member_id, amount, payment_type, remarks) VALUES (?, ?, ?, ?)"
      ).run(member_id, amount, payment_type, remarks);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/payments/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM payments WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/committee", (req, res) => {
    const { name, designation, phone, order_index } = req.body;
    try {
      // Upsert logic for committee based on designation (role)
      const info = db.prepare(`
        INSERT INTO committee (name, designation, phone, order_index) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(designation) DO UPDATE SET
          name = excluded.name,
          phone = excluded.phone,
          order_index = excluded.order_index
      `).run(name, designation, phone, order_index);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/member/profile/:member_id", (req, res) => {
    const { member_id } = req.params;
    const member = db.prepare("SELECT * FROM members WHERE member_id = ?").get(member_id);
    if (member) {
      res.json(member);
    } else {
      res.status(404).json({ error: "সদস্য পাওয়া যায়নি" });
    }
  });

  app.get("/api/member/payments/:member_id", (req, res) => {
    const { member_id } = req.params;
    const payments = db.prepare("SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC").all(member_id);
    res.json(payments);
  });

  app.post("/api/login", (req, res) => {
    const { type, id, pin } = req.body;
    if (type === "admin") {
      if (pin === "01686") { // Updated PIN from PHP code
        res.json({ success: true, role: "admin" });
      } else {
        res.status(401).json({ error: "ভুল পিন" });
      }
    } else {
      const member = db.prepare("SELECT * FROM members WHERE member_id = ?").get(id);
      if (member) {
        // PHP code uses password "2010" or "২০১০"
        if (pin === "2010" || pin === "২০১০") {
          res.json({ success: true, role: "member", member });
        } else {
          res.status(401).json({ error: "ভুল পাসওয়ার্ড" });
        }
      } else {
        res.status(401).json({ error: "ভুল সদস্য আইডি" });
      }
    }
  });

  app.get("/api/stats", (req, res) => {
    const totalMembers = db.prepare("SELECT COUNT(*) as count FROM members").get() as any;
    const totalPayments = db.prepare("SELECT SUM(amount) as total FROM payments").get() as any;
    const recentPayments = db.prepare(`
      SELECT p.*, m.name as member_name 
      FROM payments p 
      JOIN members m ON p.member_id = m.member_id 
      ORDER BY p.payment_date DESC LIMIT 5
    `).all();

    res.json({
      memberCount: totalMembers.count,
      totalAmount: totalPayments.total || 0,
      recentPayments
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
