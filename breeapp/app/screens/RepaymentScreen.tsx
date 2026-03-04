/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/sort-styles */
/* eslint-disable prettier/prettier */
import { useEffect, useState, useCallback } from "react"
import { Alert, Platform, StyleSheet, View } from "react-native"

import { ActiveLoanCard } from "@/components/ActiveLoanCard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useApp } from "@/context/AppContext"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { api } from "@/services/api"
import { colors, spacing, typography, shadows, radius } from "@/theme"
import { useHeader } from "@/utils/useHeader"

interface RepaymentScreenProps extends AppStackScreenProps<"Repayment"> {}

export const RepaymentScreen: React.FC<RepaymentScreenProps> = ({ navigation }) => {
  const { user } = useApp()
  const [activeLoan, setActiveLoan] = useState<any>(null)
  const [loadingAction, setLoadingAction] = useState(false)

  useHeader(
    {
      leftIcon: "back",
      onLeftPress: () => navigation.goBack(),
      title: "Repay Cash Advance",
    },
    [navigation],
  )

  const fetchActiveLoan = useCallback(async () => {
    if (!user) return
    try {
      const loan = await api.getActiveLoan(user.id)
      setActiveLoan(loan)
    } catch {
      // noop
    }
  }, [user])

  useEffect(() => {
    fetchActiveLoan()
  }, [fetchActiveLoan])

  const handleCancel = async () => {
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
      setLoadingAction(true)
      await api.cancelLoan(activeLoan.id)
      await fetchActiveLoan()
    } finally {
      setLoadingAction(false)
    }
  }

  const handlePayBack = async () => {
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
      setLoadingAction(true)
      await api.payBackLoan(activeLoan.id, totalOwed)
      await fetchActiveLoan()
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={styles.screen}>
      <View style={styles.container}>
        {!activeLoan ? (
          <View style={[styles.emptyCard, shadows.sm]}>
            <Text style={[typography.bodyMedium, styles.emptyText]}>No active loan to repay.</Text>
          </View>
        ) : (
          <ActiveLoanCard loan={activeLoan} onCancel={handleCancel} onPayBack={handlePayBack} loading={loadingAction} />
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.palette.neutral50,
  },
  container: {
    padding: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.palette.neutral600,
  },
})


