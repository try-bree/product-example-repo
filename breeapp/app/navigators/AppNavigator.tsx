import { ComponentProps } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

import { Icon } from "@/components/Icon"
import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { AdminScreen } from "@/screens/AdminScreen"
import { CashAdvanceScreen } from "@/screens/CashAdvanceScreen"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { HomeScreen } from "@/screens/HomeScreen"
import { LoanReviewScreen } from "@/screens/LoanReviewScreen"
import { LoanSuccessScreen } from "@/screens/LoanSuccessScreen"
import { LoginScreen } from "@/screens/LoginScreen"
import { RepaymentScreen } from "@/screens/RepaymentScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { colors, spacing, typography, shadows } from "@/theme"
import { useAppTheme } from "@/theme/context"

import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  MainTabs: undefined
  CashAdvance: undefined
  Repayment: undefined
  LoanReview: { loanData: any }
  LoanSuccess: { loanId: number; estimatedTime: string }
  Admin: undefined
}

export type MainTabParamList = {
  Home: undefined
  Settings: undefined
  Admin: undefined
}

const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

const Tab = createBottomTabNavigator<MainTabParamList>()

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.palette.primary600,
        tabBarInactiveTintColor: colors.palette.neutral400,
        tabBarStyle: {
          backgroundColor: colors.palette.surface,
          borderTopColor: colors.palette.neutral100,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
          ...shadows.lg,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="heart"
              color={focused ? colors.palette.primary600 : colors.palette.neutral400}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="ladybug"
              color={focused ? colors.palette.primary600 : colors.palette.neutral400}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="lock"
              color={focused ? colors.palette.primary600 : colors.palette.neutral400}
              size={24}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const { isAuthenticated } = useAuth()

  const {
    theme: { colors: themeColors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: themeColors.background,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
      initialRouteName={isAuthenticated ? "MainTabs" : "Login"}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="CashAdvance" component={CashAdvanceScreen} />
          <Stack.Screen name="Repayment" component={RepaymentScreen} />
          <Stack.Screen name="LoanReview" component={LoanReviewScreen} />
          <Stack.Screen name="LoanSuccess" component={LoanSuccessScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
