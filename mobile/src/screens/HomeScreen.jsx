import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { colors, spacing, typography, radius } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

/* Contenu marketing statique (pas de contrepartie backend, comme sur le web) */
const SLIDES = [
  { id: 1, title: 'Protégez votre entreprise', subtitle: 'Surveillance SOC 24/7', cta: 'Voir le SOC', cat: 'soc', colors: ['#0D0B3B', '#1E1B74', '#7B3FE4'] },
  { id: 2, title: 'Cyna EDR – Vos endpoints sécurisés', subtitle: "Détection par intelligence artificielle", cta: "Explorer l'EDR", cat: 'edr', colors: ['#13104A', '#2D2A9B', '#A855F7'] },
  { id: 3, title: 'Cyna XDR – Vision unifiée', subtitle: 'Corrélation des menaces multi-sources', cta: 'Voir le XDR', cat: 'xdr', colors: ['#0F0D2E', '#3730A3', '#6B21A8'] },
];

const Carousel = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const id = setInterval(() => {
      const next = (current + 1) % slides.length;
      ref.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    }, 5000);
    return () => clearInterval(id);
  }, [current]);

  return (
    <View style={styles.carouselWrap}>
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
        renderItem={({ item }) => (
          <LinearGradient colors={item.colors} style={styles.slide}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            <Button onPress={() => navigation.navigate('Catalogue', { cat: item.cat })} variant="outline" size="sm" style={styles.slideCta}>
              {item.cta} →
            </Button>
          </LinearGradient>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => <View key={i} style={[styles.dot, i === current && styles.dotActive]} />)}
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([catalogService.getCategories(), catalogService.getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods.filter((p) => p.available).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <LinearGradient colors={['#7B3FE4', '#A855F7']} style={styles.logoBox}>
              <Text style={styles.logoText}>C</Text>
            </LinearGradient>
            <View>
              <Text style={styles.logoName}>cyna</Text>
              <Text style={styles.logoTagline}>secure your future</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SearchTab')} style={styles.searchBtn}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        <Carousel slides={SLIDES} />

        <View style={styles.heroText}>
          <Text style={styles.heroTextContent}>
            La cybersécurité entreprise, désormais accessible en ligne. Abonnez-vous en quelques minutes
            et sécurisez votre infrastructure dès aujourd'hui.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nos solutions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
              <Text style={styles.sectionLink}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {!loading && (
            <View style={styles.catGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catCard}
                  onPress={() => navigation.navigate('Catalogue', { cat: cat.slug })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Top produits du moment</Text>
          </View>
          {loading ? (
            <Text style={{ color: colors.textMuted }}>Chargement...</Text>
          ) : (
            products.map((p) => (
              <ProductCard key={p.id} product={p} categoryIcon={categoryById[p.category_id]?.icon} />
            ))
          )}
        </View>

        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à sécuriser{'\n'}votre entreprise ?</Text>
          <Text style={styles.ctaSubtitle}>Démarrez dès aujourd'hui</Text>
          <Button onPress={() => navigation.navigate('Register')} variant="primary" size="lg" fullWidth>
            Créer un compte
          </Button>
          <Button onPress={() => navigation.navigate('ContactTab')} variant="ghost" size="md" style={{ marginTop: spacing[2] }}>
            Nous contacter
          </Button>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDark },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.bgDark },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  logoBox: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: typography.xl, fontWeight: '900', color: 'white' },
  logoName: { fontSize: typography.xl, fontWeight: '800', color: 'white', letterSpacing: -0.5 },
  logoTagline: { fontSize: typography.xs, color: 'rgba(255,255,255,0.4)' },
  searchBtn: { padding: spacing[2] },
  searchIcon: { fontSize: 20 },

  carouselWrap: { position: 'relative' },
  slide: { width: SCREEN_W, paddingHorizontal: spacing[6], paddingVertical: spacing[10], justifyContent: 'flex-end', minHeight: 240 },
  slideTitle: { fontSize: typography['2xl'], fontWeight: '900', color: 'white', letterSpacing: -0.5, marginBottom: spacing[2] },
  slideSubtitle: { fontSize: typography.base, color: 'rgba(255,255,255,0.7)', marginBottom: spacing[5] },
  slideCta: { alignSelf: 'flex-start' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing[2], paddingVertical: spacing[3], backgroundColor: colors.bgDark },
  dot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 20, backgroundColor: 'white' },

  heroText: { backgroundColor: colors.bgLight, padding: spacing[5] },
  heroTextContent: { fontSize: typography.base, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

  section: { padding: spacing[5], backgroundColor: colors.bgWhite },
  sectionDark: { backgroundColor: colors.bgLight },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
  sectionTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary },
  sectionLink: { fontSize: typography.sm, color: colors.secondary, fontWeight: '600' },

  catGrid: { flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap' },
  catCard: { flex: 1, minWidth: '28%', backgroundColor: colors.bgLight, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: spacing[1] },
  catIcon: { fontSize: 28 },
  catName: { fontSize: typography.lg, fontWeight: '800', color: colors.primary },

  ctaSection: { padding: spacing[8], gap: spacing[3] },
  ctaTitle: { fontSize: typography['3xl'], fontWeight: '900', color: 'white', letterSpacing: -0.5, lineHeight: 36 },
  ctaSubtitle: { fontSize: typography.base, color: 'rgba(255,255,255,0.6)', marginBottom: spacing[2] },
});

export default HomeScreen;
