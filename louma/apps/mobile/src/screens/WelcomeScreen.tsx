import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Louma</Text>
        <Text style={styles.tagline}>Le compte principal de chaque Sénégalais</Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.secondaryButtonText}>Se connecter</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { fontSize: 48, fontWeight: "800", color: colors.surface, marginBottom: 8 },
  tagline: { fontSize: 16, color: colors.surface, opacity: 0.8, marginBottom: 64, textAlign: "center" },
  actions: { width: "100%", gap: 12 },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    borderColor: colors.surface,
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.surface, fontWeight: "700", fontSize: 16 },
});
