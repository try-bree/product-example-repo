import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/services/api"
import { colors, spacing, typography, shadows, radius } from "@/theme"

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets()
  const [hasActiveLoan, setHasActiveLoan] = useState(false)

  function goCashAdvance() {
    navigation.navigate("CashAdvance")
  }

  function goRepayment() {
    navigation.navigate("Repayment")
  }

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true
      const run = async () => {
        try {
          const loan = await api.getActiveLoan(1)
          if (mounted) setHasActiveLoan(!!loan)
        } catch {
          if (mounted) setHasActiveLoan(false)
        }
      }
      run()
      return () => {
        mounted = false
      }
    }, []),
  )

  return (
    <Screen preset="scroll" style={styles.container}>
      {/* Hero Section */}
      <View style={[styles.heroSection, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.heroContent}>
          <Text style={[typography.displaySmall, styles.heroTitle]}>Welcome to Bree</Text>
          <Text style={[typography.bodyLarge, styles.heroSubtitle]}>
            Get the cash you need, instantly
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentWrapper}>
        {/* Quick Action Card */}
        <View style={[styles.quickActionCard, shadows.lg]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Icon icon="heart" size={24} color={colors.palette.primary600} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[typography.headingSmall, styles.cardTitle]}>Cash Advance</Text>
              <Text style={[typography.bodyMedium, styles.cardSubtitle]}>
                Get up to $500 instantly
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={[typography.bodySmall, styles.cardDescription]}>
              No hidden fees • Transparent terms • Quick approval
            </Text>
          </View>

          {hasActiveLoan ? (
            <Button
              text="Repay Active Loan"
              onPress={goRepayment}
              style={styles.secondaryButton}
              textStyle={[typography.buttonMedium, styles.secondaryButtonText]}
            />
          ) : (
            <Button
              text="Get Cash Now"
              onPress={goCashAdvance}
              style={styles.primaryButton}
              textStyle={[typography.buttonMedium, styles.primaryButtonText]}
            />
          )}
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <Text style={[typography.headingSmall, styles.featuresTitle]}>Why Choose Bree?</Text>

          <View style={styles.featuresGrid}>
            <View style={[styles.featureCard, shadows.md]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.palette.accent100 }]}>
                <Icon icon="check" size={20} color={colors.palette.accent600} />
              </View>
              <Text style={[typography.labelMedium, styles.featureTitle]}>Instant Approval</Text>
              <Text style={[typography.caption, styles.featureDescription]}>
                Get approved in under 5 minutes
              </Text>
            </View>

            <View style={[styles.featureCard, shadows.md]}>
              <View
                style={[styles.featureIcon, { backgroundColor: colors.palette.secondary100 }]}
              >
                <Icon icon="lock" size={20} color={colors.palette.secondary600} />
              </View>
              <Text style={[typography.labelMedium, styles.featureTitle]}>Secure & Safe</Text>
              <Text style={[typography.caption, styles.featureDescription]}>
                Bank-level security for your data
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={[typography.caption, styles.trustText]}>
            Your data is encrypted and secure
          </Text>
          <Text style={[typography.caption, styles.trustText]}>
            Trusted by thousands of users
          </Text>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  cardContent: {
    marginBottom: spacing.lg,
  },
  cardDescription: {
    color: colors.palette.neutral500,
    lineHeight: 20,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardSubtitle: {
    color: colors.palette.neutral600,
  },
  cardTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
  container: {
    backgroundColor: colors.palette.neutral50,
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  featureCard: {
    alignItems: "center",
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    flex: 1,
    padding: spacing.md,
  },
  featureDescription: {
    color: colors.palette.neutral600,
    textAlign: "center",
  },
  featureIcon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 40,
  },
  featureTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  featuresGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  featuresTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  heroContent: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },
  heroSection: {
    backgroundColor: colors.palette.primary600,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
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
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.palette.primary50,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 48,
  },
  primaryButton: {
    backgroundColor: colors.palette.primary600,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.palette.surface,
  },
  quickActionCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  secondaryButton: {
    backgroundColor: colors.palette.neutral100,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.palette.neutral900,
  },
  trustSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  trustText: {
    color: colors.palette.neutral500,
    marginBottom: spacing.xs,
  },
})
