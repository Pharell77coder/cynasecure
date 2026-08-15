import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <Header />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {children}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}