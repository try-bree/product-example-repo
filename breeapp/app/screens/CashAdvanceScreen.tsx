/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/sort-styles */
/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback, useMemo } from "react"
import { Alert, Platform, StyleSheet, TouchableOpacity, View, Animated } from "react-native"
import { useFocusEffect } from "@react-navigation/native"

import { ActiveLoanCard } from "@/components/ActiveLoanCard"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TipSelector } from "@/components/TipSelector"
import { AppContext, useApp } from "@/context/AppContext"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { api } from "@/services/api"
import { colors, spacing, typography, shadows, radius } from "@/theme"
import { useHeader } from "@/utils/useHeader"

interface CashAdvanceScreenProps extends AppStackScreenProps<"CashAdvance"> {}

export const CashAdvanceScreen: React.FC<CashAdvanceScreenProps> = ({ navigation }) => {
  const {
    user,
    selectedAmount,
    setSelectedAmount,
    loading,
    setLoading,
    error: appError,
    setError: setAppError,
    isEligible: appIsEligible,
    setIsEligible: setAppIsEligible,
    checkEligibility,
    createLoan,
    calculateDefaultTip,
  } = useApp()

  const [localLoading, setLocalLoading] = useState(false)
  const [animatedValue] = useState(new Animated.Value(0))

  // Add active loan state
  const [activeLoan, setActiveLoan] = useState<any>(null)
  const [loadingLoanAction, setLoadingLoanAction] = useState<boolean>(false)

  // Add tip state - default to 10% tip
  const [selectedTip, setSelectedTip] = useState<number>(calculateDefaultTip(selectedAmount))

  // Update tip when amount changes
  useEffect(() => {
    setSelectedTip(calculateDefaultTip(selectedAmount))
  }, [selectedAmount, calculateDefaultTip])

  // Add header with back button
  useHeader(
    {
      leftIcon: "back",
      onLeftPress: () => navigation.goBack(),
      title: "Cash Advance",
    },
    [navigation],
  )
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Complex validation in component
  const validateAmount = (amount: number): string[] => {
    const errors: string[] = []
    if (amount < 50) errors.push("Minimum amount is $50")
    if (amount > 500) errors.push("Maximum amount is $500")
    if (amount % 25 !== 0) errors.push("Amount must be in $25 increments")
    return errors
  }

  const isEligible = useMemo(() => {
    if (!user) return false
    
    const hasActiveLoan = activeLoan !== null
    if (hasActiveLoan) return false
    
    return selectedAmount >= 50 && selectedAmount <= 500 && user.creditScore >= 600
  }, [user, selectedAmount, activeLoan])

  // API call directly in component
  const checkEligibilityInComponent = async (amount: number) => {
    if (!user) return

    
    try {
      const response = await fetch(`http://localhost:3001/api/check-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount }),
      })
      const eligibilityData = await response.json()
      console.log("🔍 Eligibility check:", eligibilityData)
    } catch (err) {
      console.error("Eligibility check failed:", err)
      setAppError("Failed to check eligibility")
    }
  }

  // Fetch active loan on mount
  useEffect(() => {
    if (user) {
      fetchActiveLoan()
    }
  }, [user])

  const fetchActiveLoan = async () => {
    if (!user) return

    try {
      const loan = await api.getActiveLoan(user!.id)
      console.log("📋 Fetched active loan:", loan)
      setActiveLoan(loan)
    } catch (error) {
      console.error("Failed to fetch active loan:", error)
    }
  }

  const _handleCancelLoan = async () => {
    if (!activeLoan) return

    const confirmed = Platform.OS === "web"
      ? window.confirm("Are you sure you want to cancel this loan application?")
      : await new Promise<boolean>((resolve) =>
          Alert.alert("Cancel Loan", "Are you sure you want to cancel this loan application?", [
            { text: "No", style: "cancel", onPress: () => resolve(false) },
            { text: "Yes, Cancel", style: "destructive", onPress: () => resolve(true) },
          ]),
        )

    if (!confirmed) return

    try {
      setLoadingLoanAction(true)
      await api.cancelLoan(activeLoan.id)
      setActiveLoan(null)
      setAppError(null)
      await fetchActiveLoan()
      await checkEligibilityInComponent(selectedAmount)
    } catch (error) {
      setAppError("Failed to cancel loan")
    } finally {
      setLoadingLoanAction(false)
    }
  }

  const _handlePayBackLoan = async () => {
    if (!activeLoan) return

    const delivery = activeLoan.deliveryFee || activeLoan.delivery_fee || 0
    const totalOwed = activeLoan.amount + activeLoan.tip + delivery
    const message = `Pay back your cash advance of $${activeLoan.amount} + $${activeLoan.tip} tip${delivery ? ` + $${delivery.toFixed(2)} delivery` : ""} = $${totalOwed} total?`

    const confirmed = Platform.OS === "web"
      ? window.confirm(message)
      : await new Promise<boolean>((resolve) =>
          Alert.alert("Pay Back Loan", message, [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: `Pay $${totalOwed}`, onPress: () => resolve(true) },
          ]),
        )

    if (!confirmed) return

    try {
      setLoadingLoanAction(true)
      await api.payBackLoan(activeLoan.id, totalOwed)
      setActiveLoan(null)
      setAppError(null)
      await fetchActiveLoan()
      await checkEligibilityInComponent(selectedAmount)
    } catch (error) {
      setAppError("Failed to pay back loan")
    } finally {
      setLoadingLoanAction(false)
    }
  }

  
  useEffect(() => {
    const errors = validateAmount(selectedAmount)
    setValidationErrors(errors)

    // Auto-check eligibility when amount changes (BAD UX!)
    if (errors.length === 0 && user?.id) {
      checkEligibilityInComponent(selectedAmount)
    }

    // Animate amount changes
    Animated.spring(animatedValue, {
      toValue: selectedAmount,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start()
  }, [selectedAmount, user?.id])

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchActiveLoan()
        checkEligibilityInComponent(selectedAmount)
      }
    }, [user, selectedAmount]),
  )

  
  const isValidAmount = selectedAmount >= 50 && selectedAmount <= 500
  const canProceed = isValidAmount && isEligible && user?.creditScore && user.creditScore > 600

  
  const handleAmountChange = (value: number) => {
    setSelectedAmount(value)
    // Clear previous errors immediately (BAD UX!)
    setAppError(null)
  }

  
  const submitApplication = async () => {
    if (!user || !isEligible) return

    // Navigate to review WITHOUT creating loan in database yet
    navigation.navigate("LoanReview", {
      loanData: {
        amount: selectedAmount,
        tip: selectedTip,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        riskLevel: "Low Risk",
        userId: user.id, // Add user ID for later loan creation
        // Preselect delivery to match Figma; candidate can make this configurable
        deliveryMethod: "express",
        deliveryFee: 8.49,
      },
    })
  }

  
  const getCreditStatus = () => {
    if (!user?.creditScore) return { text: "Unknown", color: colors.palette.neutral500 }
    if (user.creditScore > 750) return { text: "Excellent", color: colors.palette.success600 }
    if (user.creditScore > 700) return { text: "Very Good", color: colors.palette.primary600 }
    if (user.creditScore > 650) return { text: "Good", color: colors.palette.accent600 }
    if (user.creditScore > 600) return { text: "Fair", color: colors.palette.warning600 }
    return { text: "Poor", color: colors.palette.error600 }
  }

  const creditStatus = getCreditStatus()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={styles.screen}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={[typography.displaySmall, styles.heroTitle]}>Get Cash When You Need It</Text>
        <Text style={[typography.bodyLarge, styles.heroSubtitle]}>
          Fast, transparent, and designed for your financial well-being
        </Text>
      </View>

      <View style={styles.container}>
        {activeLoan ? (
          <>
            <ActiveLoanCard
              loan={activeLoan}
              onCancel={_handleCancelLoan}
              onPayBack={() => navigation.navigate("Repayment")}
              loading={loadingLoanAction}
            />
            <Button
              text="Go to Repayment"
              onPress={() => navigation.navigate("Repayment")}
              style={[styles.actionButton, styles.actionButtonEnabled, shadows.md]}
              textStyle={[typography.buttonLarge, styles.actionButtonTextEnabled]}
            />
          </>
        ) : (
          <>
            {/* Error Display */}
            {appError && (
              <View style={[styles.errorCard, shadows.sm]}>
                <Text style={[typography.bodyMedium, styles.errorText]}>{appError}</Text>
              </View>
            )}

            {/* Amount Selection Card */}
            <View style={[styles.amountCard, shadows.lg]}>
              <Text style={[typography.labelLarge, styles.amountCardTitle]}>Choose Your Amount</Text>

              {/* Amount Display with Animation */}
              <Animated.View style={styles.amountDisplayContainer}>
                <Text style={[typography.currencyLarge, styles.amountDisplay]}>${selectedAmount}</Text>
                <Text style={[typography.caption, styles.amountSubtext]}>
                  Available instantly • No hidden fees
                </Text>
              </Animated.View>

              {/* Premium Amount Selector */}
              <View style={styles.amountGrid}>
                {[50, 75, 100, 150, 200, 250, 300, 400, 500].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => handleAmountChange(amount)}
                    style={[
                      styles.amountOption,
                      selectedAmount === amount && styles.amountOptionSelected,
                      shadows.sm,
                    ]}
                  >
                    <Text
                      style={[
                        typography.labelMedium,
                        selectedAmount === amount
                          ? styles.amountOptionTextSelected
                          : styles.amountOptionText,
                      ]}
                    >
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tip Selection - Modern cash advance approach */}
            <TipSelector
              amount={selectedAmount}
              selectedTip={selectedTip}
              onTipChange={setSelectedTip}
            />

            {/* Advanced Details Toggle */}
            <TouchableOpacity
              onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
              style={[styles.advancedToggle, shadows.sm]}
            >
              <Text style={[typography.labelMedium, styles.advancedToggleText]}>
                {showAdvancedOptions ? "Hide" : "View"} Loan Details
              </Text>
              <Text style={styles.toggleIcon}>{showAdvancedOptions ? "−" : "+"}</Text>
            </TouchableOpacity>


            {showAdvancedOptions && (
              <View style={[styles.advancedCard, shadows.md]}>
                <Text style={[typography.headingSmall, styles.advancedTitle]}>Cash Advance Details</Text>
                <View style={styles.advancedGrid}>
                  <View style={styles.advancedItem}>
                    <Text style={[typography.caption, styles.advancedLabel]}>Interest Rate</Text>
                    <Text style={[typography.labelLarge, styles.advancedValue]}>
                      0% (No Interest)
                    </Text>
                  </View>
                  <View style={styles.advancedItem}>
                    <Text style={[typography.caption, styles.advancedLabel]}>Repayment Term</Text>
                    <Text style={[typography.labelLarge, styles.advancedValue]}>
                      14 days
                    </Text>
                  </View>
                  <View style={styles.advancedItem}>
                    <Text style={[typography.caption, styles.advancedLabel]}>Selected Tip</Text>
                    <Text style={[typography.labelLarge, styles.advancedValue]}>
                      ${selectedTip}
                    </Text>
                  </View>
                </View>
              </View>
            )}


            {(loading || localLoading) && (
              <View style={[styles.loadingContainer, shadows.sm]}>
                <View style={styles.loadingContent}>
                  <Text style={styles.loadingSpinner}>⏳</Text>
                  <Text style={[typography.labelMedium, styles.loadingText]}>
                    Verifying your eligibility...
                  </Text>
                </View>
              </View>
            )}


            <Button
              text={canProceed ? "Continue to Review" : "Complete Requirements Above"}
              onPress={submitApplication}
              style={[
                styles.actionButton,
                canProceed ? styles.actionButtonEnabled : styles.actionButtonDisabled,
                shadows.md,
              ]}
              textStyle={[
                typography.buttonLarge,
                canProceed ? styles.actionButtonTextEnabled : styles.actionButtonTextDisabled,
              ]}
              disabled={!canProceed || loading || localLoading}
            />


            {!isEligible && user?.creditScore && user.creditScore < 600 && (
              <View style={[styles.warningContainer, shadows.sm]}>
                <Text style={styles.warningIcon}>💡</Text>
                <View style={styles.warningContent}>
                  <Text style={[typography.labelMedium, styles.warningTitle]}>
                    Improve Your Chances
                  </Text>
                  <Text style={[typography.bodySmall, styles.warningText]}>
                    Your credit score is below our minimum. Try a smaller amount or work on improving
                    your credit score.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionButtonDisabled: {
    backgroundColor: colors.palette.neutral300,
  },
  actionButtonEnabled: {
    backgroundColor: colors.palette.primary600,
  },
  actionButtonTextDisabled: {
    color: colors.palette.neutral500,
  },
  actionButtonTextEnabled: {
    color: colors.palette.surface,
  },
  advancedCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  advancedGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  advancedItem: {
    alignItems: "center",
    flex: 1,
  },
  advancedLabel: {
    color: colors.palette.neutral500,
    marginBottom: spacing.xs,
  },
  advancedTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  advancedToggle: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  advancedToggleText: {
    color: colors.palette.neutral700,
    marginRight: spacing.sm,
  },
  advancedValue: {
    color: colors.palette.neutral900,
  },
  amountCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  amountCardTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  amountDisplay: {
    color: colors.palette.primary600,
    marginBottom: spacing.xs,
  },
  amountDisplayContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  amountOption: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
    borderRadius: radius.lg,
    minWidth: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  amountOptionSelected: {
    backgroundColor: colors.palette.primary600,
  },
  amountOptionText: {
    color: colors.palette.neutral700,
  },
  amountOptionTextSelected: {
    color: colors.palette.surface,
  },
  amountSubtext: {
    color: colors.palette.neutral500,
  },
  container: {
    padding: spacing.lg,
  },
  creditScoreContainer: {
    alignItems: "center",
    backgroundColor: colors.palette.success50,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  creditScoreText: {
    color: colors.palette.success700,
    fontWeight: "600",
  },
  dueDateText: {
    color: colors.palette.neutral500,
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: colors.palette.error50,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorText: {
    color: colors.palette.error600,
  },
  feeLabel: {
    color: colors.palette.neutral600,
  },
  feeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  feeSummary: {
    marginBottom: spacing.md,
  },
  feeSummaryContainer: {
    borderTopColor: colors.palette.neutral200,
    borderTopWidth: 1,
    paddingTop: spacing.lg,
  },
  feeSummaryTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  feeValue: {
    color: colors.palette.neutral900,
  },
  heroSection: {
    alignItems: "center",
    backgroundColor: colors.palette.primary600,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroSubtitle: {
    color: colors.palette.primary100,
    opacity: 0.9,
    textAlign: "center",
  },
  heroTitle: {
    color: colors.palette.surface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  loadingContainer: {
    backgroundColor: colors.palette.accent50,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  loadingContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingSpinner: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  loadingText: {
    color: colors.palette.accent700,
  },
  screen: {
    backgroundColor: colors.palette.neutral50,
  },
  toggleIcon: {
    color: colors.palette.neutral700,
    fontSize: 18,
    fontWeight: "600",
  },
  totalLabel: {
    color: colors.palette.neutral900,
  },
  totalRow: {
    borderTopColor: colors.palette.neutral200,
    borderTopWidth: 1,
    marginBottom: 0,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalValue: {
    color: colors.palette.primary600,
  },
  userCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  userCardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userSubtext: {
    color: colors.palette.neutral600,
  },
  warningContainer: {
    alignItems: "flex-start",
    backgroundColor: colors.palette.warning50,
    borderRadius: radius.lg,
    flexDirection: "row",
    padding: spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  warningText: {
    color: colors.palette.warning600,
  },
  warningTitle: {
    color: colors.palette.warning700,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
})
