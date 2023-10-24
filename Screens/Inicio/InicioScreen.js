import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from "../../hooks/ThemeContext";
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react'
import Informacion from './Informacion';

const InicioScreen = () => {
  useEffect(() => { getNotificationsPermission() }, []);

  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  async function getNotificationsPermission() {
    const { granted } = await Notifications.requestPermissionsAsync();

    if (granted) {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token); 
    }
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
       <ScrollView>
      <View style={styles.container2}>
      <Image style={styles.logo} source={isDark ? require('../../assets/ride-school-dark.png') : require('../../assets/ride-school.png')} />
      <Text style={[styles.bienvenida,{color:colors.text}]}>Bienvenido(a)</Text>
      </View>
     
      <Informacion
      titulo= "Tu seguridad"
      texto="Recuerda usar casco si vas en motocicleta o si es automóvil usa el cinturón de seguridad"
      imagen={require('../../assets/cinturon.png')}
    />
     <Informacion
      titulo= "Respeto"
      texto="Para un mejor ambiente, debe existir el respeto"
      imagen={require('../../assets/respeto.png')}
      lugar="izquierda"
    />
     <Informacion
      titulo= "Calificar"
      texto="Recuerda que calificar qué tal estuvo tu ride es importante, para que los demás tengan una mejor referencia del pasajero o conductor"
      imagen={require('../../assets/calificar.png')}
    />
     <Informacion
      titulo= "Dudas"
      texto="¿Tienes alguna duda sobre la app? nos puedes escribir al correo:"
      imagen={require('../../assets/dudas.png')}
      link="rideschool8@gmail.com"
      lugar="izquierda"
    />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container2: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%'
  },
  logo: {
    width: 350,
    height: 200,
  },
  bienvenida: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 25,
    marginBottom: 10,
  },
});

export default InicioScreen;
