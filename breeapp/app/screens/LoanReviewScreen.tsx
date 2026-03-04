/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/sort-styles */
/* eslint-disable prettier/prettier */
import { useContext, useState, useEffect, useCallback, useRef } from "react"
import { Alert, StyleSheet, TouchableOpacity, View, ScrollView } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppContext } from "@/context/AppContext"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { colors, spacing, typography, shadows, radius } from "@/theme"
import { useHeader } from "@/utils/useHeader"

interface LoanReviewScreenProps extends AppStackScreenProps<"LoanReview"> {}

export const LoanReviewScreen: React.FC<LoanReviewScreenProps> = ({ navigation, route }) => {
  const { loanData } = route.params
  const [isSubmitting, setIsSubmitting] = useState(false)
  const creditCheckStarted = useRef(false)

  // Add header with back button
  useHeader(
    {
      leftIcon: "back",
      onLeftPress: () => navigation.goBack(),
      title: "Loan Review",
    },
    [navigation],
  )

  
  const {
    user,
    currentLoan,
    loading,
    setLoading,
    error,
    setError,
    notifications,
    setNotifications,
    createLoan,
  } = useContext(AppContext)!

  
  const [agreesToTerms, setAgreesToTerms] = useState(false)
  const [creditCheckComplete, setCreditCheckComplete] = useState(false)
  const [estimatedApprovalTime, setEstimatedApprovalTime] = useState("")
  const [riskAssessment, setRiskAssessment] = useState("")

  
  const calculateRiskLevel = (creditScore: number, amount: number): string => {
    if (creditScore > 750 && amount < 200) return "Low Risk"
    if (creditScore > 650 && amount < 300) return "Medium Risk"
    if (creditScore > 600) return "High Risk"
    return "Very High Risk"
  }

  
  const getApprovalTimeEstimate = (riskLevel: string): string => {
    switch (riskLevel) {
      case "Low Risk":
        return "2-5 minutes"
      case "Medium Risk":
        return "5-15 minutes"
      case "High Risk":
        return "15-30 minutes"
      default:
        return "1-24 hours"
    }
  }

  
  const performCreditCheck = useCallback(async () => {
    if (creditCheckStarted.current) return

    creditCheckStarted.current = true
    setLoading(true)
    try {
      
      const response = await fetch("http://localhost:3001/api/credit-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: loanData.amount,
          requestId: Date.now(), 
        }),
      })

      const _data = await response.json()
      setCreditCheckComplete(true)

      
      if (user?.creditScore) {
        const risk = calculateRiskLevel(user.creditScore, loanData.amount)
        setRiskAssessment(risk)
        setEstimatedApprovalTime(getApprovalTimeEstimate(risk))
      }
    } catch (error) {
      console.error("Credit check failed:", error)
      setCreditCheckComplete(true) // Set to true even on error to prevent retry loop
    }
    setLoading(false)
  }, [user?.id, user?.creditScore, loanData.amount])

  
  const submitLoanApplication = async () => {
    if (!agreesToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create loan in database only after user accepts terms
      await createLoan(
        loanData.amount,
        loanData.tip,
        loanData.deliveryMethod || "express",
        loanData.deliveryFee ?? 8.49,
      )

      
      setNotifications([
        ...notifications,
        `Cash advance application submitted for $${loanData.amount} with $${loanData.tip} tip!`,
      ])

      
      await fetch("http://localhost:3001/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          message: `Loan application for $${loanData.amount} submitted`,
          type: "loan_submitted",
        }),
      })

      
      navigation.navigate("LoanSuccess", {
        loanId: currentLoan?.id || Date.now(), // Use currentLoan from context or fallback
        estimatedTime: estimatedApprovalTime,
      })
    } catch {
      setError("Failed to submit application")
      Alert.alert("Submission Failed", "Please try again or contact support.")
    }
    setIsSubmitting(false)
  }

  
  useEffect(() => {
    if (user?.id && !creditCheckComplete && !creditCheckStarted.current) {
      performCreditCheck()
    }
  }, [user?.id, creditCheckComplete, performCreditCheck])

  
  const monthlyIncome = 4500 
  const debtToIncomeRatio = (loanData.amount / monthlyIncome) * 100
  const isHighRisk = debtToIncomeRatio > 30
  const recommendedAmount = Math.floor(monthlyIncome * 0.2)

  
  const getRiskColor = () => {
    if (riskAssessment === "Low Risk") return colors.palette.success600
    if (riskAssessment === "Medium Risk") return colors.palette.warning600
    return colors.palette.error600
  }

  const getRiskBadgeStyle = () => {
    if (riskAssessment === "Low Risk") return styles.riskBadgeLow
    if (riskAssessment === "Medium Risk") return styles.riskBadgeMedium
    return styles.riskBadgeHigh
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={styles.screen}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={[typography.displaySmall, styles.headerTitle]}>Review Your Loan</Text>
        <Text style={[typography.bodyLarge, styles.headerSubtitle]}>
          Verify details before final submission
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, shadows.sm]}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
            <Text style={[typography.labelMedium, styles.errorText]}>{error}</Text>
          </View>
        )}

        
        <View style={[styles.loanCard, shadows.lg]}>
          <Text style={[typography.headingMedium, styles.loanTitle]}>Loan Summary</Text>

          <View style={styles.loanDetailsContainer}>
            <View style={styles.loanRow}>
              <Text style={[typography.bodyMedium, styles.loanLabel]}>Loan Amount</Text>
              <Text style={[typography.currencyLarge, styles.loanAmount]}>${loanData.amount}</Text>
            </View>

            <View style={styles.loanRow}>
                          <Text style={[typography.bodyMedium, styles.loanLabel]}>Voluntary Tip</Text>
            <Text style={[typography.currency, styles.loanValue]}>${loanData.tip}</Text>
            </View>

            <View style={styles.loanRow}>
              <Text style={[typography.bodyMedium, styles.loanLabel]}>Delivery</Text>
              <Text style={[typography.currency, styles.loanValue]}>
                {`${loanData.deliveryMethod === "express" ? "Express" : "Standard"}${loanData.deliveryFee ? ` ($${loanData.deliveryFee.toFixed(2)})` : ""}`}
              </Text>
            </View>

            <View style={styles.loanRow}>
              <Text style={[typography.bodyMedium, styles.loanLabel]}>Due Date</Text>
              <Text style={[typography.currency, styles.loanValue]}>
                {new Date(loanData.dueDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={[typography.labelLarge, styles.totalLabel]}>Total Repayment</Text>
                <Text style={[typography.currencyLarge, styles.totalValue]}>
                  ${loanData.amount + loanData.tip + (loanData.deliveryFee || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Credit Check Status */}
        {!creditCheckComplete && (
          <View style={[styles.loadingCard, shadows.sm]}>
            <View style={styles.loadingContent}>
              <Text style={styles.loadingSpinner}>⏳</Text>
              <View style={styles.loadingTextContainer}>
                <Text style={[typography.labelMedium, styles.loadingTitle]}>
                  Verifying Credit Profile
                </Text>
                <Text style={[typography.bodySmall, styles.loadingText]}>
                  This may take a moment...
                </Text>
              </View>
            </View>
          </View>
        )}

        
        {creditCheckComplete && (
          <View style={[styles.riskCard, shadows.md]}>
            <View style={styles.riskHeader}>
              <Text style={[typography.headingSmall, styles.riskTitle]}>Risk Assessment</Text>
              <View style={[styles.riskBadge, getRiskBadgeStyle()]}>
                <Text style={[typography.caption, styles.riskBadgeText]}>{riskAssessment}</Text>
              </View>
            </View>

            <View style={styles.riskGrid}>
              <View style={styles.riskItem}>
                <Text style={[typography.caption, styles.riskItemLabel]}>Risk Level</Text>
                <Text style={[typography.labelMedium, { color: getRiskColor() }]}>
                  {riskAssessment}
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={[typography.caption, styles.riskItemLabel]}>Approval Time</Text>
                <Text style={[typography.labelMedium, styles.riskItemValue]}>
                  {estimatedApprovalTime}
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={[typography.caption, styles.riskItemLabel]}>Debt Ratio</Text>
                <Text style={[typography.labelMedium, styles.riskItemValue]}>
                  {debtToIncomeRatio.toFixed(1)}%
                </Text>
              </View>
            </View>

            
            {isHighRisk && (
              <View style={[styles.warningContainer, shadows.sm]}>
                <Text style={styles.warningIcon}>💡</Text>
                <View style={styles.warningContent}>
                  <Text style={[typography.labelMedium, styles.warningTitle]}>
                    Consider Lower Amount
                  </Text>
                  <Text style={[typography.bodySmall, styles.warningText]}>
                    High debt-to-income ratio detected. Recommended amount: ${recommendedAmount}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        
        <View style={[styles.termsCard, shadows.md]}>
          <Text style={[typography.headingSmall, styles.termsTitle]}>Terms & Conditions</Text>

          <TouchableOpacity
            onPress={() => setAgreesToTerms(!agreesToTerms)}
            style={[styles.checkboxContainer, agreesToTerms && styles.checkboxContainerActive]}
          >
            <View style={[styles.checkbox, agreesToTerms && styles.checkboxActive]}>
              {agreesToTerms && <Text style={styles.checkboxIcon}>✓</Text>}
            </View>
            <Text style={[typography.bodyMedium, styles.checkboxText]}>
              I agree to the terms and conditions, privacy policy, and understand that this loan
              must be repaid by the due date.
            </Text>
          </TouchableOpacity>

          
          <View style={styles.termsDetails}>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={[typography.bodySmall, styles.termText]}>Late repayment fee: $25</Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={[typography.bodySmall, styles.termText]}>
                Automatic debit on due date
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={[typography.bodySmall, styles.termText]}>
                Maximum {loanData.amount > 200 ? "2" : "1"} extension(s) available
              </Text>
            </View>
          </View>
        </View>

        
        <View style={styles.buttonContainer}>
          <Button
            text={isSubmitting ? "Submitting Application..." : "Submit Application"}
            onPress={submitLoanApplication}
            style={[
              styles.submitButton,
              agreesToTerms && creditCheckComplete && !isSubmitting
                ? styles.submitButtonEnabled
                : styles.submitButtonDisabled,
              shadows.md,
            ]}
            textStyle={[
              typography.buttonLarge,
              agreesToTerms && creditCheckComplete && !isSubmitting
                ? styles.submitButtonTextEnabled
                : styles.submitButtonTextDisabled,
            ]}
            disabled={!agreesToTerms || !creditCheckComplete || isSubmitting || loading}
          />

          <Button
            text="Back to Amount Selection"
            onPress={() => navigation.goBack()}
            style={[styles.backButton, shadows.sm]}
            textStyle={[typography.buttonMedium, styles.backButtonText]}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.palette.neutral50,
  },
  headerSection: {
    backgroundColor: colors.palette.primary600,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  headerTitle: {
    color: colors.palette.surface,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: colors.palette.primary100,
    textAlign: "center",
    opacity: 0.9,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md,
  },
  errorContainer: {
    backgroundColor: colors.palette.error50,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorIconText: {
    fontSize: 20,
  },
  errorText: {
    color: colors.palette.error700,
    flex: 1,
  },
  loanCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  loanTitle: {
    color: colors.palette.neutral900,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  loanDetailsContainer: {
    gap: spacing.sm,
  },
  loanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  loanLabel: {
    color: colors.palette.neutral600,
  },
  loanAmount: {
    color: colors.palette.primary600,
  },
  loanValue: {
    color: colors.palette.neutral900,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral200,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: colors.palette.neutral900,
  },
  totalValue: {
    color: colors.palette.primary600,
  },
  loadingCard: {
    backgroundColor: colors.palette.accent50,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingSpinner: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  loadingTextContainer: {
    flex: 1,
  },
  loadingTitle: {
    color: colors.palette.accent700,
    marginBottom: spacing.xs,
  },
  loadingText: {
    color: colors.palette.accent600,
  },
  riskCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  riskTitle: {
    color: colors.palette.neutral900,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  riskBadgeLow: {
    backgroundColor: colors.palette.success50,
  },
  riskBadgeMedium: {
    backgroundColor: colors.palette.warning50,
  },
  riskBadgeHigh: {
    backgroundColor: colors.palette.error50,
  },
  riskBadgeText: {
    color: colors.palette.neutral700,
    fontWeight: "600",
  },
  riskGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  riskItem: {
    alignItems: "center",
    flex: 1,
  },
  riskItemLabel: {
    color: colors.palette.neutral500,
    marginBottom: spacing.xs,
  },
  riskItemValue: {
    color: colors.palette.neutral900,
  },
  warningContainer: {
    backgroundColor: colors.palette.warning50,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    color: colors.palette.warning700,
    marginBottom: spacing.xs,
  },
  warningText: {
    color: colors.palette.warning600,
  },
  termsCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  termsTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.palette.neutral50,
    borderWidth: 1,
    borderColor: colors.palette.neutral200,
    marginBottom: spacing.lg,
  },
  checkboxContainerActive: {
    backgroundColor: colors.palette.primary50,
    borderColor: colors.palette.primary600,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.palette.neutral300,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  checkboxActive: {
    backgroundColor: colors.palette.primary600,
    borderColor: colors.palette.primary600,
  },
  checkboxIcon: {
    color: colors.palette.surface,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxText: {
    color: colors.palette.neutral700,
    flex: 1,
    lineHeight: 22,
  },
  termsDetails: {
    gap: spacing.sm,
  },
  termItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  termBullet: {
    color: colors.palette.primary600,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  termText: {
    color: colors.palette.neutral600,
    flex: 1,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  submitButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  submitButtonEnabled: {
    backgroundColor: colors.palette.primary600,
  },
  submitButtonDisabled: {
    backgroundColor: colors.palette.neutral300,
  },
  submitButtonTextEnabled: {
    color: colors.palette.surface,
  },
  submitButtonTextDisabled: {
    color: colors.palette.neutral500,
  },
  backButton: {
    backgroundColor: colors.palette.surface,
    borderWidth: 1,
    borderColor: colors.palette.neutral300,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    color: colors.palette.neutral600,
  },
})
