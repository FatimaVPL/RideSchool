import React from 'react';
import { ScrollView } from 'react-native';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from "../../hooks/ThemeContext";
import { useEffect } from 'react'
import Informacion from './Informacion';
import { useNotificationContext } from '../../context/NotificationsContext';
import { sendToken } from '../GestionarScreens/others/Queries';
import { Button } from 'react-native-paper';

const InicioScreen = () => {

  const { colors, isDark } = useTheme();
  const { dataUser } = useAuth();
  const { expoPushToken, schedulePushNotification } = useNotificationContext()

 useEffect(() => {
    if (dataUser.token === undefined) {
      sendToken(expoPushToken, dataUser.email)
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.container2}>
          <Image style={styles.logo} source={isDark ? require('../../assets/ride-school-dark.png') : require('../../assets/ride-school.png')} />
          <Text style={[styles.bienvenida, { color: colors.text }]}>Bienvenido(a)</Text>
        </View>

        <Informacion
          titulo="Tu seguridad"
          texto="Recuerda usar casco si vas en motocicleta o si es automóvil usa el cinturón de seguridad"
          imagen={require('../../assets/cinturon.png')}
          link=""
          linkInsta=""
        />
        <Informacion
          titulo="Respeto"
          texto="Para un mejor ambiente, debe existir el respeto"
          imagen={require('../../assets/respeto.png')}
          lugar="izquierda"
          link=""
          linkInsta=""
        />
        <Informacion
          titulo="Calificar"
          texto="Recuerda que calificar qué tal estuvo tu ride es importante, para que los demás tengan una mejor referencia del pasajero o conductor"
          imagen={require('../../assets/calificar.png')}
          link=""
          linkInsta=""
        />
        <Informacion
          titulo="Dudas"
          texto="¿Tienes alguna duda sobre la app?"
          texto2="Nos puedes escribir:"
          imagen={require('../../assets/dudas.png')}
          lugar="izquierda"
          link="rideschool8@gmail.com"
          linkInsta="@rideschool2023"
        />

        <Button onPress={() => schedulePushNotification('holi', 'probando')}>Send Notification</Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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