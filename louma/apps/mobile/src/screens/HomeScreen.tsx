import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, RefreshControl, ScrollView, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { formatAmount, ApiError } from "@louma/shared";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { user, account, setAccount, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const updated = await apiClient.getMyAccount();
      setAccount(updated);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Une erreur est survenue";
      Alert.alert("Erreur", message);
    } finally {
      setRefreshing(false);
    }
  }, [setAccount]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour, {user?.fullName?.split(" ")[0]}</Text>
          <Pressable onPress={() => logout()}>
            <Text style={styles.logout}>Déconnexion</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceValue}>{account ? formatAmount(account.balance, account.currency) : "—"}</Text>
          <Text style={styles.ribLabel}>RIB</Text>
          <Text style={styles.ribValue}>{account?.rib}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={() => navigation.navigate("Deposit")}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionLabel}>Déposer</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => navigation.navigate("Transfer")}>
            <Text style={styles.actionIcon}>→</Text>
            <Text style={styles.actionLabel}>Envoyer</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => navigation.navigate("History")}>
            <Text style={styles.actionIcon}>≡</Text>
            <Text style={styles.actionLabel}>Historique</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.text },
  logout: { color: colors.danger, fontWeight: "600" },
  balanceCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: { color: colors.surface, opacity: 0.7, fontSize: 14 },
  balanceValue: { color: colors.surface, fontSize: 36, fontWeight: "800", marginTop: 4, marginBottom: 20 },
  ribLabel: { color: colors.surface, opacity: 0.7, fontSize: 12 },
  ribValue: { color: colors.accent, fontSize: 16, fontWeight: "700", letterSpacing: 1, marginTop: 2 },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
  },
  actionIcon: { fontSize: 22, fontWeight: "800", color: colors.primary, marginBottom: 6 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: colors.text },
});
