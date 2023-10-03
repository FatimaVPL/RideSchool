import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from "../hooks/ThemeContext";

const InicioScreen = () => {
  const { colors } = useTheme()
  const {logoutUser, clearUsage, user} = useAuth()
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text>Inicio</Text>
      <TouchableOpacity onPress={ logoutUser }>
        <Text>Salir</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={ clearUsage }>
        <Text>Limpiar Async Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InicioScreen;
