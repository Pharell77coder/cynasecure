import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { orderService } from '../services/api';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme';

const STATUS_LABELS = {
  pending:   { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  paid:      { label: 'Payée',      bg: '#D1FAE5', color: '#065F46' },
  failed:    { label: 'Échouée',    bg: '#FEE2E2', color: '#991B1B' },
  cancelled: { label: 'Annulée',    bg: '#F3F4F6', color: '#6B7280' },
};

const STATUS_FILTERS = [
  { v: '', l: 'Tous' },
  { v: 'pending', l: 'En attente' },
  { v: 'paid', l: 'Payée' },
  { v: 'failed', l: 'Échouée' },
  { v: 'cancelled', l: 'Annulée' },
];

const icon = (name) => (name?.includes('SOC') ? '🛡️' : name?.includes('EDR') ? '💻' : '🔍');

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  // Recherche + filtre statut, présents sur le web (Orders.jsx) mais absents ici avant
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    orderService.list().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search && !o.items.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase()))) return false;
      if (statusFilter && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing[10] }} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing[4] }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Mes commandes</Text>

            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par service…"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View style={styles.statusRow}>
              {STATUS_FILTERS.map((s) => (
                <TouchableOpacity
                  key={s.v}
                  style={[styles.statusChip, statusFilter === s.v && styles.statusChipActive]}
                  onPress={() => setStatusFilter(s.v)}
                >
                  <Text style={[styles.statusChipText, statusFilter === s.v && styles.statusChipTextActive]}>{s.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucune commande trouvée</Text>
            <Text style={styles.emptyText}>Modifiez vos filtres ou passez votre première commande.</Text>
            <Button onPress={() => navigation.navigate('CatalogueTab')} variant="primary" style={{ marginTop: spacing[4] }}>
              Voir le catalogue
            </Button>
          </View>
        }
        renderItem={({ item: order }) => {
          const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
          const isExpanded = expanded === order.id;
          return (
            <TouchableOpacity style={styles.card} onPress={() => setExpanded(isExpanded ? null : order.id)} activeOpacity={0.8}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 20 }}>{icon(order.items[0]?.product_name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderProducts} numberOfLines={1}>
                    {order.items.map((i) => i.product_name).join(', ')}
                  </Text>
                  <Text style={styles.orderMeta}>
                    #{order.id} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.orderAmount}>{order.total_amount} €</Text>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.details}>
                  {order.items.map((i) => (
                    <View key={i.id} style={styles.detailLine}>
                      <Text style={styles.detailLabel}>
                        {i.product_name} × {i.quantity} ({i.billing_period === 'annual' ? 'annuel' : 'mensuel'})
                      </Text>
                      <Text style={styles.detailValue}>{i.unit_price * i.quantity} €</Text>
                    </View>
                  ))}
                  <View style={[styles.detailLine, { borderBottomWidth: 0, paddingTop: spacing[2] }]}>
                    <Text style={styles.detailTotalLabel}>Total</Text>
                    <Text style={styles.detailTotalValue}>{order.total_amount} €</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgLight },
  title: { fontSize: typography['2xl'], fontWeight: '900', color: colors.primary, marginBottom: spacing[3] },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgWhite, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing[4], marginBottom: spacing[3], gap: spacing[2] },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: spacing[2], fontSize: typography.sm, color: colors.textPrimary },

  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  statusChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgWhite },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: typography.xs, fontWeight: '600', color: colors.textMuted },
  statusChipTextActive: { color: 'white' },

  card: { backgroundColor: colors.bgWhite, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3], borderWidth: 1, borderColor: colors.border, ...shadow.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconBox: { width: 44, height: 44, backgroundColor: colors.bgLight, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  orderProducts: { fontSize: typography.base, fontWeight: '700', color: colors.textPrimary },
  orderMeta: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  orderAmount: { fontSize: typography.base, fontWeight: '800', color: colors.primary },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  badgeText: { fontSize: typography.xs, fontWeight: '700' },

  details: { marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderColor: colors.border },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[1], borderBottomWidth: 1, borderColor: colors.border },
  detailLabel: { fontSize: typography.sm, color: colors.textMuted, flex: 1 },
  detailValue: { fontSize: typography.sm, color: colors.textMuted },
  detailTotalLabel: { fontSize: typography.sm, fontWeight: '800', color: colors.primary },
  detailTotalValue: { fontSize: typography.sm, fontWeight: '900', color: colors.primary },

  empty: { alignItems: 'center', paddingVertical: spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: spacing[3] },
  emptyTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary },
  emptyText: { fontSize: typography.base, color: colors.textMuted, marginTop: spacing[2], textAlign: 'center' },
});

export default OrdersScreen;
