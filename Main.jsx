import React, { useState, useEffect } from 'react';
import Navegacion from './Screens/ButtonTabScreen';
import PerfilScreen from './Screens/PerfilScreen';
import CambiarRolScreen from './Screens/CambiarRolScreen';
import { createStackNavigator } from '@react-navigation/stack';
import NotificacionesScreen from './Screens/NotificacionesScreen';
import AjustesGeneralesScreen from './Screens/AjustesGeneralesScreen';
import Login from './Screens/LoginEmailScreen';
import Registro from './Screens/RegistroScreen';
import { ThemeProvider } from './hooks/ThemeContext';
import { PaperProvider } from 'react-native-paper';
import WelcomeScreen from './Screens/WelcomeScreen';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';

const Main = () => {

  const Stack = createStackNavigator();
  const { user, initializing, firstTime } = useAuth()

  return (
    <>
      {initializing ? <Loader /> : !user ?
        <Stack.Navigator>
          {
            firstTime && 
            <Stack.Screen 
              name="Welcome"
              component={WelcomeScreen}
            />
          }
          <Stack.Screen
            name='LoginEmail'
            component={Login}
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
          <Stack.Screen name="Cambiar Rol" component={CambiarRolScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="Ajustes Generales" component={AjustesGeneralesScreen} options={{ presentation: "modal" }} />
        </Stack.Navigator>
      }
    </>
  )
}
export default Main