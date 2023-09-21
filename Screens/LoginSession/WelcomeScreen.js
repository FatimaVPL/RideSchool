import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { firebase } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { object, string } from 'yup';
import { Formik } from 'formik';
import Animation from '../../components/Loader'

const WelcomeScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true)
  const [spiner, setSpiner] = useState(false);

  //Esquema de validación
  const validationSchema = object().shape({
    email: string()
      .required("Campo obligatorio")
      .email('Dirección de correo electrónico no válida')
      .max(31, "Deben ser 31 caracteres")
      .test('domain', 'El dominio debe ser alumnos.itsur.edu.mx', value => {
        if (!value) return false;
        const domain = value.split('@')[1];
        return domain === 'alumnos.itsur.edu.mx';
      }),
    password: string()
      .required("Campo obligatorio")
      .min(8, "Debe ser mayor o igual a 8")
      .max(16, "Debe ser menor a 17")
  })

  useEffect(() => {
    // Refresca el estado del usuario cada 5 segundos
    const intervalId = setInterval(() => {
      refreshUser();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const loginUser = async (email, password) => {
    try {
      // El usuario ha iniciado sesión con éxito
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      // Verificar si el correo electrónico ha sido verificado
      if (!user.emailVerified) {
        // El correo electrónico no ha sido verificado
        Alert.alert("Verificar Correo","Por favor, verifica tu correo electrónico antes de iniciar sesión.");
      }
    } catch (error) {
      // Manejo de errores específicos
      switch (error.code) {
        case "auth/user-not-found":
          Alert.alert("Usuario no encontrado.","Verifica el correo electrónico o regístrate si eres nuevo");
          setSpiner(false)
          break;
        case "auth/invalid-email":
          Alert.alert("Correo electrónico no válido","Verifica el formato de correo electrónico");
          setSpiner(false)
          break;
        case "auth/wrong-password":
          Alert.alert("Contraseña incorrecta","Vuelve a intentarlo o reestablece tu contraseña");
          setSpiner(false)
          break;
        default:
          Alert.alert("Error al iniciar sesión" + error.message);
          setSpiner(false)
          break;
      }
    }

  }

  return (
    // El formularío 
    <>
     {spiner ? (
        <View style={styles.spiner}>
          <Animation></Animation>
        </View>
      ) : (
     <Formik
      enableReinitialize={true}
      initialValues={{ email: email, password: password }}
      validationSchema={validationSchema}
      validateOnMount={true}
      onSubmit={(values) => {
        setSpiner(true);
        loginUser(values.email, values.password);
      }}
    >
      {({ handleBlur, handleChange, handleSubmit, touched, errors, values }) => (
        <View style={styles.container} >
          <Image style={styles.logo} source={require('../../assets/ride-school.png')} />
          <Text style={styles.bienvenida} variant='headlineLarge'>Encuentra el camino seguro a tu educación</Text>

          <TextInput
            placeholder="Correo institucional"
            style={styles.input}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            autoCapitalize="none"
            autoComplete='email'
          />
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            autoCapitalize="none"
            secureTextEntry={passwordVisible}
            right={<TextInput.Icon icon={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}
          />
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ReestablecerPassword')} >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Onboarding')} >
            <Text style={styles.linkText}>Registrate</Text>
          </TouchableOpacity>
          <StatusBar style="auto" />
        </View >
      )}
    </Formik>
       )
      }
    </>
   
  );
}

const styles = StyleSheet.create({
  spiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
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
    color: "#D6A50C"
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
    width: 300,
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
    fontSize: 20,
    marginTop: 5,
    color: "gray",
    fontWeight: "500",
  },
  logo: {
    width: 350,
    height: 200,
  },
  errorText: {
    color: '#F4574B'
  }
});
export default WelcomeScreen;
