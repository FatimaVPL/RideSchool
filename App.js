import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navegacion from './Screens/ButtonTabScreen';
import PerfilScreen from './Screens/PerfilScreen';
import CambiarRolScreen from './Screens/CambiarRolScreen';
import { createStackNavigator } from '@react-navigation/stack';
import NotificacionesScreen from './Screens/NotificacionesScreen';
import AjustesGeneralesScreen from './Screens/AjustesGeneralesScreen';
import { firebase } from './config-firebase';
import Login from './Screens/LoginEmailScreen';
import Registro from './Screens/RegistroScreen';



const Stack = createStackNavigator();
function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name='LoginEmail'
          component={Login}
        />
        <Stack.Screen
          name='Registro'
          component={Registro}
        />
      </Stack.Navigator>
    )
  }

  return (
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
  );
}

export default () => {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  )
}


