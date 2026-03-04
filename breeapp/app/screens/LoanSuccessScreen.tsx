/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-curly-brace-presence */
import { useContext, useEffect, useState } from "react"
import { Alert, StyleSheet, TouchableOpacity, View, Share, Animated } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppContext } from "@/context/AppContext"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { colors, spacing, typography, shadows, radius } from "@/theme"
import { useHeader } from "@/utils/useHeader"

interface LoanSuccessScreenProps extends AppStackScreenProps<"LoanSuccess"> {}

export const LoanSuccessScreen: React.FC<LoanSuccessScreenProps> = ({ navigation, route }) => {
  const { loanId, estimatedTime } = route.params

  // Add header with close button
  useHeader(
    {
      leftIcon: "x",
      onLeftPress: () => navigation.navigate("MainTabs"),
      title: "Loan Approved!",
    },
    [navigation],
  )

  const {
    user,
    currentLoan,
    notifications,
    setNotifications,
    loading,
    setLoading,
    error,
    setError,
  } = useContext(AppContext)!

  const [showDetails, setShowDetails] = useState(false)
  const [confettiVisible, setConfettiVisible] = useState(true)
  const [shareCount, setShareCount] = useState(0)
  const [submittedAt] = useState(() => new Date())
  const [referenceId] = useState(() => `BR-${Date.now()}`)
  const [celebrationAnim] = useState(new Animated.Value(0))
  const [statusAnim] = useState(new Animated.Value(0))

  const formatTimeRemaining = (timeStr: string): string => {
    if (timeStr.includes("minutes")) {
      return timeStr.replace("minutes", "mins")
    }
    if (timeStr.includes("hours")) {
      return timeStr.replace("hours", "hrs")
    }
    return timeStr
  }

  const sendConfirmationEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          loanId: loanId,
          email: user?.email,
          amount: currentLoan?.amount,
        }),
      })

      if (response.ok) {
        setNotifications([...notifications, "Confirmation email sent!"])
        Alert.alert("Email Sent", "Check your inbox for confirmation details.")
      }
    } catch {
      setError("Failed to send confirmation email")
    }
    setLoading(false)
  }

  useEffect(() => {
    // Auto-hide confetti after 3 seconds (BAD UX decision in component)
    const timer = setTimeout(() => {
      setConfettiVisible(false)
    }, 3000)

    if (currentLoan?.amount && currentLoan.amount > 300) {
      setNotifications([...notifications, "Large loan amount - extra verification may be required"])
    }

    // Celebration animations
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(statusAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    return () => clearTimeout(timer)
  }, [currentLoan?.amount, setNotifications, notifications])

  const handleShare = async () => {
    setShareCount(shareCount + 1)
    try {
      const message = `Just got approved for a $${currentLoan?.amount} cash advance with Bree! 💰`
      const result = await Share.share({
        message: message,
        title: "Bree Cash Advance",
      })

      if (result.action === Share.sharedAction) {
        setNotifications([...notifications, "Thanks for sharing!"])

        if (shareCount >= 2) {
          setNotifications([...notifications, "Share bonus: $5 credit applied!"])
        }
      }
    } catch {
      Alert.alert("Share Failed", "Unable to share at this time.")
    }
  }

  const goToHome = () => {
    if (currentLoan?.status === "pending") {
      setNotifications([...notifications, "We'll notify you when your loan is approved!"])
    }
    navigation.navigate("Welcome")
  }

  const LoanSummaryCard = ({
    amount,
    tip,
    deliveryMethod,
    deliveryFee,
    total,
    dueDate,
    style,
    textColor,
    bgColor,
  }: {
    amount: number
    tip: number
    deliveryMethod?: string
    deliveryFee?: number
    total: number
    dueDate: string
    style: any
    textColor: string
    bgColor: string
  }) => (
    <View style={[styles.loanSummaryCard, { backgroundColor: bgColor }, style, shadows.lg]}>
      <Text style={[typography.headingSmall, styles.summaryTitle]}>Cash Advance Summary</Text>

      <DetailRow label="Advance Amount" value={`$${amount}`} />
      <DetailRow label="Voluntary Tip" value={`$${tip}`} />
      <DetailRow
        label="Delivery"
        value={`${deliveryMethod === "express" ? "Express" : "Standard"}${deliveryFee ? ` ($${deliveryFee.toFixed(2)})` : ""}`}
      />
      <DetailRow label="Total Due" value={`$${total}`} />
      <DetailRow
        label="Due Date"
        value={(() => {
          try {
            const date = new Date(dueDate)
            if (isNaN(date.getTime())) {
              return "Invalid Date"
            }
            return date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          } catch {
            return "Invalid Date"
          }
        })()}
      />
    </View>
  )

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
      <Text style={[typography.bodyMedium, { color: colors.palette.neutral600 }]}>{label}</Text>
      <Text style={[typography.currency, { color: colors.palette.neutral900 }]}>{value}</Text>
    </View>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return colors.palette.success600
      case "pending":
        return colors.palette.warning600
      case "rejected":
        return colors.palette.error600
      default:
        return colors.palette.neutral500
    }
  }

  const getStatusBackgroundColor = () => {
    if (currentLoan?.status === "approved") return colors.palette.success50
    if (currentLoan?.status === "pending") return colors.palette.warning50
    return colors.palette.error50
  }

  const getStatusIcon = () => {
    if (currentLoan?.status === "approved") return "✓"
    if (currentLoan?.status === "pending") return "⏳"
    return "⚠️"
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={styles.screen}>
      {/* Hero Celebration Section */}
      <View style={styles.heroSection}>
        {confettiVisible && (
          <Animated.View
            style={[
              styles.confettiContainer,
              {
                opacity: celebrationAnim,
                transform: [{ scale: celebrationAnim }],
              },
            ]}
          >
            <Text style={styles.confettiIcon}>🎉</Text>
            <Text style={styles.confettiIcon}>💰</Text>
            <Text style={styles.confettiIcon}>✨</Text>
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.heroContent,
            {
              opacity: celebrationAnim,
              transform: [{ translateY: Animated.multiply(celebrationAnim, -20) }],
            },
          ]}
        >
          <Text style={[typography.displayMedium, styles.successTitle]}>
            Application Submitted!
          </Text>
          <Text style={[typography.bodyLarge, styles.successSubtitle]}>
            Your loan application has been received and is being processed
          </Text>
          <View style={styles.timeEstimateContainer}>
            <Text style={styles.timeIcon}>⏱️</Text>
            <Text style={[typography.labelLarge, styles.estimatedTime]}>
              Estimated approval: {formatTimeRemaining(estimatedTime)}
            </Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.container}>
        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, shadows.sm]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[typography.labelMedium, styles.errorText]}>{error}</Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.statusCard,
            shadows.md,
            { backgroundColor: getStatusBackgroundColor() },
            { opacity: statusAnim, transform: [{ scale: statusAnim }] },
          ]}
        >
          <View style={styles.statusHeader}>
            <View>
              <Text style={[typography.headingSmall, styles.statusLabel]}>
                {currentLoan?.status || "Pending"}
              </Text>
              <Text style={[typography.caption, styles.loanIdLabel]}>Loan ID: #{loanId}</Text>
            </View>
            <View
              style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(currentLoan?.status || "pending") },
              ]}
            >
              <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
            </View>
          </View>
        </Animated.View>

        {currentLoan && (
          <LoanSummaryCard
            amount={currentLoan.amount}
            tip={currentLoan.tip || 0}
            deliveryMethod={
              (currentLoan as any).deliveryMethod || (currentLoan as any).delivery_method
            }
            deliveryFee={(currentLoan as any).deliveryFee ?? (currentLoan as any).delivery_fee ?? 0}
            total={
              currentLoan.amount +
              (currentLoan.tip || 0) +
              (((currentLoan as any).deliveryFee ?? (currentLoan as any).delivery_fee) || 0)
            }
            dueDate={currentLoan.dueDate || (currentLoan as any).due_date}
            style={{}} // Empty style object (BAD!)
            textColor={colors.palette.neutral900}
            bgColor={colors.palette.surface}
          />
        )}

        <View style={[styles.nextStepsCard, shadows.md]}>
          <Text style={[typography.headingSmall, styles.nextStepsTitle]}>What&apos;s Next?</Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[typography.bodyMedium, styles.stepText]}>
                {currentLoan?.amount && currentLoan.amount > 250
                  ? "Additional verification (1-2 hours)"
                  : "Automated approval (5-15 minutes)"}
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[typography.bodyMedium, styles.stepText]}>
                Funds deposited to your account
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[typography.bodyMedium, styles.stepText]}>
                Automatic repayment on due date
              </Text>
            </View>
          </View>

          {user?.creditScore && user.creditScore < 650 && (
            <View style={[styles.creditWarning, shadows.sm]}>
              <Text style={styles.warningIcon}>💡</Text>
              <Text style={[typography.bodySmall, styles.creditWarningText]}>
                Note: Lower credit scores may require additional verification steps.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            text={loading ? "Sending..." : "Send Confirmation Email"}
            onPress={sendConfirmationEmail}
            style={[styles.primaryButton, shadows.md]}
            textStyle={[typography.buttonLarge, styles.primaryButtonText]}
            disabled={loading}
          />

          <Button
            text="Share Good News"
            onPress={handleShare}
            style={[styles.shareButton, shadows.md]}
            textStyle={[typography.buttonMedium, styles.shareButtonText]}
          />

          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={[styles.detailsToggle, shadows.sm]}
          >
            <Text style={[typography.labelMedium, styles.detailsToggleText]}>
              {showDetails ? "Hide Details" : "Show Details"}
            </Text>
            <Text style={styles.toggleIcon}>{showDetails ? "−" : "+"}</Text>
          </TouchableOpacity>
        </View>

        {showDetails && (
          <View style={[styles.detailsCard, shadows.md]}>
            <Text style={[typography.headingSmall, styles.detailsTitle]}>Application Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={[typography.caption, styles.detailLabel]}>Submitted</Text>
                <Text style={[typography.bodySmall, styles.detailValue]}>
                  {submittedAt.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[typography.caption, styles.detailLabel]}>Reference</Text>
                <Text style={[typography.bodySmall, styles.detailValue]}>{referenceId}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[typography.caption, styles.detailLabel]}>Processing Time</Text>
                <Text style={[typography.bodySmall, styles.detailValue]}>{estimatedTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[typography.caption, styles.detailLabel]}>Share Count</Text>
                <Text style={[typography.bodySmall, styles.detailValue]}>
                  {shareCount} {shareCount >= 2 ? "(Bonus Earned!)" : ""}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Button */}
        <View style={styles.navigationContainer}>
          <Button
            text="Back to Home"
            onPress={() => navigation.navigate("MainTabs")}
            style={[styles.homeButton, shadows.md]}
            textStyle={[typography.buttonLarge, styles.homeButtonText]}
          />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  confettiContainer: {
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    justifyContent: "space-around",
    left: 0,
    position: "absolute",
    right: 0,
    top: spacing.lg,
  },
  confettiIcon: {
    fontSize: 32,
    opacity: 0.8,
  },
  container: {
    flex: 1,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  creditWarning: {
    alignItems: "flex-start",
    backgroundColor: colors.palette.warning50,
    borderRadius: radius.lg,
    flexDirection: "row",
    padding: spacing.md,
  },
  creditWarningText: {
    color: colors.palette.warning700,
    flex: 1,
  },
  detailItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: colors.palette.neutral500,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  detailValue: {
    color: colors.palette.neutral900,
  },
  detailsCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailsTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  detailsToggle: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    padding: spacing.md,
  },
  detailsToggleText: {
    color: colors.palette.neutral700,
    marginRight: spacing.sm,
  },
  errorContainer: {
    alignItems: "center",
    backgroundColor: colors.palette.error50,
    borderRadius: radius.lg,
    flexDirection: "row",
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  errorText: {
    color: colors.palette.error700,
    flex: 1,
  },
  estimatedTime: {
    color: colors.palette.surface,
  },
  heroContent: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  heroSection: {
    alignItems: "center",
    backgroundColor: colors.palette.primary600,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    position: "relative",
  },
  homeButton: {
    backgroundColor: colors.palette.success600,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  homeButtonText: {
    color: colors.palette.surface,
  },
  loanIdLabel: {
    color: colors.palette.neutral600,
  },
  loanSummaryCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  navigationContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  nextStepsCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  nextStepsTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.palette.primary600,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.palette.surface,
  },
  screen: {
    backgroundColor: colors.palette.neutral50,
  },
  secondaryButton: {
    backgroundColor: colors.palette.surface,
    borderColor: colors.palette.neutral300,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.palette.neutral600,
  },
  shareButton: {
    backgroundColor: colors.palette.accent600,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
  },
  shareButtonText: {
    color: colors.palette.surface,
  },
  statusCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  statusHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusIcon: {
    color: colors.palette.surface,
    fontSize: 24,
  },
  statusIconContainer: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  statusLabel: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
  stepItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: colors.palette.primary600,
    borderRadius: radius.full,
    height: 28,
    justifyContent: "center",
    marginRight: spacing.sm,
    marginTop: spacing.xs,
    width: 28,
  },
  stepNumberText: {
    color: colors.palette.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  stepText: {
    color: colors.palette.neutral700,
    flex: 1,
    lineHeight: 22,
  },
  stepsList: {
    marginBottom: spacing.md,
  },
  successSubtitle: {
    color: colors.palette.primary100,
    marginBottom: spacing.lg,
    opacity: 0.9,
    textAlign: "center",
  },
  successTitle: {
    color: colors.palette.surface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  summaryTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  timeEstimateContainer: {
    alignItems: "center",
    backgroundColor: colors.palette.primary500,
    borderRadius: radius.lg,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  toggleIcon: {
    color: colors.palette.neutral700,
    fontSize: 18,
    fontWeight: "600",
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
})
