import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { ApiError } from "@louma/shared";
import { generateIdempotencyKey } from "../utils/idempotency";

type Props = NativeStackScreenProps<AppStackParamList, "Transfer">;

export default function TransferScreen({ navigation }: Props) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const setAccount = useAuthStore((s) => s.setAccount);

  async function onSubmit() {
    const value = parseInt(amount, 10);
    if (!destination.trim()) {
      Alert.alert("Destinataire requis", "Saisissez un RIB ou un numéro de téléphone");
      return;
    }
    if (!value || value <= 0) {
      Alert.alert("Montant invalide", "Saisissez un montant positif");
      return;
    }
    setLoading(true);
    try {
      await apiClient.transfer(
        { destination: destination.trim(), amount: value, currency: "XOF", reference: reference.trim() || undefined },
        generateIdempotencyKey(),
      );
      const account = await apiClient.getMyAccount();
      setAccount(account);
      Alert.alert("Virement envoyé", "Le transfert a été effectué avec succès", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Une erreur est survenue";
      Alert.alert("Virement impossible", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Envoyer de l'argent</Text>

        <Text style={styles.label}>RIB ou téléphone du bénéficiaire</Text>
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder="SN0100000000000000001 ou +221..."
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Montant (XOF)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="5000"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Motif (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={reference}
          onChangeText={setReference}
          placeholder="Loyer, dépannage, ..."
        />

        <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.primaryButtonText}>Envoyer</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 24 },
  label: { fontSize: 14, color: colors.muted, marginBottom: 6, marginTop: 12 },
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
