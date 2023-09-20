import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from 'react-native';
import { firebase, auth, db } from '../config-firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from "firebase/auth";


const AuthContext = createContext();
let subscriber = null;
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [firstTime, setFirstTime] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    subscriber = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener el estado de verificación del correo electrónico
        const emailVerified = user.emailVerified
        if (emailVerified) {
          setUser(user)
        } else {
          // El usuario no ha verificado su correo electrónico
          setUser(null)
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    })
    return subscriber;
  }, [])

  // Refrescar estado de usario 
  const refreshUser = async () => {
    try {
      const refreshedUser = auth.currentUser
      if (refreshedUser) {
        const emailVerified = refreshedUser.emailVerified;
        if (emailVerified) {
          setUser(refreshedUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      Alert.alert("Existen errores de verificación de email", error.message);
    }
  }


  const logoutUser = async () => {
    try {
      await firebase.auth().signOut();
      setUser(null);
    } catch (error) {
      // Manejo de errores específicos
      switch (error.code) {
        case "auth/network-request-failed":
          Alert.alert("Error de conexión", "Verifica tu conexión a Internet");
          break;
        default:
          Alert.alert("Error al cerrar sesión" + error.message);
          break;
      }
    }
  }

  const reestablecerPassword = async (email) => {
    try {
      await firebase.auth().sendPasswordResetEmail(email)
    } catch (error) {
      // Manejo de errores específicos
      switch (error.code) {
        case "auth/network-request-failed":
          Alert.alert("Error de conexión", "Verifica tu conexión a Internet");
          break;
        case "auth/invalid-email":
          Alert.alert("Correo no válido", "Revisa el formato del correo electrónico");
          break;
        case "auth/user-not-found":
          Alert.alert("Usario no encontrado", "Revisa tu información o registrate si no lo has hecho");
          break;
        default:
          Alert.alert("Error", "Se produjo un error inesperado");
      }
    }
  }


  const registerUser = async ({ email, password, role, firstName = "", lastName = "", tipoVehiculo, licencia, conductor }) => {
    try {
      // Crear uusario con contraseña
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)

      if (userCredential.user) {
        // Enviar verificación por correo electrónico
        await userCredential.user.sendEmailVerification();
        Alert.alert("Verifica tu correo institucional y da clic en el enlace que se te ha mandado. Después de verificar tu correo espera un momento para volver a iniciar sesión.");
      }
      const user = userCredential.user
      // Crear un nuevo documento de usuario en Firestore
      await db.collection('users').doc(email).set({
        uid: user.uid,
        email: user.email,
        role,
        firstName,
        lastName,
        tipoVehiculo,
        licencia,
        conductor
      });
    } catch (error) {
      // Manejar errores específicos
      switch (error.code) {
        case "auth/email-already-in-use":
          Alert.alert("Correo en uso","El correo electrónico ya está en uso");
          break;
        case "auth/invalid-email":
          Alert.alert("Correo no válido","Revisa el formato del correo electrónico");
          break;
        case "auth/weak-password":
          Alert.alert("Contraseña débil", "Debe contener al menos 6 caracteres");
          break;
        default:
          Alert.alert("Error de crear usuario", error.message);
          break;
      }
    }
  }


  const clearUsage = async () => {
    try {
      await AsyncStorage.removeItem('usage');
    } catch (e) {
      // saving error
    }
  }

  const setUsage = async () => {
    try {
      const value = await AsyncStorage.getItem('usage')
      if (value !== null) {
        setFirstTime(false)
        await AsyncStorage.setItem('usage', 'true');
      }
    } catch (e) {
      // saving error
    }
  }

  return (
    <AuthContext.Provider value={{
      setUser,
      user,
      initializing,
      logoutUser,
      clearUsage,
      firstTime,
      setUsage,
      registerUser,
      refreshUser,
      reestablecerPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

