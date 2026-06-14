import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import type { AuthStackParamList, AppStackParamList } from "./types";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import DepositScreen from "../screens/DepositScreen";
import TransferScreen from "../screens/TransferScreen";
import HistoryScreen from "../screens/HistoryScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

export default function RootNavigator() {
  const { accessToken, isReady, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {accessToken ? (
        <AppStack.Navigator>
          <AppStack.Screen name="Home" component={HomeScreen} options={{ title: "Mon compte" }} />
          <AppStack.Screen name="Deposit" component={DepositScreen} options={{ title: "Déposer" }} />
          <AppStack.Screen name="Transfer" component={TransferScreen} options={{ title: "Envoyer de l'argent" }} />
          <AppStack.Screen name="History" component={HistoryScreen} options={{ title: "Historique" }} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: "Connexion" }} />
          <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: "Inscription" }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
