import React, { useState, useEffect } from 'react';
import Navegacion from './Screens/ButtonTabScreen';
import PerfilScreen from './Screens/PerfilScreen';
import CambiarRolScreen from './Screens/CambiarRolScreen';
import { createStackNavigator } from '@react-navigation/stack';
import NotificacionesScreen from './Screens/NotificacionesScreen';
import AjustesGeneralesScreen from './Screens/AjustesGeneralesScreen';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';
import LoginEmailScreen from './Screens/LoginSession/LoginEmailScreen';
import OnboardingScreen from './Screens/LoginSession/OnboardingScreen';
import Registro from './Screens/LoginSession/RegistroScreen';
import WelcomeScreen from './Screens/LoginSession/WelcomeScreen';
import SolicitarRide from './Screens/SolicitarRide';

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
              />
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
              />
            </>
          }
          <Stack.Screen
            name='LoginEmail'
            component={LoginEmailScreen}
          />
          <Stack.Screen
            name='Registro'
            component={Registro}
          />
        </Stack.Navigator>
        :
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Navegacion}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="SolicitarRide" component={SolicitarRide} options={{ presentation: "modal" }} />
          <Stack.Screen name="Cambiar Rol" component={CambiarRolScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="Ajustes Generales" component={AjustesGeneralesScreen} options={{ presentation: "modal" }} />
        </Stack.Navigator>
      }
    </>
  )
}
export default Main 