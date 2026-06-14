import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { ApiError } from "@louma/shared";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+221");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  async function onSubmit() {
    setLoading(true);
    try {
      const result = await apiClient.register({ fullName, phone, pin });
      await setSession(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Une erreur est survenue";
      Alert.alert("Inscription impossible", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer un compte</Text>

        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Awa Diop"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Numéro de téléphone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+221701234567"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Code PIN (4 à 6 chiffres)</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="1234"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />

        <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.primaryButtonText}>Créer mon compte</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>J'ai déjà un compte</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 24 },
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
  link: { textAlign: "center", color: colors.primary, marginTop: 20, fontWeight: "600" },
});
