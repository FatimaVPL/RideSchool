import React, { useState, useEffect } from 'react';
import Navegacion from './screens/ButtonTabScreen';
import { NavigationContainer } from '@react-navigation/native';
import PerfilScreen from './screens/PerfilScreen';
import CambiarRolScreen from './screens/CambiarRolScreen';
import { createStackNavigator } from '@react-navigation/stack';
import NotificacionesScreen from './screens/NotificacionesScreen';
import AjustesGeneralesScreen from './screens/AjustesGeneralesScreen';
import { firebase } from './config-firebase';
import Login from './screens/LoginEmailScreen';
import Registro from './screens/RegistroScreen';


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


