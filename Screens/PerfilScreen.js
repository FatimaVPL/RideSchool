import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from 'react-native-paper';

const PerfilScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Avatar.Image size={150} source={require('../assets/PerfilImage.jpg')} />
         <Text style={styles.roleText}>Los Wiwiriskis</Text>
        <Text style={styles.emailText}>s19120140@alumnos.itsur.edu.mx</Text>
        <View style={styles.badgesContainer}>
          {/* Insignias */}
          <Ionicons name="star" size={24} color="#FFC107" />
          <Ionicons name="star" size={24} color="#FFC107" />
          <Ionicons name="star" size={24} color="#FFC107" />
          <Ionicons name="star" size={24} color="#8C8A82" />
        </View>
        <Text style={styles.roleText}>Pasajero</Text>
      </View>
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Configuraciones</Text>
        <View style={styles.settingsItem}>
          <MaterialIcons name="notifications" size={24} color="#212121" />
          <Text style={styles.settingsText}>Notificaciones</Text>
        </View>
        <View style={styles.settingsItem}>
          <Ionicons name="body" size={24} color="#212121" />
          <Text style={styles.settingsText}>Cambiar de rol</Text>
        </View>
        <View style={styles.settingsItem}>
          <Ionicons name="settings" size={24} color="#212121" />
          <Text style={styles.settingsText}>Ajustes generales</Text>
        </View>
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
  emailText: {
    fontSize: 16,
    marginBottom: 10
  },
  badgesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  settingsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default PerfilScreen;
