import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from "../hooks/ThemeContext";
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react'

const InicioScreen = () => {
  useEffect(() => { getNotificationsPermission() }, []);

  const { colors, image } = useTheme();
  const { logoutUser, clearUsage, user } = useAuth();

  async function getNotificationsPermission() {
    const { granted } = await Notifications.requestPermissionsAsync();

    if (granted) {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token); 
    }
  }

  return (
    <View style={[styles.spiner, { backgroundColor: colors.background }]}>
      <Text>Inicio</Text>
      <TouchableOpacity onPress={logoutUser}>
        <Text>Salir</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearUsage}>
        <Text>Limpiar Async Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InicioScreen;
