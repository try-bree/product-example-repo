import { useEffect, useState } from "react"
import { StyleSheet, TouchableOpacity, View, Alert, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/services/api"
import { colors, spacing, typography, shadows, radius } from "@/theme"

export const AdminScreen = () => {
  const insets = useSafeAreaInsets()
  const [pendingLoans, setPendingLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPendingLoans()
  }, [])

  const fetchPendingLoans = async () => {
    try {
      setLoading(true)
      const allLoans = await api.getLoanHistory(1)
      const pending = allLoans.filter((loan: any) => loan.status === "pending")
      setPendingLoans(pending)
    } catch (error) {
      console.error("Failed to fetch pending loans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveLoan = async (loanId: number) => {
    const confirmed = Platform.OS === "web"
      ? window.confirm("Are you sure you want to approve this loan?")
      : await new Promise<boolean>((resolve) =>
          Alert.alert("Approve Loan", "Are you sure you want to approve this loan?", [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Approve", onPress: () => resolve(true) },
          ]),
        )

    if (!confirmed) return

    try {
      await api.updateLoanStatus(loanId, "approved")
      fetchPendingLoans()
    } catch (error) {
      Platform.OS === "web" ? window.alert("Failed to approve loan") : Alert.alert("Error", "Failed to approve loan")
    }
  }

  const handleRejectLoan = async (loanId: number) => {
    const confirmed = Platform.OS === "web"
      ? window.confirm("Are you sure you want to reject this loan?")
      : await new Promise<boolean>((resolve) =>
          Alert.alert("Reject Loan", "Are you sure you want to reject this loan?", [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Reject", style: "destructive", onPress: () => resolve(true) },
          ]),
        )

    if (!confirmed) return

    try {
      await api.updateLoanStatus(loanId, "rejected")
      fetchPendingLoans()
    } catch (error) {
      Platform.OS === "web" ? window.alert("Failed to reject loan") : Alert.alert("Error", "Failed to reject loan")
    }
  }

  const LoanCard = ({ loan }: { loan: any }) => (
    <View style={[styles.loanCard, shadows.md]}>
      <View style={styles.loanHeader}>
        <Text style={[typography.headingSmall, styles.loanTitle]}>Loan #{loan.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={[typography.caption, styles.statusText]}>PENDING</Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <View style={styles.detailRow}>
          <Text style={[typography.bodyMedium, styles.detailLabel]}>Amount:</Text>
          <Text style={[typography.bodyMedium, styles.detailValue]}>${loan.amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[typography.bodyMedium, styles.detailLabel]}>Tip:</Text>
          <Text style={[typography.bodyMedium, styles.detailValue]}>${loan.tip}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[typography.bodyMedium, styles.detailLabel]}>Risk Level:</Text>
          <Text style={[typography.bodyMedium, styles.detailValue]}>
            {loan.riskLevel || loan.risk_level}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[typography.bodyMedium, styles.detailLabel]}>Due Date:</Text>
          <Text style={[typography.bodyMedium, styles.detailValue]}>
            {new Date(loan.dueDate || loan.due_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.rejectButton, shadows.sm]}
          onPress={() => handleRejectLoan(loan.id)}
        >
          <Text style={[typography.buttonMedium, styles.rejectButtonText]}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.approveButton, shadows.sm]}
          onPress={() => handleApproveLoan(loan.id)}
        >
          <Text style={[typography.buttonMedium, styles.approveButtonText]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Screen preset="scroll" style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[typography.displaySmall, styles.headerTitle]}>Admin Panel</Text>
        <Text style={[typography.bodyLarge, styles.headerSubtitle]}>
          Manage pending loan applications
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <Text style={[typography.headingMedium, styles.statsTitle]}>Pending Applications</Text>
          <Text style={[typography.displaySmall, styles.statsNumber]}>
            {pendingLoans.length}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[typography.bodyMedium, styles.loadingText]}>Loading loans...</Text>
          </View>
        ) : pendingLoans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[typography.headingSmall, styles.emptyTitle]}>
              No Pending Applications
            </Text>
            <Text style={[typography.bodyMedium, styles.emptyMessage]}>
              All loan applications have been processed
            </Text>
          </View>
        ) : (
          pendingLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.sm,
  },
  approveButton: {
    backgroundColor: colors.palette.success50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  approveButtonText: {
    color: colors.palette.success600,
  },
  container: {
    backgroundColor: colors.palette.neutral50,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  detailLabel: {
    color: colors.palette.neutral600,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  detailValue: {
    color: colors.palette.neutral900,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    color: colors.palette.neutral600,
    textAlign: "center",
  },
  emptyTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
  header: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerSubtitle: {
    color: colors.palette.neutral600,
    marginTop: spacing.xs,
  },
  headerTitle: {
    color: colors.palette.neutral900,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  loadingText: {
    color: colors.palette.neutral600,
  },
  loanCard: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.md,
  },
  loanDetails: {
    marginBottom: spacing.sm,
  },
  loanHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  loanTitle: {
    color: colors.palette.neutral900,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: colors.palette.error50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rejectButtonText: {
    color: colors.palette.error600,
  },
  statsCard: {
    alignItems: "center",
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  statsNumber: {
    color: colors.palette.primary600,
    fontWeight: "bold",
  },
  statsTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    backgroundColor: colors.palette.warning50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  statusText: {
    color: colors.palette.warning600,
    fontWeight: "bold",
  },
})
