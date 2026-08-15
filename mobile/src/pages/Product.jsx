import { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { CATEGORY_ICONS, CATEGORY_FEATURES, CATEGORY_GRADIENTS } from '../constants/categories';

function ProductGallery({ categorySlug, icon, images }) {
  const [current, setCurrent] = useState(0);
  const hasRealImages = images && images.length > 0;
  const gradients = CATEGORY_GRADIENTS[categorySlug] || CATEGORY_GRADIENTS.soc;
  const slideCount = hasRealImages ? images.length : gradients.length;

  return (
    <View>
      {hasRealImages ? (
        <View className="aspect-square overflow-hidden rounded-2xl bg-gray-900">
          <Image source={{ uri: images[current] }} className="h-full w-full" resizeMode="cover" />
        </View>
      ) : (
        <LinearGradient colors={gradients[current]} style={{ aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}>
          <Text style={{ fontSize: 80 }}>{icon}</Text>
        </LinearGradient>
      )}

      {slideCount > 1 && (
        <View className="mt-3 flex-row gap-3">
          {Array.from({ length: slideCount }).map((_, i) =>
            hasRealImages ? (
              <View key={i} onTouchEnd={() => setCurrent(i)} className={`h-16 w-16 overflow-hidden rounded-lg ${i === current ? 'border-2 border-blue-500' : 'opacity-60'}`}>
                <Image source={{ uri: images[i] }} className="h-full w-full" resizeMode="cover" />
              </View>
            ) : (
              <LinearGradient
                key={i}
                colors={gradients[i]}
                style={{ height: 64, width: 64, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                onTouchEnd={() => setCurrent(i)}
              >
                <Text style={{ fontSize: 22 }}>{icon}</Text>
              </LinearGradient>
            )
          )}
        </View>
      )}
    </View>
  );
}

export default function Product() {
  const { params } = useRoute();
  const id = params?.id;
  const navigation = useNavigation();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    setBillingPeriod('monthly');

    Promise.all([catalogService.getProduct(id), catalogService.getCategories(), catalogService.getProducts()])
      .then(([p, cats, allProducts]) => {
        setProduct(p);
        const cat = cats.find((c) => c.id === p.category_id);
        setCategory(cat);
        setSimilar(allProducts.filter((sp) => sp.id !== p.id && sp.category_id === p.category_id).slice(0, 3));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 py-24">
        <Text className="text-gray-400">Chargement...</Text>
      </View>
    );
  }

  if (notFound || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 px-4 py-24">
        <Text className="text-xl font-bold text-white">Service introuvable</Text>
        <View className="mt-6">
          <Button variant="primary" onPress={() => navigation.navigate('CatalogueMain')}>Retour au catalogue</Button>
        </View>
      </View>
    );
  }

  const icon = CATEGORY_ICONS[category?.slug] || '🔒';
  const features = CATEGORY_FEATURES[category?.slug] || [];
  const annualMonthlyEquivalent = Math.round((product.price_monthly * 10) / 12);
  const displayedPrice = billingPeriod === 'annual' ? annualMonthlyEquivalent : product.price_monthly;

  let productImages = [];
  try {
    if (Array.isArray(product.images)) productImages = product.images;
    else if (typeof product.images === 'string' && product.images.trim() !== '') productImages = JSON.parse(product.images);
  } catch {
    productImages = [];
  }

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price_monthly: product.price_monthly }, quantity, billingPeriod);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 py-10">
      <View className="mb-8 flex-row gap-2">
        <Text className="text-sm text-gray-500" onPress={() => navigation.navigate('HomeTab')}>Accueil</Text>
        <Text className="text-sm text-gray-500">/</Text>
        <Text className="text-sm text-gray-500" onPress={() => navigation.navigate('CatalogueMain')}>Catalogue</Text>
        <Text className="text-sm text-gray-500">/</Text>
        <Text className="text-sm text-gray-300">{product.name}</Text>
      </View>

      <ProductGallery categorySlug={category?.slug} icon={icon} images={productImages} />

      <View className="mt-6">
        <View className={`self-start rounded-full px-3 py-1 ${product.available ? 'bg-green-950/50' : 'bg-red-950/50'}`}>
          <Text className={`text-xs font-medium ${product.available ? 'text-green-400' : 'text-red-400'}`}>
            {product.available ? '● Disponible immédiatement' : '● Service momentanément indisponible'}
          </Text>
        </View>

        <Text className="mt-4 text-3xl font-bold text-white">{product.name}</Text>
        <Text className="mt-4 text-gray-400">
          {product.description || `${product.name} fait partie de notre gamme ${category?.name || ''}, pensée pour protéger votre infrastructure au quotidien.`}
        </Text>

        <View className="mt-6">
          <View className="flex-row self-start rounded-lg border border-gray-700 p-1">
            <Text
              onPress={() => setBillingPeriod('monthly')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
            >
              Mensuel
            </Text>
            <Text
              onPress={() => setBillingPeriod('annual')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${billingPeriod === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
            >
              Annuel <Text className="text-xs text-green-400">−17%</Text>
            </Text>
          </View>

          <View className="mt-3 flex-row items-end gap-2">
            <Text className="text-3xl font-bold text-white">{displayedPrice} €</Text>
            <Text className="mb-1 text-gray-500">/ mois</Text>
          </View>
          {billingPeriod === 'annual' && (
            <Text className="text-sm text-gray-500">soit {product.price_monthly * 10} € / an, facturé en une fois</Text>
          )}
        </View>

        <View className="mt-6">
          <Text className="mb-2 text-sm text-gray-400">Nombre d'utilisateurs / appareils</Text>
          <View className="flex-row items-center gap-4 self-start rounded-lg border border-gray-700 px-4 py-2">
            <Text className="text-gray-300" onPress={() => setQuantity((q) => Math.max(1, q - 1))}>−</Text>
            <Text className="w-6 text-center text-white">{quantity}</Text>
            <Text className="text-gray-300" onPress={() => setQuantity((q) => q + 1)}>+</Text>
          </View>
        </View>

        <View className="mt-8">
          {product.available ? (
            <Button variant="primary" size="lg" fullWidth onPress={handleAddToCart}>
              {added ? '✓ Ajouté au panier !' : "S'ABONNER MAINTENANT"}
            </Button>
          ) : (
            <Button variant="primary" size="lg" fullWidth disabled>SERVICE INDISPONIBLE</Button>
          )}
        </View>
      </View>

      {features.length > 0 && (
        <View className="mt-16">
          <Text className="text-xl font-bold text-white">Caractéristiques techniques</Text>
          <View className="mt-6" style={{ gap: 12 }}>
            {features.map((f, i) => (
              <View key={i} className="flex-row items-center gap-2">
                <Text className="text-green-400">✓</Text>
                <Text className="text-gray-300">{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {similar.length > 0 && (
        <View className="mt-16 mb-10">
          <Text className="text-xl font-bold text-white">Services similaires</Text>
          <View className="mt-6" style={{ gap: 16 }}>
            {similar.map((p) => <ProductCard key={p.id} product={p} categoryIcon={icon} variant="grid" />)}
          </View>
        </View>
      )}
    </ScrollView>
  );
}