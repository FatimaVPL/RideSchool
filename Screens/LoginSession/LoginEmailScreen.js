import React, {useState} from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, StatusBar } from 'react-native';
import {firebase} from '../../config-firebase';

const LoginEmailScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    loginUser = async (email, password) => {
       try {
        await firebase.auth().signInWithEmailAndPassword(email, password)
       } catch (error) {
        alert(error.message)
       } 
    }

    return(
        <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/ride-school.png')} />
      <Text style={styles.bienvenida} variant='headlineLarge'>Ingresa con tu cuenta</Text>

      <TextInput
        placeholder="Correo institucional"
        style={styles.input}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry={true}
        style={styles.input}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity onPress={()=> loginUser(email,password)}>
        <Text style={styles.button}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> navigation.navigate('Registro')}>
        <Text style={styles.linkText}>Registrate</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    bienvenida: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      height: 45,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 20,
      paddingHorizontal: 10,
      fontSize: 20
    },
    button: {
      backgroundColor: 'green',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginBottom: 10,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 15
    },
    bottomLinks: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    linkText: {
      marginHorizontal: 5,
      color: '#645518'
    },
    logo: {
      width: 350,
      height: 200,
    },
  });
  

export default LoginEmailScreen;