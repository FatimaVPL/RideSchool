import { useEffect, useState } from 'react'
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InicioScreen from './InicioScreen';
import PerfilScreen from './PerfilScreen';
import ChatScreen from './ChatScreen';
import RidesSolicitados from './RidesSolicitados/RidesMap';
import GestionarOfertas from './GestionarScreens/Ofertas';
import GestionarRides from './GestionarScreens/Rides';
import FrmSolicitarRide from './SolicitarRide/FrmSolicitarRide';
import { useAuth } from '../context/AuthContext';
import { db } from '../config-firebase';
import Animation from '../components/Loader'
import { useTheme } from "../hooks/ThemeContext";
import { subscribeToUsers } from '../firebaseSubscriptions';

const Tab = createBottomTabNavigator();

function ButtonTabScreen() {
  const { colors } = useTheme()
  const { user, setUsage } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setUsage();

    const unsubscribeUsers = subscribeToUsers(() => { getUser() });

    return () => {
      unsubscribeUsers();
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
      <View style={{ backgroundColor: colors.background }}>
        <Animation></Animation>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // headerShown: false,
        tabBarActiveTintColor: colors.colorSelect,
        tabBarInactiveTintColor: "#78A57D",
        tabBarStyle: {
          paddingHorizontal: 5,
          paddingTop: 0,
          backgroundColor: colors.background2,
          //position: 'absolute',
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={colors.iconTab} />
          ),
          headerStyle: {
            backgroundColor: colors.background2,
          },
          headerTitleStyle: {
            color: colors.text
          },
        }}

      />
      <Tab.Screen
        name="Rides"
        component={userData?.role == "Conductor" ? RidesSolicitados : FrmSolicitarRide}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions-car" size={size} color={colors.iconTab} />
          ),
          headerStyle: {
            backgroundColor: colors.background2,
          },
          headerTitleStyle: {
            color: colors.text
          },
          headerShown: false,
        }} />
      <Tab.Screen
        name={userData?.role == "Conductor" ? "Mis Ofertas" : "Mis Rides"}
        component={userData?.role == "Conductor" ? GestionarOfertas : GestionarRides}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pin-drop" size={size} color={colors.iconTab} />
          ),
          headerStyle: {
            backgroundColor: colors.background2,
          },
          headerTitleStyle: {
            color: colors.text
          },
        }} />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={colors.iconTab} />
          ),
          tabBarBadge: 5,
          headerStyle: {
            backgroundColor: colors.background2,
          },
          headerTitleStyle: {
            color: colors.text
          },
        }} />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={colors.iconTab} />
          ),
          headerStyle: {
            backgroundColor: colors.background2,
          },
          headerTitleStyle: {
            color: colors.text
          },
        }} />
    </Tab.Navigator>
  );
}

export default ButtonTabScreen;