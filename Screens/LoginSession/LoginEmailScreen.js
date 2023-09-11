import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { TextInput } from 'react-native-paper';
import { firebase } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';

 
const LoginEmailScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Refresh the user state every 10 seconds
    const intervalId = setInterval(() => {
      refreshUser(); // Assuming your AuthContext provides a refreshUser function
    }, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const loginUser = async (email, password) => {
    try {
       // El usuario ha iniciado sesión con éxito
      await firebase.auth().signInWithEmailAndPassword(email, password);
      //console.log("User: ", )
    } catch (error) {
      // Manejo de errores específicos
      switch (error.code) {
        case "auth/user-not-found":
          alert("Usuario no encontrado. Verifica el correo electrónico o regístrate si eres nuevo.");
          break;
        case "auth/invalid-email":
          alert("Correo electrónico no válido. Verifica el formato de correo electrónico.");
          break;
        case "auth/wrong-password":
          alert("Contraseña incorrecta. Vuelve a intentarlo.");
          break;
        default:
          alert("Error al iniciar sesión: " + error.message);
          break;
      }
    }
    
  }

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/ride-school.png')} />
      <Text style={styles.bienvenida} variant='headlineLarge'>Ingresa con tu cuenta</Text>

      <TextInput
        placeholder="Correo institucional"
        style={styles.input}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry={true}
        style={styles.input}
        onChangeText={(text) => setPassword(text)}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={() => loginUser(email, password)}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity >
        <Text style={styles.linkText}>Registrate</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bienvenida: {
    textAlign: 'center',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 15,
    marginBottom: 10,
    color: "green"
  },
  input: {
    color: 'black',
    width: 350,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: 'green', //por definir en dark
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: "#000", //por definir en dark
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    textAlign: 'center',
    fontSize: 15,
    marginTop: 5,
    color: "gray",
    fontWeight: "500",
  },
  logo: {
    width: 350,
    height: 200,
  },
});


export default LoginEmailScreen;
