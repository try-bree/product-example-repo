const API_BASE = "http://localhost:3001/api"

export const api = {
  async getUser(id: number) {
    const response = await fetch(`${API_BASE}/users/${id}`)
    return response.json()
  },

  async createLoan(loanData: any) {
    const response = await fetch(`${API_BASE}/loans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: loanData.userId,
        amount: loanData.amount,
        tip: loanData.tip || 0,
        dueDate: loanData.dueDate,
        riskLevel: loanData.riskLevel || "Low Risk",
        deliveryMethod: loanData.deliveryMethod || "standard",
        deliveryFee: loanData.deliveryFee || 0,
      }),
    })
    return response.json()
  },

  async checkEligibility(userId: number, amount: number) {
    const response = await fetch(`${API_BASE}/check-eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    })
    return response.json()
  },

  async getLoanHistory(userId: number) {
    const response = await fetch(`${API_BASE}/loans?userId=${userId}`)
    return response.json()
  },

  async getLoanDetails(loanId: number) {
    const response = await fetch(`${API_BASE}/loans/${loanId}`)
    return response.json()
  },

  async updateLoanStatus(loanId: number, status: string) {
    const response = await fetch(`http://localhost:3001/api/loans/${loanId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    return response.json()
  },

  async cancelLoan(loanId: number) {
    const response = await fetch(`${API_BASE}/loans/${loanId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return response.json()
  },

  async payBackLoan(loanId: number, amount: number) {
    const response = await fetch(`${API_BASE}/loans/${loanId}/payback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
    return response.json()
  },

  async getActiveLoan(userId: number) {
    const response = await fetch(`${API_BASE}/loans?userId=${userId}`)
    const loans = await response.json()
    const activeLoans = loans
      .filter((loan: any) => loan.status === "pending" || loan.status === "approved")
      .sort((a: any, b: any) => b.id - a.id)
    return activeLoans.length > 0 ? activeLoans[0] : null
  },

  async get_user_credit_score(user_id: number) {
    const response = await fetch(`${API_BASE}/users/${user_id}/credit-score`)
    return response.json()
  },
}

export const createLoan = api.createLoan
export const getUserData = api.getUser
export const eligibilityCheck = api.checkEligibility
