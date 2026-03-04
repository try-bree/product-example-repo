/* eslint-disable react-native/sort-styles */
/* eslint-disable no-restricted-imports */
import { FC } from "react"
import { View, StyleSheet } from "react-native"

import { colors, spacing, typography, shadows, radius } from "@/theme"

import { Button } from "./Button"
import { Text } from "./Text"

interface ActiveLoanCardProps {
  loan: any
  onCancel: () => void
  onPayBack: () => void
  loading?: boolean
}

export const ActiveLoanCard: FC<ActiveLoanCardProps> = ({
  loan,
  onCancel,
  onPayBack,
  loading = false,
}) => {
  if (!loan) return null

  const totalOwed = loan.amount + loan.tip + (loan.deliveryFee || loan.delivery_fee || 0)
  const isPending = loan.status === "pending"
  const isApproved = loan.status === "approved"

  const getStatusColor = () => {
    switch (loan.status) {
      case "pending":
        return colors.palette.warning500
      case "approved":
        return colors.palette.success500
      default:
        return colors.palette.neutral500
    }
  }

  const getStatusText = () => {
    switch (loan.status) {
      case "pending":
        return "⏳ Pending Review"
      case "approved":
        return "✅ Ready for Repayment"
      default:
        return loan.status
    }
  }

  return (
    <View style={[styles.container, shadows.md]}>
      <View style={styles.header}>
        <Text style={[typography.headingSmall, styles.title]}>Active Cash Advance</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={[typography.caption, styles.statusText]}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={[typography.bodyMedium, styles.label]}>Advance Amount:</Text>
          <Text style={[typography.bodyMedium, styles.value]}>${loan.amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodyMedium, styles.label]}>Voluntary Tip:</Text>
          <Text style={[typography.bodyMedium, styles.value]}>${loan.tip}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[typography.labelLarge, styles.totalLabel]}>Total to Repay:</Text>
          <Text style={[typography.labelLarge, styles.totalValue]}>${totalOwed}</Text>
        </View>
        {(loan.deliveryFee || loan.delivery_fee) && (
          <View style={styles.row}>
            <Text style={[typography.bodyMedium, styles.label]}>Delivery:</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {(loan.deliveryMethod || loan.delivery_method) === "express" ? "Express" : "Standard"}
              {` ($${((loan.deliveryFee || loan.delivery_fee) as number).toFixed(2)})`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {isPending && (
          <Button
            text="Cancel Application"
            onPress={onCancel}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            disabled={loading}
          />
        )}
        {isApproved && (
          <Button
            text={`Repay $${totalOwed}`}
            onPress={onPayBack}
            style={styles.payButton}
            disabled={loading}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.palette.neutral900,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  statusText: {
    color: colors.palette.surface,
    fontWeight: "600",
    paddingHorizontal: spacing.xs,
    lineHeight: 16,
    letterSpacing: 0.25,
  },
  details: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral200,
  },
  label: {
    color: colors.palette.neutral600,
  },
  value: {
    color: colors.palette.neutral900,
  },
  totalLabel: {
    color: colors.palette.neutral900,
  },
  totalValue: {
    color: colors.palette.primary600,
    fontWeight: "600",
  },
  actions: {
    gap: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.palette.error50,
    borderColor: colors.palette.error500,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: colors.palette.error600,
  },
  payButton: {
    backgroundColor: colors.palette.success600,
  },
})
