import { StyleSheet, TouchableOpacity, View, Alert, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { colors, spacing, typography, shadows, radius } from "@/theme"

export const SettingsScreen = () => {
  const { logout } = useAuth()
  const insets = useSafeAreaInsets()

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        logout()
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout },
      ])
    }
  }

  return (
    <Screen preset="scroll" style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={[typography.headingLarge, styles.headerTitle]}>Settings</Text>
        <Text style={[typography.bodyMedium, styles.headerSubtitle]}>
          Manage your account and preferences
        </Text>
      </View>

      <View style={styles.content}>
        {/* Account Section */}
        <View style={[styles.section, shadows.sm]}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIcon, { backgroundColor: colors.palette.accent100 }]}>
                <Icon icon="ladybug" size={20} color={colors.palette.accent600} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[typography.labelMedium, styles.menuItemTitle]}>
                  Profile Settings
                </Text>
                <Text style={[typography.caption, styles.menuItemSubtitle]}>
                  Update your personal information
                </Text>
              </View>
            </View>
            <Icon icon="caretRight" size={16} color={colors.palette.neutral400} />
          </TouchableOpacity>

          <View style={styles.menuSeparator} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIcon, { backgroundColor: colors.palette.secondary100 }]}>
                <Icon icon="bell" size={20} color={colors.palette.secondary600} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[typography.labelMedium, styles.menuItemTitle]}>Notifications</Text>
                <Text style={[typography.caption, styles.menuItemSubtitle]}>
                  Manage your notification preferences
                </Text>
              </View>
            </View>
            <Icon icon="caretRight" size={16} color={colors.palette.neutral400} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={[styles.section, shadows.sm]}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIcon, { backgroundColor: colors.palette.primary100 }]}>
                <Icon icon="heart" size={20} color={colors.palette.primary600} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[typography.labelMedium, styles.menuItemTitle]}>Help & Support</Text>
                <Text style={[typography.caption, styles.menuItemSubtitle]}>
                  Get help with your account
                </Text>
              </View>
            </View>
            <Icon icon="caretRight" size={16} color={colors.palette.neutral400} />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={[styles.section, shadows.sm]}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutItem}>
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIcon, { backgroundColor: colors.palette.error50 }]}>
                <Icon icon="x" size={20} color={colors.palette.error600} />
              </View>
              <Text style={[typography.labelMedium, styles.logoutText]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.palette.neutral50,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerSubtitle: {
    color: colors.palette.neutral600,
    marginTop: spacing.xs,
  },
  headerTitle: {
    color: colors.palette.neutral900,
  },
  logoutItem: {
    padding: spacing.md,
  },
  logoutText: {
    color: colors.palette.error600,
  },
  menuIcon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 40,
  },
  menuItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  menuItemContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  menuItemSubtitle: {
    color: colors.palette.neutral600,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
  menuSeparator: {
    backgroundColor: colors.palette.neutral100,
    height: 1,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
  section: {
    backgroundColor: colors.palette.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
})
