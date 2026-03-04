const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path - will be created automatically
const dbPath = path.join(__dirname, 'interview.db');
let db;

// Initialize database with tables and sample data
function initializeDatabase() {
  console.log('🗄️  Initializing SQLite database...');
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return;
    }
    console.log('✅ Connected to SQLite database at:', dbPath);
  });

  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        credit_score INTEGER DEFAULT 650,
        has_active_loan BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err.message);
      else console.log('✅ Users table ready');
    });

    // Loans table  
    db.run(`
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
    `, (err) => {
      if (err) console.error('Error creating loans table:', err.message);
      else console.log('✅ Loans table ready');
    });

    // Ensure new columns exist on existing databases (SQLite has limited ALTER support)
    const addColumnIfNotExists = (table, column, definition) => {
      db.all(`PRAGMA table_info(${table})`, (pragmaErr, rows) => {
        if (pragmaErr) {
          console.error(`Error reading schema for ${table}:`, pragmaErr.message);
          return;
        }
        const exists = rows.some((r) => r.name === column);
        if (!exists) {
          db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
            if (alterErr) console.error(`Error adding column ${column} to ${table}:`, alterErr.message);
            else console.log(`🆕 Added column ${column} to ${table}`);
          });
        }
      });
    };

    // Delivery support for loans: method and fee
    addColumnIfNotExists('loans', 'delivery_method', "TEXT DEFAULT 'standard'");
    addColumnIfNotExists('loans', 'delivery_fee', 'REAL DEFAULT 0');

    // Payments table (for future loan history features)
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date DATE DEFAULT CURRENT_TIMESTAMP,
        payment_method TEXT DEFAULT 'auto_debit',
        status TEXT DEFAULT 'completed',
        FOREIGN KEY (loan_id) REFERENCES loans (id)
      )
    `, (err) => {
      if (err) console.error('Error creating payments table:', err.message);
      else console.log('✅ Payments table ready');
    });

    // Insert sample data
    insertSampleData();
  });
}

function insertSampleData() {
  console.log('📝 Inserting sample data...');

  // Insert demo user
  db.run(`
    INSERT OR IGNORE INTO users (id, email, name, credit_score, has_active_loan) 
    VALUES (1, 'demo@bree.co', 'Demo User', 720, 1)
  `, (err) => {
    if (err) console.error('Error inserting demo user:', err.message);
    else console.log('✅ Demo user created');
  });

  // Insert additional test users
  const testUsers = [
    [2, 'john.doe@example.com', 'John Doe', 680, 0],
    [3, 'jane.smith@example.com', 'Jane Smith', 750, 1],
    [4, 'bob.wilson@example.com', 'Bob Wilson', 590, 0],
    [5, 'alice.brown@example.com', 'Alice Brown', 710, 0]
  ];

  const userStmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, credit_score, has_active_loan) 
    VALUES (?, ?, ?, ?, ?)
  `);

  testUsers.forEach(user => {
    userStmt.run(user, (err) => {
      if (err) console.error('Error inserting test user:', err.message);
    });
  });
  userStmt.finalize();

  // Insert sample loan history for demo user
  const sampleLoans = [
    {
      user_id: 1,
      amount: 200,
      tip: 20, // 10% voluntary tip
      due_date: '2025-10-15',
      status: 'paid',
      risk_level: 'Low Risk',
      delivery_method: 'standard',
      delivery_fee: 0,
      created_at: '2025-10-01 10:30:00'
    },
    {
      user_id: 1,
      amount: 150,
      tip: 15, // 10% voluntary tip
      due_date: '2025-11-15',
      status: 'paid',
      risk_level: 'Low Risk',
      delivery_method: 'standard',
      delivery_fee: 0,
      created_at: '2025-11-01 14:20:00'
    },
    {
      user_id: 1,
      amount: 300,
      tip: 0, // User chose no tip
      due_date: '2025-12-15',
      status: 'paid',
      risk_level: 'Low Risk',
      delivery_method: 'standard',
      delivery_fee: 0,
      created_at: '2025-12-01 09:15:00'
    },
    {
      user_id: 1,
      amount: 100,
      tip: 5, // 5% tip
      due_date: '2026-01-15',
      status: 'defaulted',
      risk_level: 'Low Risk',
      delivery_method: 'standard',
      delivery_fee: 0,
      created_at: '2026-01-01 16:45:00'
    },
    {
      user_id: 1,
      amount: 250,
      tip: 25, // 10% tip
      due_date: '2026-02-15',
      status: 'paid',
      risk_level: 'Low Risk',
      delivery_method: 'standard',
      delivery_fee: 0,
      created_at: '2026-02-01 11:30:00'
    },
    {
      user_id: 1,
      amount: 350,
      tip: 35, // 10% tip
      due_date: '2026-03-17',
      status: 'approved',
      risk_level: 'Low Risk',
      delivery_method: 'express',
      delivery_fee: 8.49,
      created_at: '2026-03-01 09:00:00'
    }
  ];

  const loanStmt = db.prepare(`
    INSERT OR IGNORE INTO loans (user_id, amount, tip, due_date, status, risk_level, delivery_method, delivery_fee, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleLoans.forEach(loan => {
    loanStmt.run([
      loan.user_id,
      loan.amount,
      loan.tip,
      loan.due_date,
      loan.status,
      loan.risk_level,
      loan.delivery_method,
      loan.delivery_fee,
      loan.created_at
    ], (err) => {
      if (err) console.error('Error inserting sample loan:', err.message);
    });
  });
  loanStmt.finalize();

  // Insert sample payments
  const samplePayments = [
    { loan_id: 1, amount: 220, payment_date: '2025-10-15', status: 'completed' },  // $200 + $20 tip
    { loan_id: 2, amount: 165, payment_date: '2025-11-15', status: 'completed' },  // $150 + $15 tip
    { loan_id: 3, amount: 300, payment_date: '2025-12-15', status: 'completed' },  // $300 + $0 tip
    { loan_id: 4, amount: 105, payment_date: '2026-01-20', status: 'failed' },     // $100 + $5 tip (defaulted)
    { loan_id: 5, amount: 275, payment_date: '2026-02-15', status: 'completed' }   // $250 + $25 tip
  ];

  const paymentStmt = db.prepare(`
    INSERT OR IGNORE INTO payments (loan_id, amount, payment_date, status)
    VALUES (?, ?, ?, ?)
  `);

  samplePayments.forEach(payment => {
    paymentStmt.run([
      payment.loan_id,
      payment.amount,
      payment.payment_date,
      payment.status
    ], (err) => {
      if (err) console.error('Error inserting sample payment:', err.message);
    });
  });
  paymentStmt.finalize();

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
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('🔒 Database connection closed.');
      }
    });
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