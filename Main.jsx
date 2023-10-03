import React from 'react';
import Navegacion from './Screens/ButtonTabScreen';
import PerfilScreen from './Screens/PerfilScreen';
import { createStackNavigator } from '@react-navigation/stack';
import NotificacionesScreen from './Screens/NotificacionesScreen';
import AjustesGeneralesScreen from './Screens/AjustesGeneralesScreen';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';
import OnboardingScreen from './Screens/LoginSession/OnboardingScreen';
import WelcomeScreen from './Screens/LoginSession/WelcomeScreen';
import FrmSolicitarRide from './Screens/FrmSolicitarRide';
import GestionarOfertas from './Screens/GestionarOfertas';
import ReestablecerPassword from './Screens/LoginSession/ReestablecerPassword';
import ChatScreen from './Screens/ChatScreen';


const Main = () => {

  const Stack = createStackNavigator();
  const { user, initializing, firstTime } = useAuth()

  return (
    <>
      { initializing ? <Loader /> : !user  ?
        <Stack.Navigator>
          {
            firstTime && <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
               <Stack.Screen
                name="ReestablecerPassword"
                component={ReestablecerPassword}
                options={{ headerShown: false }}
              />
            </>
          }
        </Stack.Navigator>
        :
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Navegacion}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="Ajustes Generales" component={AjustesGeneralesScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="Solicitar Ride" component={FrmSolicitarRide} options={{ presentation: "modal" }} />
          <Stack.Screen name="GestionarOfertas" component={GestionarOfertas} options={{ presentation: "modal" }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
        </Stack.Navigator>
      }
    </>
  )
}
export default Main 