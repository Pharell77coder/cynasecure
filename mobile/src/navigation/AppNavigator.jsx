import { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CartContext } from '../context/CartContext';
import { colors, typography } from '../theme';

/* ── Screens ── */
import HomeScreen from '../screens/HomeScreen';
import CatalogueScreen from '../screens/CatalogueScreen';
import ProductScreen from '../screens/ProductScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AccountScreen from '../screens/AccountScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ContactScreen from '../screens/ContactScreen';
import {
  LoginScreen, RegisterScreen, ForgotPasswordScreen,
  ResetPasswordScreen, VerifyEmailScreen,
} from '../screens/AuthScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ── Deep linking : ouvre l'app depuis les liens des e-mails Flask
   (ex. http://localhost:5173/reset-password?token=... côté web devient
   cyna://reset-password?token=... côté app — à adapter dans users.py si
   tu veux générer des liens mobiles dédiés, ou garder un lien web qui
   redirige vers le custom scheme). ── */
const linking = {
  prefixes: ['cyna://'],
  config: {
    screens: {
      AccountTab: {
        screens: {
          ResetPassword: 'reset-password',
          VerifyEmail: 'verify-email',
        },
      },
    },
  },
};

const TAB_ICONS = {
  HomeTab: '🏠', CatalogueTab: '📦', SearchTab: '🔍', CartTab: '🛒', AccountTab: '👤', ContactTab: '💬',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { cartCount } = useContext(CartContext);

  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#0D0B3B', paddingBottom: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.tabBarLabel ?? route.name.replace('Tab', '');
        const icon = TAB_ICONS[route.name];
        const isCart = route.name === 'CartTab';

        return (
          <TouchableOpacity key={route.key} style={{ flex: 1, alignItems: 'center', gap: 3 }} onPress={() => navigation.navigate(route.name)} activeOpacity={0.7}>
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 22 }}>{icon}</Text>
              {isCart && cartCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: colors.secondary, borderRadius: 99, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 10, fontWeight: isFocused ? '700' : '500', color: isFocused ? 'white' : 'rgba(255,255,255,0.45)' }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const stackOptions = {
  headerStyle: { backgroundColor: '#0D0B3B' },
  headerTintColor: 'white',
  headerTitleStyle: { fontWeight: '700', fontSize: typography.lg },
  headerBackTitleVisible: false,
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Catalogue" component={CatalogueScreen} options={{ title: 'Catalogue' }} />
    <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Service' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Commande' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
    <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact' }} />
  </Stack.Navigator>
);

const CatalogueStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Catalogue" component={CatalogueScreen} options={{ title: 'Catalogue' }} />
    <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Service' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Commande' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Recherche' }} />
    <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Service' }} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Mon panier' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Commande' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Mon compte' }} />
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Mes commandes' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Mot de passe oublié' }} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Réinitialisation' }} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Vérification' }} />
  </Stack.Navigator>
);

const ContactStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact & Support' }} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="CatalogueTab" component={CatalogueStack} options={{ tabBarLabel: 'Catalogue' }} />
    <Tab.Screen name="SearchTab" component={SearchStack} options={{ tabBarLabel: 'Recherche' }} />
    <Tab.Screen name="CartTab" component={CartStack} options={{ tabBarLabel: 'Panier' }} />
    <Tab.Screen name="AccountTab" component={AccountStack} options={{ tabBarLabel: 'Compte' }} />
    <Tab.Screen name="ContactTab" component={ContactStack} options={{ tabBarLabel: 'Contact' }} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer linking={linking}>
    <TabNavigator />
  </NavigationContainer>
);

export default AppNavigator;
