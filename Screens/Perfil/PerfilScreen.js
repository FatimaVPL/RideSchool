import React from 'react';
import { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, Divider, ActivityIndicator, MD2Colors, PaperProvider, Button } from 'react-native-paper';
import { firebase, db } from '../config-firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from "../hooks/ThemeContext";
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import ProgressBar from './ProgressBar';
import { subscribeToUsers } from '../firebaseSubscriptions';
import { getInfoMedal2 } from './GestionarScreens/others/Functions';
import ModalALert from './GestionarScreens/components/ModalAlert';
import ModalDialog from './GestionarScreens/components/ModalDialog';
import { Avatar, Icon, LinearProgress } from 'react-native-elements';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';

const PerfilScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [modalALert, setModalAlert] = useState(false);
  const [modalPropsALert, setModalPropsALert] = useState({});
  const [modalDialog, setModalDialog] = useState(false);
  const [modalPropsDialog, setModalPropsDialog] = useState({});
  const [showProgressBar, setShowProgressBar] = useState(false)

    const pickImage = async () => {
      try {
        const galeriaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (galeriaStatus.status === 'granted') {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          })
          if (!result.canceled) {
            setShowProgressBar(true)
            const originalImageUri = result.assets[0].uri;
            const manipulatedImage = await manipulateAsync(
              originalImageUri,
              [{ resize: { width: 200, height: 200 } }],
              { compress: 1, format: SaveFormat.JPEG }
            )
            const manipulatedImageUri = manipulatedImage.uri

            try {
              const response = await fetch(manipulatedImageUri)
              const blob = await response.blob()
              const filename = manipulatedImageUri.substring(manipulatedImageUri.lastIndexOf('/') + 1)
              const ref = firebase.storage().ref().child("avatars/" + filename)
              ref.put(blob).on(
                "state_changed",
                (snapshot) => {
                  //const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                  console.error(error)
                },
                async () => {
                  const imageURL = await ref.getDownloadURL()
                  blob.close()
                  updatePhotoURL(imageURL)
                  Alert.alert("Imagen almacenada", "Se subió correctamente tu foto")
                  setShowProgressBar(false)
                }
              )
            } catch (error) {
              console.error(error);
            }
          } else {
            Alert.alert("No hay imagen", "Por favor selecciona una imagen")
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setShowProgressBar(false)
      }
    }

    /* *********************** Borrar foto de perfil anterior ************************** */
    const borrarFoto = async (previousPhotoURL) => {
      if (previousPhotoURL) {
        try {
          const previousImageRef = firebase.storage().refFromURL(previousPhotoURL);
          const imageExists = await previousImageRef.getDownloadURL().then(() => true).catch(() => false)

          if (imageExists) {
            await previousImageRef.delete()
          } else {
            console.warn("La imagen anterior no existe en Firebase Storage.")
          }
        } catch (error) {
          console.error("Error al eliminar la imagen anterior", error)
        }
      }
    }

    /* *********************** Mofificar campo photoURL ******************************** */
    async function updatePhotoURL(imageURL) {
      const userRef = db.collection('users').doc(userData.email);

      try {
        const docSnapshot = await userRef.get();
        const urlBorrar = userData?.photoURL
        borrarFoto(urlBorrar)
        if (docSnapshot.exists) {
          await userRef.update({
            photoURL: imageURL,
          });
        }
      } catch (error) {
        console.log('Error al actualizar', error)
      }
    }

    /*************************** Ver imagen ************************ */
    const verImagen = () => {
      if (userData && userData.photoURL) {
        Linking.openURL(userData?.photoURL)
          .then(() => {
            console.log('Enlace abierto correctamente en el navegador.')
          })
          .catch((err) => {
            console.error('Error al abrir el enlace:', err)
          });
      } else {
        Alert.alert("No hay imagen", "Sube tu imagen para poder visualizarla")
      }
    }

    /*************************************************************** */
    useEffect(() => {
      const unsubscribe = subscribeToUsers(() => { getUser() });

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

  return (
    <PaperProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {!isLoading ? (
          <>
            <View style={[styles.profileContainer, { backgroundColor: colors.background }]}>
              <Avatar
                rounded
                onPress={() => verImagen()}
                size="xlarge"
                source={userData.photoURL ? { uri: userData.photoURL } : require('../assets/default.jpg')}
              />
             {showProgressBar && <ProgressBar progress={progress} />}
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
              <Button onPress={() => {
                let content = userData.role === "Conductor" ? "PASAJERO" : "CONDUCTOR";
                setModalPropsALert({
                  icon: 'retweet',
                  color: '#FFC300',
                  title: 'Cambiar la app a modo:',
                  content: content,
                  type: 5
                });
                setModalAlert(true);
              }}>
                Usar en modo {userData.role === "Conductor" ? "Pasajero" : "Conductor"}</Button>
            </View>
            {/* INSIGNIAS */}
            <View style={{ borderRadius: 12, borderWidth: 2, borderColor: '#45B39D', padding: 15, marginBottom: 10 }}>
              <Text variant='titleLarge' style={{ textAlign: 'center', marginBottom: 10 }}>Insignias</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {userData.role === "Conductor" && (
                  <>
                    {userData.licencia?.validado && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="card-account-details-star" style={{ fontSize: 38, color: colors.icon }} />
                        <Text style={{ textAlign: 'center' }}>Licencia</Text>
                      </View>
                    )}
                    {userData.tarjetaCirculacion?.validado && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="credit-card-check" style={{ fontSize: 38, color: colors.icon }} />
                        <Text style={{ textAlign: 'center' }}>{"Tarjeta \n Circulación"}</Text>
                      </View>
                    )}
                    {getInfoMedal2(userData.numRidesConductor) !== false && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="medal" style={{ fontSize: 38 }} color={getInfoMedal2(userData.numRidesConductor).color} />
                        <Text style={{ textAlign: 'center' }}>{`Conductor \n ${getInfoMedal2(userData.numRidesConductor).text}`}</Text>
                      </View>
                    )}
                  </>
                )}
                {userData.role === "Pasajero" && (
                  <>
                    {getInfoMedal2(userData.numRidesPasajero) !== false && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="medal" style={{ fontSize: 38 }} color={getInfoMedal2(userData.numRidesPasajero).color} />
                        <Text style={{ textAlign: 'center' }}>{`Pasajero \n ${getInfoMedal2(userData.numRidesPasajero).text}`}</Text>
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
              {userData.role === "Conductor" && (
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
                  <Text variant='labelLarge' style={{  color:  "red"  }}>Cerrar sesión</Text>
                </View>
              </TouchableOpacity>
              <Divider />
            </View>

            {modalALert && (
              <ModalALert
                icon={modalPropsALert.icon}
                color={modalPropsALert.color}
                title={modalPropsALert.title}
                content={modalPropsALert.content}
                type={modalPropsALert.type}
                rol={userData.role}
                email={userData.email}
                conductor={userData.conductor}
                modalALert={modalALert}
                setModalAlert={setModalAlert}
                modalDialog={modalDialog}
                setModalDialog={setModalDialog}
                setModalPropsDialog={setModalPropsDialog}
              />
            )}

            {modalDialog && (
              <ModalDialog
                icon={modalPropsDialog.icon}
                color={modalPropsDialog.color}
                title={modalPropsDialog.title}
                type={modalPropsALert.type}
                modalDialog={modalDialog}
                setModalDialog={setModalDialog}
              />
            )}

          </>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 }}>
            <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
            <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
          </View>
        )}
      </View>
    </PaperProvider >

  )
}

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    profileContainer: { alignItems: 'center', marginBottom: 18 },
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    badgesContainer: { flexDirection: 'row', marginBottom: 10 },
    settingsContainer: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 20 },
    settingsItem: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  })

  export default PerfilScreen