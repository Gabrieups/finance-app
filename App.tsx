import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { ThemeProvider } from "./context/ThemeContext"
import { FinanceProvider } from "./context/FinanceContext"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "./context/ThemeContext"

// Screens
import HomeScreen from "./screens/HomeScreen"
import ExpensesScreen from "./screens/ExpensesScreen" // Nova tela unificada
import AnalyticsScreen from "./screens/AnalyticsScreen"
import SettingsScreen from "./screens/SettingsScreen"
import { useFinance } from "./context/FinanceContext"

// Importar o componente AddExpenseButton
import AddExpenseButton from "./components/AddExpenseButton"

const Tab = createBottomTabNavigator()

// Modificar o AppNavigator para incluir apenas uma aba de despesas
const AppNavigator = () => {
  const { colors } = useTheme()
  const { customTabNames } = useFinance()

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline"
            } else if (route.name === "Expenses") {
              iconName = focused ? "wallet" : "wallet-outline"
            } else if (route.name === "Analytics") {
              iconName = focused ? "bar-chart" : "bar-chart-outline"
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline"
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.card,
          },
          tabBarActiveTintColor: "#4F46E5",
          tabBarInactiveTintColor: "gray",
          // Adicionar espaço no centro para o botão
          tabBarStyle: {
            height: 60,
            backgroundColor: colors.card,
            borderColor: colors.border
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: customTabNames.home }} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: "Despesas" }} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: customTabNames.analytics }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: customTabNames.settings }} />
      </Tab.Navigator>

      {/* Adicionar o botão centralizado */}
      <AddExpenseButton />
    </>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FinanceProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </FinanceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

