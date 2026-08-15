import { useContext, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute(Component) {
  return function Protected(props) {
    const { user, loading } = useContext(AuthContext);
    const navigation = useNavigation();

    useEffect(() => {
      if (!loading && !user) {
        navigation.replace('Login');
      }
    }, [loading, user]);

    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      );
    }

    if (!user) return null;

    return <Component {...props} />;
  };
}

const styles = StyleSheet.create({
  loader: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center' }
});