import { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { colors, spacing, typography, radius, shadow, common } from '../theme';

const CATEGORY_FEATURES = {
  soc: ['Surveillance 24/7/365', 'Détection des menaces en temps réel', 'Réponse aux incidents < 15 min', 'Tableau de bord centralisé', 'Rapports mensuels détaillés', 'Support technique dédié'],
  edr: ['Protection multi-terminaux', 'IA comportementale avancée', 'Confinement automatique', 'Investigation forensique', 'Intégration SOC native', 'Support 24/7'],
  xdr: ['Corrélation multi-sources', 'SIEM intégré', 'Playbooks automatisés', 'API ouverte', 'SLA garanti 99.9%', 'Équipe dédiée'],
};
const CATEGORY_ICONS = { soc: '🛡️', edr: '💻', xdr: '🔍' };

const ProductScreen = ({ route }) => {
  const { id } = route.params;
  const { addToCart } = useContext(CartContext);
  const navigation = useNavigation();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    Promise.all([catalogService.getProduct(id), catalogService.getCategories(), catalogService.getProducts()])
      .then(([p, cats, allProducts]) => {
        setProduct(p);
        setCategory(cats.find((c) => c.id === p.category_id));
        setSimilar(allProducts.filter((sp) => sp.id !== p.id && sp.category_id === p.category_id).slice(0, 3));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgLight, ...common.center }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (notFound || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgLight, ...common.center, padding: spacing[6] }}>
        <Text style={{ fontSize: typography.xl, fontWeight: '800', color: colors.primary }}>Service introuvable</Text>
        <Button onPress={() => navigation.navigate('Catalogue')} variant="primary" size="lg" style={{ marginTop: spacing[5] }}>
          Retour au catalogue
        </Button>
      </SafeAreaView>
    );
  }

  const icon = CATEGORY_ICONS[category?.slug] || '🔒';
  const features = CATEGORY_FEATURES[category?.slug] || [];

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price_monthly: product.price_monthly }, quantity);
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

        <LinearGradient colors={['#0D0B3B', '#1E1B74', '#7B3FE4']} style={styles.hero}>
          <Text style={styles.heroIcon}>{icon}</Text>
          {product.available ? (
            <View style={styles.badgeAvail}><Text style={styles.badgeAvailText}>● Disponible immédiatement</Text></View>
          ) : (
            <View style={styles.badgeUnavail}><Text style={styles.badgeUnavailText}>● Service indisponible</Text></View>
          )}
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>
            {product.description || `${product.name} fait partie de notre gamme ${category?.name || ''}, pensée pour protéger votre infrastructure au quotidien.`}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>{product.price_monthly} €</Text>
            <Text style={styles.pricePeriod}>/ mois</Text>
          </View>

          <View style={styles.qtyWrap}>
            <Text style={styles.qtyLabel}>Utilisateurs / appareils</Text>
            <View style={styles.qtyCtrl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity((q) => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ctas}>
            {product.available ? (
              <Button onPress={handleAdd} variant="primary" size="lg" fullWidth>
                {added ? '✓ Ajouté au panier !' : "S'ABONNER MAINTENANT"}
              </Button>
            ) : (
              <Button variant="primary" size="lg" fullWidth disabled>SERVICE INDISPONIBLE</Button>
            )}
          </View>

          {features.length > 0 && (
            <>
              <Text style={[common.sectionTitle, { marginTop: spacing[6] }]}>Caractéristiques techniques</Text>
              <View style={styles.specsGrid}>
                {features.map((f, i) => (
                  <View key={i} style={styles.specItem}>
                    <Text style={styles.specCheck}>✓</Text>
                    <Text style={styles.specText}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {similar.length > 0 && (
            <>
              <Text style={[common.sectionTitle, { marginTop: spacing[6] }]}>Services similaires</Text>
              {similar.map((p) => <ProductCard key={p.id} product={p} categoryIcon={icon} />)}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: { height: 220, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  heroIcon: { fontSize: 60 },
  badgeAvail: { backgroundColor: '#D1FAE5', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4 },
  badgeAvailText: { color: '#065F46', fontWeight: '700', fontSize: typography.sm },
  badgeUnavail: { backgroundColor: '#FEE2E2', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4 },
  badgeUnavailText: { color: '#991B1B', fontWeight: '700', fontSize: typography.sm },

  body: { padding: spacing[5] },
  name: { fontSize: typography['3xl'], fontWeight: '900', color: colors.primary, letterSpacing: -0.5, marginBottom: spacing[3] },
  description: { fontSize: typography.base, color: colors.textMuted, lineHeight: 22, marginBottom: spacing[5] },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2], marginBottom: spacing[5] },
  priceAmount: { fontSize: 40, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  pricePeriod: { fontSize: typography.lg, color: colors.textMuted },

  qtyWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[5] },
  qtyLabel: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  qtyBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: typography.xl, fontWeight: '700', color: colors.secondary },
  qtyValue: { width: 44, textAlign: 'center', fontSize: typography.lg, fontWeight: '700', color: colors.textPrimary, borderLeftWidth: 2, borderRightWidth: 2, borderColor: colors.border },

  ctas: { gap: spacing[2] },

  specsGrid: { gap: spacing[3], marginBottom: spacing[4] },
  specItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  specCheck: { color: colors.secondary, fontWeight: '700', fontSize: typography.base },
  specText: { fontSize: typography.base, color: colors.textPrimary, flex: 1, lineHeight: 22 },
});

export default ProductScreen;
