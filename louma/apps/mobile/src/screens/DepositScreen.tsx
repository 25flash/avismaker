import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { ApiError } from "@louma/shared";
import { generateIdempotencyKey } from "../utils/idempotency";

type Props = NativeStackScreenProps<AppStackParamList, "Deposit">;

export default function DepositScreen({ navigation }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const setAccount = useAuthStore((s) => s.setAccount);

  async function onSubmit() {
    const value = parseInt(amount, 10);
    if (!value || value <= 0) {
      Alert.alert("Montant invalide", "Saisissez un montant positif");
      return;
    }
    setLoading(true);
    try {
      const account = await apiClient.deposit(
        { amount: value, reference: "Dépôt agent (sandbox)" },
        generateIdempotencyKey(),
      );
      setAccount(account);
      Alert.alert("Dépôt effectué", "Votre solde a été mis à jour", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Une erreur est survenue";
      Alert.alert("Dépôt impossible", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Déposer de l'argent</Text>
        <Text style={styles.subtitle}>
          Simulation d'un dépôt via un agent / mobile money (sandbox).
        </Text>

        <Text style={styles.label}>Montant (XOF)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="10000"
          keyboardType="number-pad"
        />

        <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.primaryButtonText}>Confirmer le dépôt</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 24 },
  label: { fontSize: 14, color: colors.muted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 28,
  },
  primaryButtonText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
});
