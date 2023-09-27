import { useEffect, useState } from 'react'
import { StyleSheet, Image, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InicioScreen from './InicioScreen';
import PerfilScreen from './PerfilScreen';
import ChatScreen from './ChatScreen';
import RidesSolicitados from './RidesSolicitados';
import GestionarOfertas from './GestionarOfertas';
import GestionarRides from './GestionarRides';
import FrmSolicitarRide from './FrmSolicitarRide';
import { useAuth } from '../context/AuthContext';
import { db } from '../config-firebase';
import Animation from '../components/Loader'

const Tab = createBottomTabNavigator();

function ButtonTabScreen() {

  const { user, setUsage } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setUsage();
    const unsubscribe = db.collection('users').onSnapshot(() => { getUser() });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

  }, [])

  async function getUser() {
    var reference = db.collection('users').doc(user?.email);
    try {
      const doc = await reference.get();
      if (doc.exists) {
        setUserData(doc.data());
      } else {
        console.log('El documento no existe');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
      throw error;
    }
  }

  if (userData === null) {
    return (
      <View style={styles.centeredView}>
        <Animation></Animation>
      </View>
    );
  }

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} />
      <Tab.Screen
        name="Rides"
        component={userData?.role == "Conductor" ? RidesSolicitados : FrmSolicitarRide}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions-car" size={size} color={color} />
          ),
        }} />
      <Tab.Screen
        name={userData?.role == "Conductor" ? "Mis Ofertas" : "Mis Rides"}
        component={userData?.role == "Conductor" ? GestionarOfertas : GestionarRides}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pin-drop" size={size} color={color} />
          ),
        }} />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
          tabBarBadge: 5
        }} />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          )
        }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
});

export default ButtonTabScreen;