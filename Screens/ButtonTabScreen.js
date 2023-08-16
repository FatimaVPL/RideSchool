import {useEffect} from 'react'
import { StyleSheet} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InicioScreen from './InicioScreen';
import PerfilScreen from './PerfilScreen';
import SolicitarRide from './SolicitarRide';
import ChatScreen from './ChatScreen';
import RidesScreen from './RidesScreen';
import {useAuth} from '../context/AuthContext'



const Tab = createBottomTabNavigator();

function ButtonTabScreen() {
  
  const {user,setUsage } = useAuth()

  useEffect(()=>{
    setUsage()
  },[])

  return (
     <Tab.Navigator>
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Rides"
          component={RidesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="directions-car" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
            ),
          tabBarBadge:5
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
              )
          }}
        />
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