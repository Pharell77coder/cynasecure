import { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { colors, spacing, typography, radius, shadow, common } from '../theme';

const PRODUCTS = {
  1: {
    id: 1, name: 'Cyna SOC Essential', available: true,
    priceMonthly: 29900, priceAnnual: 299000,
    description: 'Cyna SOC Essential offre une surveillance continue 24/7 de votre système d\'information par nos experts sécurité. Détection des incidents en temps réel et réponse garantie sous 15 minutes.',
    specs: ['Surveillance 24/7', 'Réponse < 15 min', 'Tableau de bord live', 'Rapports mensuels', 'Support dédié'],
    icon: '🛡️',
  },
  2: { id: 2, name: 'Cyna EDR Pro', available: true, priceMonthly: 19900, priceAnnual: 199000,
    description: 'Protection de vos endpoints par IA comportementale. Détection et confinement automatique des menaces avancées.',
    specs: ['IA comportementale', 'Confinement auto', 'Forensic intégré', 'Intégration SOC', 'Multi-terminaux'],
    icon: '💻',
  },
  6: { id: 6, name: 'Cyna XDR Essential', available: true, priceMonthly: 59900, priceAnnual: 599000,
    description: 'XDR unifié corrélant données endpoint, réseau et cloud pour une visibilité totale et une réponse coordonnée aux menaces.',
    specs: ['Corrélation multi-sources', 'SIEM intégré', 'Playbooks SOAR', 'API ouverte', 'SLA 99.9%'],
    icon: '🔍',
  },
};

const SIMILAR = [
  { id: 4, name: 'Cyna EDR Pro',        priceMonthly: 19900, available: true },
  { id: 5, name: 'Cyna XDR Enterprise', priceMonthly: 99900, available: true },
];

const ProductScreen = ({ route }) => {
  const { id } = route.params;
  const product = PRODUCTS[id] || PRODUCTS[1];
  const { addToCart } = useContext(CartContext);
  const navigation = useNavigation();

  const [subType, setSubType]   = useState('monthly');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);

  const price = subType === 'annual'
    ? Math.round(product.priceAnnual / 12 / 100)
    : Math.round(product.priceMonthly / 100);

  const handleAdd = () => {
    addToCart(
      { id: product.id, name: product.name, price: Math.round(product.priceMonthly / 100) },
      subType,
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    Alert.alert('Ajouté !', `${product.name} a été ajouté à votre panier.`, [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Voir le panier', onPress: () => navigation.navigate('CartTab') },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgLight }} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero image */}
        <LinearGradient colors={['#0D0B3B', '#1E1B74', '#7B3FE4']} style={styles.hero}>
          <Text style={styles.heroIcon}>{product.icon}</Text>
          {product.available
            ? <View style={styles.badgeAvail}><Text style={styles.badgeAvailText}>● Disponible immédiatement</Text></View>
            : <View style={styles.badgeUnavail}><Text style={styles.badgeUnavailText}>● Service indisponible</Text></View>
          }
        </LinearGradient>

        <View style={styles.body}>

          {/* Nom */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Toggle abonnement */}
          <View style={styles.toggleWrap}>
            {[
              { v: 'monthly', l: 'Mensuel' },
              { v: 'annual',  l: `Annuel  −17%` },
            ].map(({ v, l }) => (
              <TouchableOpacity
                key={v}
                style={[styles.toggleBtn, subType === v && styles.toggleActive]}
                onPress={() => setSubType(v)}
              >
                <Text style={[styles.toggleText, subType === v && styles.toggleTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Prix */}
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>{price} €</Text>
            <Text style={styles.pricePeriod}>/ mois</Text>
            {subType === 'annual' && (
              <Text style={styles.priceSave}>
                soit {Math.round(product.priceAnnual / 100)} € / an
              </Text>
            )}
          </View>

          {/* Quantité */}
          <View style={styles.qtyWrap}>
            <Text style={styles.qtyLabel}>Utilisateurs / appareils</Text>
            <View style={styles.qtyCtrl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA */}
          <View style={styles.ctas}>
            {product.available ? (
              <>
                <Button onPress={handleAdd} variant="primary" size="lg" fullWidth>
                  {added ? '✓ Ajouté au panier !' : 'S\'ABONNER MAINTENANT'}
                </Button>
                <Button variant="outline" size="lg" fullWidth style={{ marginTop: spacing[3] }}>
                  ESSAYER GRATUITEMENT
                </Button>
              </>
            ) : (
              <Button variant="primary" size="lg" fullWidth disabled>
                SERVICE INDISPONIBLE
              </Button>
            )}
          </View>

          {/* Specs */}
          <Text style={[common.sectionTitle, { marginTop: spacing[6] }]}>Caractéristiques techniques</Text>
          <View style={styles.specsGrid}>
            {product.specs.map((spec, i) => (
              <View key={i} style={styles.specItem}>
                <Text style={styles.specCheck}>✓</Text>
                <Text style={styles.specText}>{spec}</Text>
              </View>
            ))}
          </View>

          {/* Similaires */}
          <Text style={[common.sectionTitle, { marginTop: spacing[6] }]}>Services similaires</Text>
          {SIMILAR.map(p => <ProductCard key={p.id} product={p} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: { height: 220, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  heroIcon: { fontSize: 60 },
  badgeAvail:   { backgroundColor: '#D1FAE5', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4 },
  badgeAvailText: { color: '#065F46', fontWeight: '700', fontSize: typography.sm },
  badgeUnavail: { backgroundColor: '#FEE2E2', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4 },
  badgeUnavailText: { color: '#991B1B', fontWeight: '700', fontSize: typography.sm },

  body: { padding: spacing[5] },

  name:        { fontSize: typography['3xl'], fontWeight: '900', color: colors.primary, letterSpacing: -0.5, marginBottom: spacing[3] },
  description: { fontSize: typography.base, color: colors.textMuted, lineHeight: 22, marginBottom: spacing[5] },

  toggleWrap: { flexDirection: 'row', backgroundColor: colors.bgLight, borderRadius: radius.md, padding: 3, marginBottom: spacing[4] },
  toggleBtn: { flex: 1, paddingVertical: spacing[2], alignItems: 'center', borderRadius: radius.sm },
  toggleActive: { backgroundColor: colors.primary, ...shadow.sm },
  toggleText: { fontSize: typography.sm, fontWeight: '600', color: colors.textMuted },
  toggleTextActive: { color: 'white' },

  priceRow:   { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2], marginBottom: spacing[4] },
  priceAmount:{ fontSize: 40, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  pricePeriod:{ fontSize: typography.lg, color: colors.textMuted },
  priceSave:  { fontSize: typography.sm, color: colors.textMuted },

  qtyWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[5] },
  qtyLabel:{ fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  qtyBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: typography.xl, fontWeight: '700', color: colors.secondary },
  qtyValue:{ width: 44, textAlign: 'center', fontSize: typography.lg, fontWeight: '700', color: colors.textPrimary, borderLeftWidth: 2, borderRightWidth: 2, borderColor: colors.border },

  ctas: { gap: spacing[2] },

  specsGrid: { gap: spacing[3], marginBottom: spacing[4] },
  specItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  specCheck: { color: colors.secondary, fontWeight: '700', fontSize: typography.base },
  specText:  { fontSize: typography.base, color: colors.textPrimary, flex: 1, lineHeight: 22 },
});

export default ProductScreen;
