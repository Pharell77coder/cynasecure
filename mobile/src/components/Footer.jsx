import { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

export default function Footer() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const FooterLink = ({ label, screen, params }) => (
    <TouchableOpacity onPress={() => navigation.navigate(screen, params)} className="py-1">
      <Text className="text-sm text-gray-400">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="border-t border-gray-800 bg-gray-950 px-4 py-8">
      <TouchableOpacity onPress={() => navigation.navigate('Home')} className="mb-2 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <Text className="text-sm font-bold text-white">C</Text>
        </View>
        <View>
          <Text className="font-bold text-white">Cynasecure</Text>
          <Text className="text-[10px] uppercase tracking-wide text-gray-600">Secure your future</Text>
        </View>
      </TouchableOpacity>

      <Text className="mb-6 text-sm text-gray-500">
        Solutions de sécurité SaaS pour les entreprises. SOC, EDR et XDR accessibles en ligne.
      </Text>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-semibold text-white">Produits</Text>
        <FooterLink label="Catalogue" screen="Catalogue" />
        <FooterLink label="Cyna SOC" screen="Catalogue" params={{ cat: 'soc' }} />
        <FooterLink label="Cyna EDR" screen="Catalogue" params={{ cat: 'edr' }} />
        <FooterLink label="Cyna XDR" screen="Catalogue" params={{ cat: 'xdr' }} />
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-semibold text-white">Compte</Text>
        {user ? (
          <>
            <FooterLink label="Mon compte" screen="Account" />
            <FooterLink label="Mes commandes" screen="Orders" />
            <FooterLink label="Mon panier" screen="Cart" />
          </>
        ) : (
          <>
            <FooterLink label="Se connecter" screen="Login" />
            <FooterLink label="S'inscrire" screen="Register" />
          </>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-semibold text-white">Informations</Text>
        <FooterLink label="Contact" screen="Contact" />
        <FooterLink label="À propos" screen="About" />
        <FooterLink label="Mentions légales" screen="LegalNotice" />
        <FooterLink label="Conditions d'utilisation" screen="Terms" />
      </View>

      <Text className="border-t border-gray-800 pt-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Cyna. Tous droits réservés.
      </Text>
    </View>
  );
}