import React from 'react';
import { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Avatar, Text, Divider, ActivityIndicator, MD2Colors, PaperProvider } from 'react-native-paper';
import { firebase, db } from '../config-firebase';
import { useAuth } from '../context/AuthContext';


const PerfilScreen = ({ navigation }) => {

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = db.collection('users').onSnapshot(() => { getUser() });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  async function getUser() {
    try {
      const userSnapshot = await db.collection('users').where('uid', '==', user.uid).get();
      const userDoc = userSnapshot.docs;
      const userData = [];
      userDoc.forEach(doc => {
        userData.push(doc.data());
      })

      setUserData(userData[0]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
    }
  }

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();

    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
      // Maneja cualquier error que ocurra durante el cierre de sesión.
    }
  };

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
    <PaperProvider>
      <View style={styles.container}>
        {!isLoading ? (
          <><View style={styles.profileContainer}>
            <Avatar.Image size={150} source={require('../assets/PerfilImage.jpg')} />
            <Text variant='headlineSmall'>{`${userData?.firstName} ${userData?.lastName}`}</Text>
            <Text variant='titleMedium'>{userData?.email}</Text>
            <View style={styles.badgesContainer}>
              {/* Insignias */}
              {Array.from({ length: userData?.scoreDriver }).map((_, index) => (
                <Ionicons key={index} name="star" size={24} color="#FFC107" />
              ))}
              {Array.from({ length: 5 - userData?.scoreDriver }).map((_, index) => (
                <Ionicons key={index} name="star" size={24} color="#8C8A82" />
              ))}
            </View>
            <Text variant='titleMedium'>{userData?.role}</Text>
          </View>
            <View style={styles.settingsContainer}>
              <Text variant='headlineMedium'>Configuraciones</Text>
              <TouchableOpacity onPress={notificaciones}>
                <View style={styles.settingsItem}>
                  <MaterialIcons name="notifications" size={24} color="#212121" style={{ marginRight: 5 }} />
                  <Text variant='labelLarge'>Notificaciones</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={cambiarRol}>
                <View style={styles.settingsItem}>
                  <Ionicons name="ios-people" size={24} color="#212121" style={{ marginRight: 5 }} />
                  <Text variant='labelLarge'>Cambiar de rol</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={ajustesGenerales}>
                <View style={styles.settingsItem}>
                  <Ionicons name="settings" size={24} color="#212121" style={{ marginRight: 5 }} />
                  <Text variant='labelLarge'>Ajustes generales</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <View style={styles.settingsItem}>
                  <Ionicons name="log-out" size={24} color="#DC3803" style={{ marginRight: 5 }} />
                  <Text variant='labelLarge' style={styles.logOutItem}>Cerrar sesión</Text>
                </View>
              </TouchableOpacity>
              <Divider />
            </View></>
        ) : (
          <View style={styles.centeredView}>
            <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
            <Text style={{ color: "black", marginTop: 40 }}>Cargando...</Text>
          </View>
        )}
      </View>
    </PaperProvider>
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
  logOutItem: {
    color: '#DC3803'
  },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
});

export default PerfilScreen;