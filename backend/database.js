const Database = require('better-sqlite3');
const path = require('path');

// Database file path - will be created automatically
const dbPath = path.join(__dirname, 'interview.db');
let db;

// Initialize database with tables and sample data
function initializeDatabase() {
  console.log('🗄️  Initializing SQLite database...');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  console.log('✅ Connected to SQLite database at:', dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      credit_score INTEGER DEFAULT 650,
      has_active_loan BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Users table ready');

  db.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      tip REAL DEFAULT 0,
      due_date DATE NOT NULL,
      risk_level TEXT DEFAULT 'Low Risk',
      status TEXT DEFAULT 'pending',
      delivery_method TEXT DEFAULT 'standard',
      delivery_fee REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  console.log('✅ Loans table ready');

  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE DEFAULT CURRENT_TIMESTAMP,
      payment_method TEXT DEFAULT 'auto_debit',
      status TEXT DEFAULT 'completed',
      FOREIGN KEY (loan_id) REFERENCES loans (id)
    )
  `);
  console.log('✅ Payments table ready');

  // Insert sample data
  insertSampleData();
}

function insertSampleData() {
  console.log('📝 Inserting sample data...');

  // Insert demo user
  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, credit_score, has_active_loan)
    VALUES (1, 'demo@bree.co', 'Demo User', 720, 1)
  `).run();

  // Insert additional test users
  const userStmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, credit_score, has_active_loan)
    VALUES (?, ?, ?, ?, ?)
  `);

  const testUsers = [
    [2, 'john.doe@example.com', 'John Doe', 680, 0],
    [3, 'jane.smith@example.com', 'Jane Smith', 750, 1],
    [4, 'bob.wilson@example.com', 'Bob Wilson', 590, 0],
    [5, 'alice.brown@example.com', 'Alice Brown', 710, 0]
  ];

  testUsers.forEach(user => userStmt.run(...user));

  // Insert sample loan history for demo user
  const sampleLoans = [
    { user_id: 1, amount: 200, tip: 20, due_date: '2025-10-15', status: 'paid', risk_level: 'Low Risk', delivery_method: 'standard', delivery_fee: 0, created_at: '2025-10-01 10:30:00' },
    { user_id: 1, amount: 150, tip: 15, due_date: '2025-11-15', status: 'paid', risk_level: 'Low Risk', delivery_method: 'standard', delivery_fee: 0, created_at: '2025-11-01 14:20:00' },
    { user_id: 1, amount: 300, tip: 0, due_date: '2025-12-15', status: 'paid', risk_level: 'Low Risk', delivery_method: 'standard', delivery_fee: 0, created_at: '2025-12-01 09:15:00' },
    { user_id: 1, amount: 100, tip: 5, due_date: '2026-01-15', status: 'defaulted', risk_level: 'Low Risk', delivery_method: 'standard', delivery_fee: 0, created_at: '2026-01-01 16:45:00' },
    { user_id: 1, amount: 250, tip: 25, due_date: '2026-02-15', status: 'paid', risk_level: 'Low Risk', delivery_method: 'standard', delivery_fee: 0, created_at: '2026-02-01 11:30:00' },
    { user_id: 1, amount: 350, tip: 35, due_date: '2026-03-17', status: 'approved', risk_level: 'Low Risk', delivery_method: 'express', delivery_fee: 8.49, created_at: '2026-03-01 09:00:00' }
  ];

  const loanStmt = db.prepare(`
    INSERT OR IGNORE INTO loans (user_id, amount, tip, due_date, status, risk_level, delivery_method, delivery_fee, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleLoans.forEach(loan => {
    loanStmt.run(loan.user_id, loan.amount, loan.tip, loan.due_date, loan.status, loan.risk_level, loan.delivery_method, loan.delivery_fee, loan.created_at);
  });

  // Insert sample payments
  const samplePayments = [
    { loan_id: 1, amount: 220, payment_date: '2025-10-15', status: 'completed' },
    { loan_id: 2, amount: 165, payment_date: '2025-11-15', status: 'completed' },
    { loan_id: 3, amount: 300, payment_date: '2025-12-15', status: 'completed' },
    { loan_id: 4, amount: 105, payment_date: '2026-01-20', status: 'failed' },
    { loan_id: 5, amount: 275, payment_date: '2026-02-15', status: 'completed' }
  ];

  const paymentStmt = db.prepare(`
    INSERT OR IGNORE INTO payments (loan_id, amount, payment_date, status)
    VALUES (?, ?, ?, ?)
  `);

  samplePayments.forEach(p => paymentStmt.run(p.loan_id, p.amount, p.payment_date, p.status));

  console.log('✅ Sample data inserted successfully');
  console.log('👤 Demo user: demo@bree.co (ID: 1, Credit Score: 720)');
  console.log('💰 Sample loan history created for testing');
}

// Get database instance
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Close database connection
function closeDatabase() {
  if (db) {
    db.close();
    console.log('🔒 Database connection closed.');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase
};
