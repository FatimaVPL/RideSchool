import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, Image } from 'react-native';
import { TextInput, ActivityIndicator, MD2Colors } from 'react-native-paper'
import { useAuth } from '../../context/AuthContext';
import { object, string } from 'yup';
import { Formik } from 'formik';
import { useTheme } from "../../hooks/ThemeContext";

const ReestablecerPassword = ({ navigation }) => {
  const { reestablecerPassword } = useAuth()
  const [spiner, setSpiner] = useState(false);
  const [email, setEmail] = useState('');
  const { colors } = useTheme();

  const validationSchema = object().shape({
    email: string()
      .required("Campo obligatorio")
      .email('Dirección de correo electrónico no válida')
      .max(31, "Deben ser 31 caracteres")
      .test('domain', 'El dominio debe ser alumnos.itsur.edu.mx', value => {
        if (!value) return false;
        const domain = value.split('@')[1];
        return domain === 'alumnos.itsur.edu.mx';
      })
  })

  const reestablecer = async (email) => {
    try {
      // Registro de usuario
      await reestablecerPassword(email.ToLowerCase())
      Alert.alert("Confirmación", "Se te ha enviado un correo con las intrucciones para reestablecer tu contraseña");
      navigation.navigate('Welcome')
    }
    catch (error) {
      Alert.alert("Reestablecer contraseña", "No se pudo enviar el link para restablecer la contraseña");
    }
  }

  return (
    <>
      {spiner ? (
        <View style={[styles.spiner, {backgroundColor: colors.background}]}>
          <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
          <Text style={{ color: "black", marginTop: 40 }}>Cargando...</Text>
        </View>
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Formik
          initialValues={{ email: email }}
          validationSchema={validationSchema}
          validateOnMount={true}
          onSubmit={(values) => {
            setSpiner(true);
            reestablecer(values.email);
          }}
        >
          {({ handleBlur, handleChange, handleSubmit, touched, errors, values }) => (
           
            <View style={styles.container} >
             
              <Text style={styles.bienvenida} variant='headlineLarge'>Ingresa tu correo institucional</Text>
              <TextInput
                placeholder="Correo institucional"
                style={[styles.input, {backgroundColor: colors.input, color:colors.text}]}
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                theme={{ colors: { text: 'green', primary: 'green' } }}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Recuperar contraseña</Text>
              </TouchableOpacity>
              <StatusBar style="auto" />
            </View>
           
          )}
        </Formik>
        </View>
        )
      }
    </>
  )
}

const styles = StyleSheet.create({
  image: {
    width: '90%',
    height: '90%',
  },
  spiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  imageLogo: {
    width: 70,
    height: 65,
    marginTop: 15,
    position: 'absolute',
  },
  containerPrincipal: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingTop: 50,
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
    marginBottom: 10,
    color: '#D6A50C'
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
    backgroundColor: 'green',
    padding: 10,
    marginTop: 30,
    borderRadius: 10,
    shadowColor: "#000", 
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

export default ReestablecerPassword;


