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
  
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(row);
  });
});

// Check eligibility endpoint
app.post('/api/check-eligibility', (req, res) => {
  const { userId, amount } = req.body;
  const db = getDb();
  
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.log(`❌ Eligibility check failed - Database error for user ${userId}`);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    if (!user) {
      console.log(`❌ Eligibility check failed - User ${userId} not found`);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Simple eligibility logic (BAD - should be in business layer)
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
});

// Create loan endpoint
app.post('/api/loans', (req, res) => {
  const { userId, amount, tip, dueDate, riskLevel, deliveryMethod = 'standard', deliveryFee = 0 } = req.body;
  const db = getDb();
  
  console.log(`💰 Creating loan for user ${userId}: $${amount} (tip: $${tip || 0}, risk: ${riskLevel})`);
  
  const stmt = db.prepare(`
    INSERT INTO loans (user_id, amount, tip, due_date, risk_level, delivery_method, delivery_fee, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `);
  
  stmt.run([userId, amount, tip || 0, dueDate, riskLevel, deliveryMethod, deliveryFee], function(err) {
    if (err) {
      console.log(`❌ Failed to create loan for user ${userId}: ${err.message}`);
      res.status(500).json({ error: 'Failed to create loan' });
      return;
    }
    
    console.log(`✅ Loan created successfully - ID: ${this.lastID}`);
    
    // Get the created loan
    db.get('SELECT * FROM loans WHERE id = ?', [this.lastID], (err, loan) => {
      if (err) {
        console.log(`❌ Failed to retrieve created loan ${this.lastID}`);
        res.status(500).json({ error: 'Failed to retrieve loan' });
        return;
      }
      
      // Update user to have active loan
      db.run('UPDATE users SET has_active_loan = 1 WHERE id = ?', [userId]);
      console.log(`👤 Updated user ${userId} to have active loan`);
      
      res.status(201).json(convertLoanFields(loan));
    });
  });
  
  stmt.finalize();
});

// Get loan history endpoint
app.get('/api/loans', (req, res) => {
  const { userId } = req.query;
  const db = getDb();
  
  if (!userId) {
    res.status(400).json({ error: 'userId parameter required' });
    return;
  }
  
  db.all('SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(rows.map(convertLoanFields));
  });
});

// Get specific loan details
app.get('/api/loans/:id', (req, res) => {
  const loanId = req.params.id;
  const db = getDb();
  
  db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, loan) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (!loan) {
      res.status(404).json({ error: 'Loan not found' });
      return;
    }
    res.json(convertLoanFields(loan));
  });
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
  }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds
});

// Cancel loan endpoint (for pending loans only)
app.post('/api/loans/:id/cancel', (req, res) => {
  const loanId = req.params.id;
  const db = getDb();
  
  console.log(`🚫 Attempting to cancel loan ${loanId}`);
  
  // First check if loan exists and is cancelable
  db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, loan) => {
    if (err) {
      console.log(`❌ Failed to find loan ${loanId}: ${err.message}`);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
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
    
    // Cancel the loan
    db.run('UPDATE loans SET status = ? WHERE id = ?', ['canceled', loanId], function(err) {
      if (err) {
        console.log(`❌ Failed to cancel loan ${loanId}: ${err.message}`);
        res.status(500).json({ error: 'Failed to cancel loan' });
        return;
      }
      
      console.log(`✅ Loan ${loanId} canceled successfully`);
      
      // Check if user has any other active loans
      db.get('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN (?, ?)', 
        [loan.user_id, 'pending', 'approved'], (err, result) => {
        if (!err && result.count === 0) {
          // Update user to not have active loan
          db.run('UPDATE users SET has_active_loan = 0 WHERE id = ?', [loan.user_id]);
          console.log(`👤 Updated user ${loan.user_id} - no more active loans`);
        }
        
        res.json({ success: true, message: 'Loan canceled successfully' });
      });
    });
  });
});

// Pay back loan endpoint (for approved loans)
app.post('/api/loans/:id/payback', (req, res) => {
  const loanId = req.params.id;
  const { amount } = req.body;
  const db = getDb();
  
  console.log(`💰 Attempting to pay back loan ${loanId} with amount $${amount}`);
  
  // First check if loan exists and is payable
  db.get('SELECT * FROM loans WHERE id = ?', [loanId], (err, loan) => {
    if (err) {
      console.log(`❌ Failed to find loan ${loanId}: ${err.message}`);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
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
    const paymentStmt = db.prepare(`
      INSERT INTO payments (loan_id, amount, payment_date, status)
      VALUES (?, ?, datetime('now'), 'completed')
    `);
    
    paymentStmt.run([loanId, amount], function(paymentErr) {
      if (paymentErr) {
        console.log(`❌ Failed to record payment for loan ${loanId}: ${paymentErr.message}`);
        res.status(500).json({ error: 'Failed to record payment' });
        return;
      }
      
      console.log(`💳 Payment recorded - ID: ${this.lastID}`);
      
      // Update loan status to paid
      db.run('UPDATE loans SET status = ? WHERE id = ?', ['paid', loanId], function(loanErr) {
        if (loanErr) {
          console.log(`❌ Failed to update loan ${loanId} status: ${loanErr.message}`);
          res.status(500).json({ error: 'Failed to update loan status' });
          return;
        }
        
        console.log(`✅ Loan ${loanId} marked as paid`);
        
        // Check if user has any other active loans
        db.get('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN (?, ?)', 
          [loan.user_id, 'pending', 'approved'], (err, result) => {
          if (!err && result.count === 0) {
            // Update user to not have active loan
            db.run('UPDATE users SET has_active_loan = 0 WHERE id = ?', [loan.user_id]);
            console.log(`👤 Updated user ${loan.user_id} - no more active loans`);
          }
          
          res.json({ 
            success: true, 
            message: 'Loan paid back successfully',
            paymentId: this.lastID,
            overpayment: amount > totalOwed ? amount - totalOwed : 0
          });
        });
      });
    });
    
    paymentStmt.finalize();
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
  
  db.run('UPDATE loans SET status = ? WHERE id = ?', [status, loanId], function(err) {
    if (err) {
      console.log(`❌ Failed to update loan ${loanId} status: ${err.message}`);
      res.status(500).json({ error: 'Failed to update loan status' });
      return;
    }
    
    if (this.changes === 0) {
      console.log(`❌ Loan ${loanId} not found`);
      res.status(404).json({ error: 'Loan not found' });
      return;
    }
    
    console.log(`✅ Loan ${loanId} status updated to ${status}`);
    
    // Update user's active loan status when loan is no longer active
    if (['rejected', 'canceled', 'paid', 'defaulted'].includes(status)) {
      // Get the loan to find the user_id
      db.get('SELECT user_id FROM loans WHERE id = ?', [loanId], (err, loan) => {
        if (!err && loan) {
          // Check if user has any other active loans
          db.get('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status IN (?, ?)', 
            [loan.user_id, 'pending', 'approved'], (err, result) => {
            if (!err && result.count === 0) {
              // Update user to not have active loan
              db.run('UPDATE users SET has_active_loan = 0 WHERE id = ?', [loan.user_id]);
              console.log(`👤 Updated user ${loan.user_id} - no more active loans after ${status}`);
            }
          });
        }
      });
    }
    
    res.json({ success: true, message: `Loan status updated to ${status}` });
  });
});

// Send confirmation email endpoint (mock)
app.post('/api/send-confirmation', (req, res) => {
  const { userId, loanId, email, amount } = req.body;
  
  // Mock email sending
  console.log(`[MOCK EMAIL] Sending confirmation to ${email} for loan ${loanId} ($${amount})`);
  
  setTimeout(() => {
    res.json({ success: true, message: 'Confirmation email sent' });
  }, 500);
});

// Notifications endpoint (mock)
app.post('/api/notifications', (req, res) => {
  const { userId, message, type } = req.body;
  
  // Mock notification - just log it
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