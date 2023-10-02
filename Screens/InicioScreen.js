import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from "../hooks/ThemeContext";

const InicioScreen = () => {
  const { colors, image } = useTheme()
  const {logoutUser, clearUsage, user} = useAuth()
  //console.log("Usuario inicio: ", user)
  return (
    <View style={[styles.spiner, {backgroundColor: colors.background}]}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InicioScreen;
