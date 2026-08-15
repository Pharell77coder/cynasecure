import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { StripeProvider } from '@stripe/stripe-react-native';
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './src/context/AuthContext'
import { CartProvider, CartContext } from './src/context/CartContext'
import ProtectedRoute from './src/components/ProtectedRoute'
import "./global.css";

import Home from './src/pages/Home'
import Catalogue from './src/pages/Catalogue'
import Product from './src/pages/Product'
import Search from './src/pages/Search'
import Cart from './src/pages/Cart'
import Checkout from './src/pages/Checkout'
import Account from './src/pages/Account'
import Orders from './src/pages/Orders'
import Contact from './src/pages/Contact'
import About from './src/pages/About'
import LegalNotice from './src/pages/LegalNotice'
import Terms from './src/pages/Terms'
import Login from './src/pages/Login'
import Register from './src/pages/Register'
import ConfirmEmail from './src/pages/ConfirmEmail'
import ResetPassword from './src/pages/ResetPassword'
import NotFound from './src/pages/NotFound'

const RootStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const CatalogueStack = createNativeStackNavigator()
const CartStack = createNativeStackNavigator()
const AccountStack = createNativeStackNavigator()

const screenOpts = { headerShown: false }

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={screenOpts}>
      <HomeStack.Screen name="HomeMain" component={Home} />
    </HomeStack.Navigator>
  )
}

function CatalogueStackScreen() {
  return (
    <CatalogueStack.Navigator screenOptions={screenOpts}>
      <CatalogueStack.Screen name="CatalogueMain" component={Catalogue} />
      <CatalogueStack.Screen name="Product" component={Product} />
    </CatalogueStack.Navigator>
  )
}

function CartStackScreen() {
  return (
    <CartStack.Navigator screenOptions={screenOpts}>
      <CartStack.Screen name="CartMain" component={Cart} />
      <CartStack.Screen name="Checkout" component={ProtectedRoute(Checkout)} />
    </CartStack.Navigator>
  )
}

function AccountStackScreen() {
  const { user } = useContext(AuthContext)
  return (
    <AccountStack.Navigator screenOptions={screenOpts}>
      {user ? (
        <>
          <AccountStack.Screen name="AccountMain" component={Account} />
          <AccountStack.Screen name="Orders" component={Orders} />
        </>
      ) : (
        <AccountStack.Screen name="Login" component={Login} />
      )}
    </AccountStack.Navigator>
  )
}

function MainTabs() {
  const { cartCount } = useContext(CartContext)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { backgroundColor: '#030712', borderTopColor: '#1f2937' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            HomeTab: 'home',
            CatalogueTab: 'grid',
            CartTab: 'cart',
            AccountTab: 'person'
          }
          return <Ionicons name={icons[route.name]} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="CatalogueTab" component={CatalogueStackScreen} options={{ title: 'Catalogue' }} />
      <Tab.Screen
        name="CartTab"
        component={CartStackScreen}
        options={{ title: 'Panier', tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tab.Screen name="AccountTab" component={AccountStackScreen} options={{ title: 'Compte' }} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
<StripeProvider publishableKey="pk_test_51U2rXm6IGdUm7geu0PVAy2erEXRs410wlolbi6BZS16u84cLRypA0cTtDlBtMHj3KWIYzTtsAUVGzyG0MNOZoTpt00vmBifszm">
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: true }}>
            <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

            <RootStack.Screen name="Search" component={Search} options={{ title: 'Recherche' }} />
            <RootStack.Screen name="Contact" component={Contact} />
            <RootStack.Screen name="About" component={About} options={{ title: 'À propos' }} />
            <RootStack.Screen name="LegalNotice" component={LegalNotice} options={{ title: 'Mentions légales' }} />
            <RootStack.Screen name="Terms" component={Terms} options={{ title: 'CGU' }} />
            <RootStack.Screen name="Register" component={Register} options={{ title: 'Inscription' }} />
            <RootStack.Screen name="ConfirmEmail" component={ConfirmEmail} />
            <RootStack.Screen name="ResetPassword" component={ResetPassword} />
            <RootStack.Screen name="NotFound" component={NotFound} options={{ title: 'Page introuvable' }} />
          </RootStack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
    </StripeProvider>
  )
}