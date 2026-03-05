const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, getDb } = require('./database');

const app = express();
const PORT = 3001;

// Helper function to convert database field names to camelCase
const convertLoanFields = (loan) => {
  if (!loan) return loan;
  return {
    ...loan,
    dueDate: loan.due_date,
    userId: loan.user_id,
    createdAt: loan.created_at,
    riskLevel: loan.risk_level,
    deliveryMethod: loan.delivery_method,
    deliveryFee: loan.delivery_fee
  };
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [${timestamp}] ${req.method} ${req.url}`);

  // Log request body for POST requests (excluding sensitive data)
  if (req.method === 'POST' && req.body) {
    const logBody = { ...req.body };
    // Don't log sensitive fields in full
    if (logBody.email) logBody.email = '***@***.com';
    console.log(`   Body:`, logBody);
  }

  next();
});

// Initialize database on startup
initializeDatabase();

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bree Interview Backend is running' });
});

// User endpoints
app.get('/api/users/:id', (req, res) => {
  const db = getDb();
  const userId = req.params.id;

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(row);
});

// Check eligibility endpoint
app.post('/api/check-eligibility', (req, res) => {
  const { userId, amount } = req.body;
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    console.log(`❌ Eligibility check failed - User ${userId} not found`);
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Simple eligibility logic
  let eligible = true;
  let reason = '';

  if (user.credit_score < 600) {
    eligible = false;
    reason = 'Credit score too low';
  } else if (user.has_active_loan) {
    eligible = false;
    reason = 'Active loan exists';
  } else if (amount > 500) {
    eligible = false;
    reason = 'Amount exceeds maximum';
  }

  console.log(`${eligible ? '✅' : '❌'} Eligibility check for user ${userId}, amount $${amount}: ${eligible ? 'ELIGIBLE' : reason}`);

  res.json({
    eligible,
    reason,
    creditScore: user.credit_score,
    hasActiveLoan: user.has_active_loan
  });
});

// Create loan endpoint
app.post('/api/loans', (req, res) => {
  const { userId, amount, tip, dueDate, riskLevel, deliveryMethod = 'standard', deliveryFee = 0 } = req.body;
  const db = getDb();

  console.log(`💰 Creating loan for user ${userId}: $${amount} (tip: $${tip || 0}, risk: ${riskLevel})`);

  const result = db.prepare(`
    INSERT INTO loans (user_id, amount, tip, due_date, risk_level, delivery_method, delivery_fee, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).run(userId, amount, tip || 0, dueDate, riskLevel, deliveryMethod, deliveryFee);

  console.log(`✅ Loan created successfully - ID: ${result.lastInsertRowid}`);

  // Get the created loan
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid);

  // Update user to have active loan
  db.prepare('UPDATE users SET has_active_loan = 1 WHERE id = ?').run(userId);
  console.log(`👤 Updated user ${userId} to have active loan`);

  res.status(201).json(convertLoanFields(loan));
});

// Get loan history endpoint
app.get('/api/loans', (req, res) => {
  const { userId } = req.query;
  const db = getDb();

  if (!userId) {
    res.status(400).json({ error: 'userId parameter required' });
    return;
  }

  const rows = db.prepare('SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  res.json(rows.map(convertLoanFields));
});

// Get specific loan details
app.get('/api/loans/:id', (req, res) => {
  const loanId = req.params.id;
  const db = getDb();

  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
  if (!loan) {
    res.status(404).json({ error: 'Loan not found' });
    return;
  }
  res.json(convertLoanFields(loan));
});

// Credit check endpoint (mock)
app.post('/api/credit-check', (req, res) => {
  const { userId, amount, requestId } = req.body;

  // Mock credit check - just return success after a delay
  setTimeout(() => {
    res.json({
      success: true,
      requestId: requestId,
      creditCheckPassed: true,
      verificationRequired: amount > 250
    });
  }, Math.random() * 2000 + 1000);
});

// Cancel loan endpoint (for pending loans only)
app.post('/api/loans/:id/cancel', (req, res) => {
  const loanId = req.params.id;
  const db = getDb();

  console.log(`🚫 Attempting to cancel loan ${loanId}`);

  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);

  if (!loan) {
    console.log(`❌ Loan ${loanId} not found`);
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  if (loan.status !== 'pending') {
    console.log(`❌ Cannot cancel loan ${loanId} - status is ${loan.status}, must be pending`);
    res.status(400).json({ error: `Cannot cancel ${loan.status} loan. Only pending loans can be canceled.` });
    return;
  }

  db.prepare('UPDATE loans SET status = ? WHERE id = ?').run('canceled', loanId);
  console.log(`✅ Loan ${loanId} canceled successfully`);

  // Check if user has any other active loans
  const result = db.prepare('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN (?, ?)').get(loan.user_id, 'pending', 'approved');
  if (result.count === 0) {
    db.prepare('UPDATE users SET has_active_loan = 0 WHERE id = ?').run(loan.user_id);
    console.log(`👤 Updated user ${loan.user_id} - no more active loans`);
  }

  res.json({ success: true, message: 'Loan canceled successfully' });
});

// Pay back loan endpoint (for approved loans)
app.post('/api/loans/:id/payback', (req, res) => {
  const loanId = req.params.id;
  const { amount } = req.body;
  const db = getDb();

  console.log(`💰 Attempting to pay back loan ${loanId} with amount $${amount}`);

  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);

  if (!loan) {
    console.log(`❌ Loan ${loanId} not found`);
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  if (loan.status !== 'approved') {
    console.log(`❌ Cannot pay back loan ${loanId} - status is ${loan.status}, must be approved`);
    res.status(400).json({ error: `Cannot pay back ${loan.status} loan. Only approved loans can be paid back.` });
    return;
  }

  const totalOwed = loan.amount + loan.tip + (loan.delivery_fee || 0);
  if (amount < totalOwed) {
    console.log(`❌ Payment amount $${amount} is less than total owed $${totalOwed}`);
    res.status(400).json({ error: `Payment amount $${amount} is insufficient. Total owed: $${totalOwed}` });
    return;
  }

  // Record payment and mark loan as paid
  const paymentResult = db.prepare(`
    INSERT INTO payments (loan_id, amount, payment_date, status)
    VALUES (?, ?, datetime('now'), 'completed')
  `).run(loanId, amount);

  console.log(`💳 Payment recorded - ID: ${paymentResult.lastInsertRowid}`);

  // Update loan status to paid
  db.prepare('UPDATE loans SET status = ? WHERE id = ?').run('paid', loanId);
  console.log(`✅ Loan ${loanId} marked as paid`);

  // Check if user has any other active loans
  const result = db.prepare('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN (?, ?)').get(loan.user_id, 'pending', 'approved');
  if (result.count === 0) {
    db.prepare('UPDATE users SET has_active_loan = 0 WHERE id = ?').run(loan.user_id);
    console.log(`👤 Updated user ${loan.user_id} - no more active loans`);
  }

  res.json({
    success: true,
    message: 'Loan paid back successfully',
    paymentId: paymentResult.lastInsertRowid,
    overpayment: amount > totalOwed ? amount - totalOwed : 0
  });
});

// Update loan status endpoint (admin functionality)
app.put('/api/loans/:id/status', (req, res) => {
  const loanId = req.params.id;
  const { status } = req.body;
  const db = getDb();

  console.log(`📝 Updating loan ${loanId} status to ${status}`);

  const validStatuses = ['pending', 'approved', 'rejected', 'paid', 'canceled', 'defaulted'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const result = db.prepare('UPDATE loans SET status = ? WHERE id = ?').run(status, loanId);

  if (result.changes === 0) {
    console.log(`❌ Loan ${loanId} not found`);
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  console.log(`✅ Loan ${loanId} status updated to ${status}`);

  // Update user's active loan status when loan is no longer active
  if (['rejected', 'canceled', 'paid', 'defaulted'].includes(status)) {
    const loan = db.prepare('SELECT user_id FROM loans WHERE id = ?').get(loanId);
    if (loan) {
      const activeCount = db.prepare('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN (?, ?)').get(loan.user_id, 'pending', 'approved');
      if (activeCount.count === 0) {
        db.prepare('UPDATE users SET has_active_loan = 0 WHERE id = ?').run(loan.user_id);
        console.log(`👤 Updated user ${loan.user_id} - no more active loans after ${status}`);
      }
    }
  }

  res.json({ success: true, message: `Loan status updated to ${status}` });
});

// Send confirmation email endpoint (mock)
app.post('/api/send-confirmation', (req, res) => {
  const { userId, loanId, email, amount } = req.body;

  console.log(`[MOCK EMAIL] Sending confirmation to ${email} for loan ${loanId} ($${amount})`);

  setTimeout(() => {
    res.json({ success: true, message: 'Confirmation email sent' });
  }, 500);
});

// Notifications endpoint (mock)
app.post('/api/notifications', (req, res) => {
  const { userId, message, type } = req.body;

  console.log(`[NOTIFICATION] User ${userId}: ${message} (${type})`);

  res.json({ success: true, message: 'Notification sent' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bree Interview Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 API Base: http://localhost:${PORT}/api`);
});
