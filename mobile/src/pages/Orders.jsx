import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { orderService } from '../services/api';
import Button from '../components/Button';

const STATUS_LABELS = {
  pending: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  paid: { label: 'Payée', bg: '#D1FAE5', color: '#065F46' },
  failed: { label: 'Échouée', bg: '#FEE2E2', color: '#991B1B' },
  cancelled: { label: 'Annulée', bg: '#F3F4F6', color: '#6B7280' }
};

export default function Orders() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => { orderService.list().then(setOrders).finally(() => setLoading(false)); }, []);

  const filtered = orders.filter((o) => {
    if (search && !o.items.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  const byYear = filtered.reduce((acc, o) => {
    const year = new Date(o.created_at).getFullYear();
    (acc[year] = acc[year] || []).push(o);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b - a);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 py-24">
        <Text className="text-gray-400">Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 py-10">
      <Text className="text-2xl font-bold text-white">Historique des commandes</Text>

      <View className="mt-6" style={{ gap: 12 }}>
        <View className="flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2">
          <Text className="text-gray-500">🔍</Text>
          <TextInput
            placeholder="Rechercher par service..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-sm text-white"
          />
        </View>
        <View className="rounded-lg border border-gray-700 bg-gray-900">
          <Picker selectedValue={statusFilter} onValueChange={setStatusFilter} style={{ color: '#fff' }} dropdownIconColor="#fff">
            <Picker.Item label="Tous les statuts" value="" />
            <Picker.Item label="En attente" value="pending" />
            <Picker.Item label="Payée" value="paid" />
            <Picker.Item label="Échouée" value="failed" />
            <Picker.Item label="Annulée" value="cancelled" />
          </Picker>
        </View>
      </View>

      {years.length === 0 ? (
        <View className="items-center py-16">
          <Text className="text-3xl">📋</Text>
          <Text className="mt-4 font-semibold text-white">Aucune commande trouvée</Text>
          <Text className="mt-2 text-gray-500">Modifiez vos filtres ou passez votre première commande.</Text>
          <View className="mt-4">
            <Button variant="primary" onPress={() => navigation.navigate('CatalogueTab')}>Voir le catalogue</Button>
          </View>
        </View>
      ) : (
        years.map((year) => (
          <View key={year} className="mt-8">
            <Text className="mb-3 text-sm font-semibold text-gray-500">{year}</Text>
            <View style={{ gap: 12 }}>
              {byYear[year].map((order) => {
                const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                const isExpanded = expandedOrder === order.id;
                const icon = order.items[0]?.product_name.includes('SOC') ? '🛡️' : order.items[0]?.product_name.includes('EDR') ? '💻' : '🔍';
                return (
                  <View key={order.id} className="rounded-xl border border-gray-800 bg-gray-900">
                    <View
                      className="flex-row items-center gap-4 p-4"
                      onTouchEnd={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <View className="h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                        <Text className="text-xl">{icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-white">{order.items.map((i) => i.product_name).join(', ')}</Text>
                        <Text className="text-sm text-gray-500">
                          Commande #{order.id} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-semibold text-white">{order.total_amount} €</Text>
                        <View className="mt-1 rounded-full px-3 py-1" style={{ backgroundColor: status.bg }}>
                          <Text className="text-xs font-medium" style={{ color: status.color }}>{status.label}</Text>
                        </View>
                      </View>
                    </View>

                    {isExpanded && (
                      <View className="border-t border-gray-800 p-4" style={{ gap: 16 }}>
                        <View>
                          <Text className="mb-2 text-sm font-semibold text-gray-400">Commande</Text>
                          <Text className="text-sm text-gray-300">N° #{order.id}</Text>
                          <Text className="text-sm text-gray-300">Date : {new Date(order.created_at).toLocaleDateString('fr-FR')}</Text>
                          <Text className="text-sm text-gray-300">Statut : {status.label}</Text>
                        </View>
                        <View>
                          <Text className="mb-2 text-sm font-semibold text-gray-400">Détail</Text>
                          {order.items.map((i) => (
                            <Text key={i.id} className="text-sm text-gray-300">
                              {i.product_name} × {i.quantity} ({i.billing_period === 'annual' ? 'annuel' : 'mensuel'}) — {i.unit_price * i.quantity} €
                            </Text>
                          ))}
                          <Text className="mt-1 font-semibold text-white">Total : {order.total_amount} €</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}