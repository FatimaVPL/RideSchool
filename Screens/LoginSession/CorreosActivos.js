import React from "react";
import {firebase, db} from '../../config-firebase';
import { Alert } from 'react-native';
import 'firebase/firestore';

// Referencia a la colección 
const usersCollection = db.collection('correos');

const CorreosActivos = ({ correo }) => {
  const emailToCheck = correo;

  return usersCollection
    .where('correo', '==', emailToCheck)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // El correo electrónico ya existe en la base de datos
        return true;
      } else {
        // El correo electrónico no existe en la base de datos
        return false;
      }
    })
    .catch((error) => {
     Alert.alert("Error al verificar correo: ", error)
      throw error; 
    })
}

export default CorreosActivos