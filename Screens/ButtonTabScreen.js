import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InicioScreen from './InicioScreen';
import PerfilScreen from './PerfilScreen';
import SolicitarRide from './SolicitarRide';
import ChatScreen from './ChatScreen';
import RidesScreen from './RidesScreen';
import RidesSolicitados from './RidesSolicitados';
import GestionarOfertas from './GestionarOfertas';
import GestionarRides from './GestionarRides';
import { useAuth } from '../context/AuthContext';
import { db } from '../config-firebase';

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
    try {
      const userSnapshot = await db.collection('users').where('uid', '==', user.uid).get();
      const userDoc = userSnapshot.docs;
      const userData = [];
      userDoc.forEach(doc => {
        userData.push(doc.data());
      })

      setUserData(userData[0]);
      //setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
    }
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
          }} /><Tab.Screen
            name="Rides"
            component={userData?.role == "Conductor" ? RidesSolicitados : SolicitarRide}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="directions-car" size={size} color={color} />
              ),
            }} /><Tab.Screen
            name="Ofertas"
            component={userData?.role == "Conductor" ? GestionarOfertas : GestionarRides}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="pin-drop" size={size} color={color} />
              ),
            }} /><Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubble-ellipses" size={size} color={color} />
              ),
              tabBarBadge: 5
            }} /><Tab.Screen
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
});

export default ButtonTabScreen;