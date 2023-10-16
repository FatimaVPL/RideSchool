import React from 'react';
import { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, Divider, ActivityIndicator, MD2Colors, PaperProvider, Button, Modal, Portal } from 'react-native-paper';
import { firebase, db } from '../config-firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from "../hooks/ThemeContext";
import { Avatar, LinearProgress } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';
import ProgressBar from './ProgressBar';

const PerfilScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [modalALert, setModalAlert] = useState(false);
  const [modalDialog, setModalDialog] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [permisos, setPermisos] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [progress, setProgress] = useState(0);

  const pickImage = async () => {
    let result
    try {
      const galeriaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galeriaStatus.status === 'granted') {
       result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
      });  
      }else{
        Alert.alert("Permisos", "Necesitas dar permiso para cargar la imagen. Por favor, ve a la configuración de la aplicación para habilitar los permisos.");
      }
     
      if (!result.canceled) {
         const originalImageUri = result.assets[0].uri
         const manipulatedImage = await manipulateAsync(
          originalImageUri,
          [{ resize: { width: 200, height: 200 } }], 
          { compress: 1, format: SaveFormat.JPEG }
      )
      setImagen(manipulatedImage.uri)
          if (imagen) {
              try {
                  const response = await fetch(imagen);
                  const blob = await response.blob();
                  const filename = imagen.substring(imagen.lastIndexOf('/') + 1)
                  const ref = firebase.storage().ref().child("avatars/" + filename);
                  ref.put(blob).on(
                      "state_changed",
                      (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setProgress(progress);
                        console.log("Progreso ",progress)
                      },
                      (error) => {
                        console.error(error);
                        setProgress(0);
                      },
                      async () => { 
                        const imageURL = await ref.getDownloadURL()
                  blob.close();
                  updatePhotoURL(imageURL)
                  Alert.alert("Imagen almacenada", "Se subio correctamente tu foto")
                  setImagen(null)
                  setProgress(0);
              })
              } catch (error) {
                  console.error(error)
                  setProgress(0);

              }
          }
      } else {
          Alert.alert("No hay imagen", "Por favor selecciona una imagen")
      }
  } catch (error) {
      console.error(error)
  } finally {
    setProgress(0);
  }
}


  /* *********************** Borrar foto de perfil anterior ************************** */

  const borrarFoto = async (previousPhotoURL) =>{
 if (previousPhotoURL) {
    try {
      const previousImageRef = firebase.storage().refFromURL(previousPhotoURL);
      await previousImageRef.delete();
    } catch (error) {
      console.error("Error al eliminar la imagen anterior", error);
    }
  }
  }

  /* *********************** Mofificar campo  photoURL ******************************** */
  async function updatePhotoURL(imageURL) {
    const userRef = db.collection('users').doc(userData.email);

    try {
      const docSnapshot = await userRef.get();

      if (docSnapshot.exists) {
        await userRef.update({
          photoURL: imageURL,
        });
      }
    } catch (error) {
      console.log('Error al actualizar', error);
    }
  }

  /*************************************************************** */
  useEffect(() => {
    const unsubscribe = db.collection('users').onSnapshot(() => { getUser() });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  async function getUser() {
    var reference = db.collection('users').doc(user.email);
    try {
      const doc = await reference.get();
      if (doc.exists) {
        setUserData(doc.data());
        setIsLoading(false);
      } else {
        console.log('El documento no existe');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
      throw error;
    }
  }

  async function updateRole() {
    setModalAlert(false);
    setShowOverlay(false);

    var user = db.collection('users').doc(userData.email);
    const roleConstant = userData.role === "Conductor" ? "Pasajero" : "Conductor";

    try {
      const docSnapshot = await user.get();

      if (docSnapshot.exists) {
        user.update({
          role: roleConstant
        });
      }
    } catch (error) {
      console.log('Error al actualizar', error);
    }
  }

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();

    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  }

  const notificaciones = () => {
    navigation.navigate('Notificaciones');
  }

  const ajustesGenerales = () => {
    navigation.navigate('Ajustes Generales');
  }
  const SubirDocumentosScreen = () => {
    navigation.navigate('Subir documentos');
  }

  const getInfoMedal = (num) => {
    if (num >= 100) {
      return { color: "#E6BB3F", text: "Oro" };
    } else if (num >= 50) {
      return { color: "#AAA499", text: "Plata" };
    } else if (num >= 30) {
      return { color: "#BA9248", text: "Bronce" };
    } else {
      return false;
    }
  }

  return (
    <ScrollView>
    <PaperProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {!isLoading ? (
          <>
            <View style={[styles.profileContainer, { backgroundColor: colors.background }]}>
              <Avatar
                rounded
                onPress={() => pickImage()}
                size="xlarge"
                source={userData.photoURL ? { uri: userData.photoURL } : require('../assets/default.jpg')}
              />
               { imagen &&  <ProgressBar progress={progress}/> } 
              <Text variant='headlineSmall'>{`${userData.firstName} ${userData.lastName}`}</Text>
              <Text variant='titleMedium'>{userData.email}</Text>
              {/* CALIFICACION GENERAL */}
              <View style={styles.badgesContainer}>
                {Array.from({ length: userData.role === "Pasajero" ? userData.califPasajero : userData.califConductor }).map((_, index) => (
                  <Ionicons key={index} name="star" size={24} color="#FFC107" />
                ))}
                {Array.from({ length: 5 - (userData.role === "Pasajero" ? userData.califPasajero : userData.califConductor) }).map((_, index) => (
                  <Ionicons key={index} name="star" size={24} color="#8C8A82" />
                ))}
              </View>
              <Text variant='titleMedium'>{userData.role}</Text>
              <Button onPress={() => { setModalAlert(true); setShowOverlay(true); }}>
                Usar en modo {userData.role === "Conductor" ? "Pasajero" : "Conductor"}</Button>
            </View>
            {/* INSIGNIAS */}
            <View style={{ borderRadius: 12, borderWidth: 2, borderColor: '#45B39D', padding: 15, marginBottom: 10 }}>
              <Text variant='titleLarge' style={{ textAlign: 'center', marginBottom: 10 }}>Insignias</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {userData.role === "Conductor" && (
                  <>
                    {userData.licencia !== "ninguna" && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="card-account-details-star" style={{ fontSize: 38 }} />
                        <Text style={{ textAlign: 'center' }}>Licencia</Text>
                      </View>
                    )}
                    {userData.tarjetaCirculacion && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="credit-card-check" style={{ fontSize: 38 }} />
                        <Text style={{ textAlign: 'center' }}>{"Tarjeta \n Circulación"}</Text>
                      </View>
                    )}
                    {getInfoMedal(userData.numRidesConductor) !== false && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="medal" style={{ fontSize: 38 }} color={getInfoMedal(userData.numRidesConductor).color} />
                        <Text style={{ textAlign: 'center' }}>{`Conductor \n ${getInfoMedal(userData.numRidesConductor).text}`}</Text>
                      </View>
                    )}
                  </>
                )}
                {userData.role === "Pasajero" && (
                  <>
                    {getInfoMedal(userData.numRidesPasajero) !== false && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="medal" style={{ fontSize: 38 }} color={getInfoMedal(userData.numRidesPasajero).color} />
                        <Text style={{ textAlign: 'center' }}>{`Pasajero \n ${getInfoMedal(userData.numRidesPasajero).text}`}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>

            </View>

            <View style={styles.settingsContainer}>
              <Text variant='headlineMedium'>Configuraciones</Text>
              <TouchableOpacity onPress={notificaciones}>
                <View style={styles.settingsItem}>
                  <MaterialIcons name="notifications" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
                  <Text variant='labelLarge'>Notificaciones</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={ajustesGenerales}>
                <View style={styles.settingsItem}>
                  <Ionicons name="settings" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
                  <Text variant='labelLarge'>Ajustes generales</Text>
                </View>
              </TouchableOpacity>
              {/** Cambiar a === "Conductor" nomas es para pruebas */}
              {userData.role === "Pasajero" && (
                 <TouchableOpacity onPress={SubirDocumentosScreen}>
                 <View style={styles.settingsItem}>
                 <Ionicons name="image" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
             <Text variant='labelLarge'>Subir licencia/tarjeta de circulación</Text>
                 </View>
         </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleLogout}>
                <View style={styles.settingsItem}>
                  <Ionicons name="log-out" size={24} color="#DC3803" style={{ marginRight: 5 }} />
                  <Text variant='labelLarge' style={styles.logOutItem}>Cerrar sesión</Text>
                </View>
              </TouchableOpacity>
              <Divider />
            </View>
            {modalALert && (
              <Portal>
                <Modal visible={modalALert} onDismiss={() => setModalAlert(false)} contentContainerStyle={{ flex: 1 }}>
                  <View style={styles.centeredView}>
                    <View style={[styles.modalView, { padding: 15 }]}>
                      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="help-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#FFC300" }}></Ionicons>
                        <Text style={[styles.modalText, { fontSize: 18 }]}>Cambiar la app a modo:</Text>
                        <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>{userData.role == "Conductor" ? "PASAJERO" : "CONDUCTOR"}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button mode="contained" buttonColor='#B2D474' style={{ width: 140 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                          onPress={() => { userData.role === "Pasajero" && !userData.conductor ? (() => { setModalAlert(false); setModalDialog(true); }) : updateRole() }}> SI </Button>
                        <Button mode="contained" buttonColor='#EE6464' style={{ width: 140 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                          onPress={() => setModalAlert(false)}> NO </Button>
                      </View>
                    </View>
                  </View>
                </Modal>
              </Portal>
            )}

            <Portal>
              <Modal visible={modalDialog} onDismiss={() => setModalDialog(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={styles.centeredView}>
                  <View style={[styles.modalView, { padding: 15 }]}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="information-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#FFC300" }}></Ionicons>
                      <Text style={[styles.modalText, { fontSize: 16, margin: 4, textAlign: 'center' }]}>Primero necesitas completar tu registro para usar la app en modo conductor</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Button mode="contained" buttonColor='#B2D474' style={{ width: 140 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                        onPress={() => console.log('Pantallas para completar el registro')}> Completar </Button>
                      <Button mode="contained" buttonColor='#EE6464' style={{ width: 140 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                        onPress={() => setModalDialog(false)}> Cancelar </Button>
                    </View>
                  </View>
                </View>
              </Modal>
            </Portal>   
          </>
        ) : (
          <View style={styles.centeredView}>
            <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
            <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
          </View>
        )}
      </View>
    </PaperProvider >
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  profileContainer: { alignItems: 'center', marginBottom: 18 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  badgesContainer: { flexDirection: 'row', marginBottom: 10 },
  settingsContainer: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 20 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  logOutItem: { color: '#DC3803' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: 320 },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  button: { borderRadius: 10, padding: 8, margin: 2, justifyContent: 'center', alignItems: 'center', width: '50%', height: 40 },
  modalText: { marginBottom: 15, fontWeight: 'bold', fontSize: 20 },
});

export default PerfilScreen;