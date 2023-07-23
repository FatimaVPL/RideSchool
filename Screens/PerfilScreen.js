import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Avatar, Text, Divider } from 'react-native-paper';



const PerfilScreen = ({ navigation }) => {
  const cambiarRol = () => {
    navigation.navigate('Cambiar Rol');
  };

  const notificaciones = () => {
    navigation.navigate('Notificaciones');
  };

  const ajustesGenerales = () => {
    navigation.navigate('Ajustes Generales');
  };
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Avatar.Image size={150} source={require('../assets/PerfilImage.jpg')} />
         <Text variant='headlineSmall'>Los Wiwiriskis</Text>
        <Text variant='titleMedium'>s19120140@alumnos.itsur.edu.mx</Text>
        <View style={styles.badgesContainer}>
          {/* Insignias */}
          <Ionicons name="star" size={24} color="#FFC107" />
          <Ionicons name="star" size={24} color="#FFC107" />
          <Ionicons name="star" size={24} color="#FFC107" />
          <Ionicons name="star" size={24} color="#8C8A82" />
        </View>
        <Text variant='titleMedium'>Pasajero</Text>
      </View>
      <View style={styles.settingsContainer}>
        <Text variant='headlineMedium'>Configuraciones</Text>
      <TouchableOpacity  onPress={notificaciones}>
      <View style={styles.settingsItem}>
          <MaterialIcons name="notifications" size={24} color="#212121" />
          <Text variant='labelLarge'>Notificaciones</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity  onPress={cambiarRol}>
      <View style={styles.settingsItem}>
          <Ionicons name="ios-people" size={24} color="#212121" />
          <Text variant='labelLarge'>Cambiar de rol</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity  onPress={ajustesGenerales}>
      <View style={styles.settingsItem}>
          <Ionicons name="settings" size={24} color="#212121" />
          <Text variant='labelLarge'>Ajustes generales</Text>
        </View>
      </TouchableOpacity>
        <Divider/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  settingsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
});

export default PerfilScreen;
