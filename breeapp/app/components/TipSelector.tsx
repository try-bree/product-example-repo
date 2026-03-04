/* eslint-disable react-native/sort-styles */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-native/no-color-literals */
/* eslint-disable prettier/prettier */
import { FC, useState } from "react"
import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native"

import { colors, spacing, typography, shadows, radius } from "@/theme"

import { Text } from "./Text"

interface TipSelectorProps {
  amount: number
  selectedTip: number
  onTipChange: (tip: number) => void
}

export const TipSelector: FC<TipSelectorProps> = ({ amount, selectedTip, onTipChange }) => {
  const [customTip, setCustomTip] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Preset tip options
  const presetTips = [
    { label: "No Tip", value: 0, percentage: 0 },
    { label: "5%", value: Math.round(amount * 0.05), percentage: 5 },
    { label: "10%", value: Math.round(amount * 0.1), percentage: 10 },
    { label: "15%", value: Math.round(amount * 0.15), percentage: 15 },
  ]

  const handlePresetTip = (tipValue: number) => {
    setShowCustomInput(false)
    setCustomTip("")
    onTipChange(tipValue)
  }

  const handleCustomTip = () => {
    setShowCustomInput(true)
  }

  const handleCustomTipChange = (text: string) => {
    setCustomTip(text)
    const tipValue = parseFloat(text) || 0
    onTipChange(Math.max(0, tipValue)) // Ensure non-negative
  }

  return (
    <View style={[styles.container, shadows.md]}>
      <View style={styles.header}>
        <Text style={[typography.headingSmall, styles.title]}>Add a Tip</Text>
        <Text style={[typography.bodyMedium, styles.subtitle]}>
          Tips help us provide this service (100% optional)
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {presetTips.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={[
              styles.tipOption,
              selectedTip === preset.value && !showCustomInput && styles.tipOptionSelected,
            ]}
            onPress={() => handlePresetTip(preset.value)}
          >
            <Text
              style={[
                typography.labelMedium,
                styles.tipOptionText,
                selectedTip === preset.value && !showCustomInput && styles.tipOptionTextSelected,
              ]}
            >
              {preset.label}
            </Text>
            {preset.value > 0 && (
              <Text
                style={[
                  typography.caption,
                  styles.tipOptionAmount,
                  selectedTip === preset.value && !showCustomInput && styles.tipOptionAmountSelected,
                ]}
              >
                ${preset.value}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.tipOption, showCustomInput && styles.tipOptionSelected]}
          onPress={handleCustomTip}
        >
          <Text
            style={[
              typography.labelMedium,
              styles.tipOptionText,
              showCustomInput && styles.tipOptionTextSelected,
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {showCustomInput && (
        <View style={styles.customInputContainer}>
          <Text style={[typography.bodyMedium, styles.customLabel]}>Enter custom tip amount:</Text>
          <View style={styles.inputWrapper}>
            <Text style={[typography.labelLarge, styles.dollarSign]}>$</Text>
            <TextInput
              style={[typography.bodyLarge, styles.customInput]}
              value={customTip}
              onChangeText={handleCustomTipChange}
              placeholder="0"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>
      )}

      <View style={styles.summary}>
        <Text style={[typography.caption, styles.summaryText]}>
          Total to repay: ${amount + selectedTip}
        </Text>
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
    marginBottom: spacing.md,
  },
  title: {
    color: colors.palette.neutral900,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.palette.neutral600,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipOption: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.palette.neutral100,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  tipOptionSelected: {
    backgroundColor: colors.palette.primary50,
    borderColor: colors.palette.primary500,
  },
  tipOptionText: {
    color: colors.palette.neutral700,
    marginBottom: spacing.xs,
  },
  tipOptionTextSelected: {
    color: colors.palette.primary700,
    fontWeight: "600",
  },
  tipOptionAmount: {
    color: colors.palette.neutral500,
  },
  tipOptionAmountSelected: {
    color: colors.palette.primary600,
    fontWeight: "600",
  },
  customInputContainer: {
    marginBottom: spacing.md,
  },
  customLabel: {
    color: colors.palette.neutral700,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.palette.neutral50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.palette.primary500,
  },
  dollarSign: {
    color: colors.palette.neutral700,
    marginRight: spacing.xs,
  },
  customInput: {
    flex: 1,
    color: colors.palette.neutral900,
    padding: 0,
  },
  summary: {
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral200,
  },
  summaryText: {
    color: colors.palette.neutral600,
  },
}) 