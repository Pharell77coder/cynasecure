import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography, shadow } from '../theme';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const { id, name, priceMonthly, available = true } = product;

  const price = priceMonthly ? (priceMonthly / 100).toFixed(0) : '–';

  const icon = name?.includes('SOC') ? '🛡️'
    : name?.includes('EDR') ? '💻'
    : name?.includes('XDR') ? '🔍' : '🔒';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Product', { id })}
      activeOpacity={0.85}
      style={[styles.card, !available && styles.cardUnavailable]}
    >
      <LinearGradient
        colors={['#0D0B3B', '#1E1B74']}
        style={styles.imageBox}
      >
        <Text style={styles.icon}>{icon}</Text>
        {!available && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Stock épuisé</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {available ? (
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price} €</Text>
            <Text style={styles.period}>/ mois</Text>
          </View>
        ) : (
          <Text style={styles.unavailable}>Indisponible</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
    marginBottom: spacing[3],
  },
  cardUnavailable: { opacity: 0.6 },

  imageBox: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: { fontSize: 40 },

  badge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  badgeText: { color: 'white', fontSize: typography.xs, fontWeight: '700' },

  body: { padding: spacing[3] },

  name: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing[1],
    lineHeight: 20,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: typography.xl, fontWeight: '900', color: colors.primary },
  period: { fontSize: typography.sm, color: colors.textMuted },
  unavailable: { fontSize: typography.sm, color: colors.danger, fontWeight: '600' },
});

export default ProductCard;
