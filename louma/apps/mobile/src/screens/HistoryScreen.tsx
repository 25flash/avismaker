import { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Alert } from "react-native";
import { colors } from "../theme/colors";
import { apiClient } from "../api/client";
import { ApiError, formatAmount, type Transaction } from "@louma/shared";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.getMyTransactions();
        setTransactions(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Une erreur est survenue";
        Alert.alert("Erreur", message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={transactions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Aucune opération pour l'instant</Text>}
        renderItem={({ item }) => {
          const isCredit = item.direction === "CREDIT";
          return (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle}>
                  {item.type === "DEPOSIT" ? "Dépôt" : isCredit ? "Reçu" : "Envoyé"}
                </Text>
                {item.counterpartyRib && <Text style={styles.rowSubtitle}>{item.counterpartyRib}</Text>}
                {item.reference && <Text style={styles.rowSubtitle}>{item.reference}</Text>}
                <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleString("fr-FR")}</Text>
              </View>
              <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
                {isCredit ? "+" : "-"}
                {formatAmount(item.amount, item.currency)}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  rowSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rowDate: { fontSize: 11, color: colors.muted, marginTop: 4 },
  amount: { fontSize: 15, fontWeight: "800" },
  credit: { color: colors.success },
  debit: { color: colors.danger },
});
