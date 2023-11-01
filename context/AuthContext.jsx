import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [dataUser, setDataUser] = useState(null)
  const [firstTime, setFirstTime] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    subscriber = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const emailVerified = user.emailVerified;
        if (emailVerified) {
          setUser(user);
          getDataUser(user.email);
          // Store the user token in AsyncStorage for persistence
          await AsyncStorage.setItem('userData', JSON.stringify(user))
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
  
    const checkUserToken = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData)
        setUser(user)
        getDataUser(user.email)
      }
      setInitializing(false)
    }
  
    checkUserToken();
  
    return () => subscriber();
  }, []);
  

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
      alert("Existen errores de verificación de email", error.message);
    }
  }

  const logoutUser = async () => {
    try {
      console.log("Loggin out")
      await firebase.auth().signOut();
      setUser(null);
      clearUsage()
    } catch (error) {
      // Manejo de errores específicos
      switch (error.code) {
        case "auth/network-request-failed":
          alert("Se produjo un error de red al cerrar sesión. Verifica tu conexión a Internet.");
          break;
        default:
          alert("Error al cerrar sesión: " + error.message);
          break;
      }
    }
  }

  const reestablecerPassword = async (email) => {
    try {
      await firebase.auth().sendPasswordResetEmail(email.toLowerCase())
    } catch (error) {
      // Manejo de errores específicos
      switch (error.code) {
        case "auth/network-request-failed":
          alert("Se produjo un error de red al cerrar sesión. Verifica tu conexión a Internet.");
          break;
      }
    }
  }

  const registerUser = async ({ email, password, role, firstName = "", lastName = "", tipoVehiculo, conductor }) => {
    try {
      // Crear uusario con contraseña
      const emailMinuscula = email.toLowerCase()
      const userCredential = await auth.createUserWithEmailAndPassword(emailMinuscula, password)

      if (userCredential.user) {
        // Enviar verificación por correo electrónico
        await userCredential.user.sendEmailVerification();
        alert("Verifica tu correo institucional y da clic en el enlace que se te ha mandado. Después de verificar tu correo espera un momento para volver a iniciar sesión.");
      }
      const user = userCredential.user
      // Crear un nuevo documento de usuario en Firestore
      await db.collection('users').doc(emailMinuscula).set({
        uid: user.uid,
        email: user.email,
        role,
        firstName,
        lastName,
        tipoVehiculo,
        conductor,
        numRidesConductor: 0,
        numRidesPasajero: 0,
        califConductor: 0,
        califPasajero: 0,
        photoURL : ""
      });
    } catch (error) {
      // Manejar errores específicos
      switch (error.code) {
        case "auth/email-already-in-use":
          alert("El correo electrónico ya está en uso");
          break;
        case "auth/invalid-email":
          alert("Correo electrónico no válido");
          break;
        case "auth/weak-password":
          alert("Contraseña débil, debe contener al menos 6 caracteres");
          break;
        default:
          alert("Se produjo un error al crear el usuario", error.message);
          break;
      }
    }
  }

  const clearUsage = async () => {
    try {
      await AsyncStorage.removeItem('userData')
    } catch (e) {
      // saving error
    }
  }
/*
  const setUsage = async () => {
    try {
      //const value = await AsyncStorage.getItem('usage')
     // if (value !== null) {
        setFirstTime(false)
        await AsyncStorage.setItem('usage', 'true');
        const value = await AsyncStorage.getItem('usage')
        console.log("Valor setUsage: ", value)
     // }
    } catch (e) {
      // saving error
    }
  }*/

  const getDataUser = async (email) => {
    var reference = db.collection('users').doc(email);
    try {
      const doc = await reference.get();

        if (doc.exists) {
            //console.log(doc.data())
            setDataUser(doc.data())
        }
    } catch (e) {
      console.log('Error al obtener los datos del usuario');
    }
  }

  return (
    <AuthContext.Provider value={{
      setUser,
      user,
      dataUser,
      getDataUser,
      initializing,
      logoutUser,
      clearUsage,
      firstTime,
      registerUser,
      refreshUser,
      reestablecerPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}