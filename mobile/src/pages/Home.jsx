import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { catalogService } from '../services/api';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'soc',
    title: 'Protégez votre entreprise avec Cyna SOC',
    subtitle: "Surveillance 24/7 de vos systèmes d'information",
    cta: 'Découvrir le SOC',
    catSlug: 'soc',
    colors: ['#0D0B3B', '#1E1B74', '#7B3FE4']
  },
  {
    id: 'edr',
    title: 'Cyna EDR – Détection & Réponse aux menaces',
    subtitle: 'Protection avancée de vos endpoints en temps réel',
    cta: "Explorer l'EDR",
    catSlug: 'edr',
    colors: ['#13104A', '#2D2A9B', '#A855F7']
  },
  {
    id: 'xdr',
    title: 'Cyna XDR – La sécurité unifiée',
    subtitle: "Corrélation des menaces sur l'ensemble de votre infrastructure",
    cta: 'Voir le XDR',
    catSlug: 'xdr',
    colors: ['#0F0D2E', '#3730A3', '#6B21A8']
  }
];

function Carousel({ navigation }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[current];

  return (
    <LinearGradient colors={slide.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 60, paddingHorizontal: 16 }}>
      <Text className="text-center text-sm font-semibold uppercase tracking-wide text-blue-300">Solutions SaaS B2B</Text>
      <Text className="mt-3 text-center text-3xl font-bold text-white">{slide.title}</Text>
      <Text className="mt-4 text-center text-gray-200">{slide.subtitle}</Text>
      <View className="mt-6 items-center">
        <Button
          variant="primary" size="lg"
          onPress={() => navigation.navigate('CatalogueTab', { screen: 'CatalogueMain', params: { cat: slide.catSlug } })}
        >
          {slide.cta}
        </Button>
      </View>

      <View className="mt-8 flex-row justify-center gap-2">
        {SLIDES.map((s, i) => (
          <View
            key={s.id}
            onTouchEnd={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full ${i === current ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

export default function Home() {
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
      .finally(() => setLoading(false));
  }, []);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <ScrollView className="flex-1 bg-gray-950">
      <Carousel navigation={navigation} />

      <View className="border-y border-gray-800 bg-gray-900 px-4 py-10">
        <Text className="text-center text-gray-300">
          La cybersécurité entreprise, désormais accessible en ligne. Abonnez-vous en quelques minutes
          et sécurisez votre infrastructure dès aujourd'hui.
        </Text>
      </View>

      <View className="px-4 py-16">
        <View className="mb-8 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Nos solutions</Text>
          <Text className="text-sm text-blue-400" onPress={() => navigation.navigate('CatalogueTab')}>Voir tout →</Text>
        </View>
        {!loading && (
          <View className="flex-row flex-wrap gap-4">
            {categories.map((cat) => (
              <View
                key={cat.id}
                onTouchEnd={() => navigation.navigate('CatalogueTab', { screen: 'CatalogueMain', params: { cat: cat.slug } })}
                className="items-center rounded-xl border border-gray-800 bg-gray-900 p-6"
                style={{ width: (width - 32 - 16) / 2 }}
              >
                <Text className="text-3xl">{cat.icon}</Text>
                <Text className="mt-3 text-center font-semibold text-white">{cat.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="border-t border-gray-800 px-4 py-16">
        <View className="mb-8 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Les Top Produits du moment</Text>
        </View>
        {loading ? (
          <Text className="text-gray-400">Chargement...</Text>
        ) : (
          <View style={{ gap: 16 }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} categoryIcon={categoryById[p.category_id]?.icon} variant="list" />
            ))}
          </View>
        )}
      </View>

      <View className="border-t border-gray-800 px-4 py-16">
        <Text className="text-2xl font-bold text-white">Prêt à sécuriser votre entreprise ?</Text>
        <Text className="mt-2 text-gray-400">Démarrez dès aujourd'hui.</Text>
        <View className="mt-6 flex-row gap-4">
          <Button variant="primary" size="lg" onPress={() => navigation.navigate('Register')}>Créer un compte</Button>
          <Button variant="outline" size="lg" onPress={() => navigation.navigate('Contact')}>Nous contacter</Button>
        </View>
      </View>
    </ScrollView>
  );
}