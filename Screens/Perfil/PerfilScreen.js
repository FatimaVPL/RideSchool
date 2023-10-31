import React from 'react';
import { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Divider, PaperProvider, Button } from 'react-native-paper';
import { db, firebase } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from "../../hooks/ThemeContext";
import { getInfoMedal2 } from '../GestionarScreens/others/Functions';
import ModalALert from '../GestionarScreens/components/ModalAlert';
import ModalDialog from '../GestionarScreens/components/ModalDialog';
import { Avatar, LinearProgress } from 'react-native-elements';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { subscribeToUsers } from '../../firebaseSubscriptions';
import * as ImagePicker from 'expo-image-picker';

const PerfilScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { dataUser, getDataUser } = useAuth();
  //const [isLoading, setIsLoading] = useState(true);
  //const [userData, setUserData] = useState(null);
  const [modalALert, setModalAlert] = useState(false);
  const [modalPropsALert, setModalPropsALert] = useState({});
  const [modalDialog, setModalDialog] = useState(false);
  const [modalPropsDialog, setModalPropsDialog] = useState({});
  const [showProgressBar, setShowProgressBar] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUsers(() => { getDataUser(dataUser.email) });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
    const userRef = db.collection('users').doc(dataUser.email);

    try {
      const docSnapshot = await userRef.get();
      const urlBorrar = dataUser?.photoURL
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
    if (dataUser && dataUser.photoURL) {
      Linking.openURL(dataUser?.photoURL)
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
  const CompletarInfoConductor = () => {
    navigation.navigate('Completar informacion conductor');
  }

  return (
    <PaperProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.profileContainer, { backgroundColor: colors.background }]}>
              <Avatar
                rounded
                onPress={() => verImagen()}
                size="xlarge"
                source={dataUser.photoURL ? { uri: dataUser.photoURL } : require('../../assets/default.jpg')}
              >
                <Avatar.Accessory size={38} underlayColor="#696969" selectionColor="red" onPress={() => pickImage()} />
              </Avatar>
              {showProgressBar && <LinearProgress style={{ marginTop: 10 }} color='#1DBE99' />}
              <Text variant='headlineSmall'>{`${dataUser.firstName} ${dataUser.lastName}`}</Text>
              <Text variant='titleMedium'>{dataUser.email}</Text>

              {/* CALIFICACION GENERAL */}
              <View style={[styles.badgesContainer, {marginTop: 5}]}>
                {Array.from({ length: dataUser.role === "Pasajero" ? dataUser.califPasajero : dataUser.califConductor }).map((_, index) => (
                  <Ionicons key={index} name="star" size={24} color="#FFC107" style={{marginRight: 5}}/>
                ))}
                {Array.from({ length: 5 - (dataUser.role === "Pasajero" ? dataUser.califPasajero : dataUser.califConductor) }).map((_, index) => (
                  <Ionicons key={index} name="star" size={24} color="#8C8A82" style={{marginRight: 5}}/>
                ))}
              </View>
              
              <Text variant='titleMedium'>{dataUser.role}</Text>
              <Button onPress={() => {
                let content = dataUser.role === "Conductor" ? "PASAJERO" : "CONDUCTOR";
                setModalPropsALert({
                  icon: 'retweet',
                  color: '#FFC300',
                  title: 'Cambiar la app a modo:',
                  content: content,
                  type: 5
                });
                setModalAlert(true);
              }}>
                Usar en modo {dataUser.role === "Conductor" ? "Pasajero" : "Conductor"}</Button>
            </View>
            {/* INSIGNIAS */}
            <View style={{ borderRadius: 12, borderWidth: 2, borderColor: '#45B39D', padding: 15, marginBottom: 10 }}>
              <Text variant='titleLarge' style={{ textAlign: 'center', marginBottom: 10 }}>Insignias</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {dataUser.role === "Conductor" && (
                  <>
                    {dataUser.licencia?.validado && (
                      <View style={{alignItems: 'center' }}>
                        <MaterialCommunityIcons name="card-account-details-star" style={{ fontSize: 38, color: colors.icon }} />
                        <Text style={{ textAlign: 'center' }}>Licencia</Text>
                      </View>
                    )}
                    {dataUser.tarjetaCirculacion?.validado && (
                      <View style={{alignItems: 'center' }}>
                        <MaterialCommunityIcons name="credit-card-check" style={{ fontSize: 38, color: colors.icon }} />
                        <Text style={{ textAlign: 'center' }}>{"Tarjeta \n Circulación"}</Text>
                      </View>
                    )}
                    {getInfoMedal2(dataUser.numRidesConductor) !== false && (
                      <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name="medal" style={{ fontSize: 38 }} color={getInfoMedal2(dataUser.numRidesConductor).color} />
                        <Text style={{ textAlign: 'center' }}>{`Conductor \n ${getInfoMedal2(dataUser.numRidesConductor).text}`}</Text>
                      </View>
                    )}
                  </>
                )}
                {dataUser.role === "Pasajero" && (
                  <>
                    {getInfoMedal2(dataUser.numRidesPasajero) !== false && (
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="medal" style={{ fontSize: 38 }} color={getInfoMedal2(dataUser.numRidesPasajero).color} />
                        <Text style={{ textAlign: 'center' }}>{`Pasajero \n ${getInfoMedal2(dataUser.numRidesPasajero).text}`}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>

        
        <View style={styles.settingsContainer}>
          <Text variant='headlineMedium'>Configuraciones</Text>
          {/* <TouchableOpacity onPress={notificaciones}>
                <View style={styles.settingsItem}>
                  <MaterialIcons name="notifications" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
                  <Text variant='labelLarge'>Notificaciones</Text>
                </View>
              </TouchableOpacity> */}
          <TouchableOpacity onPress={ajustesGenerales}>
            <View style={styles.settingsItem}>
              <Ionicons name="settings" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
              <Text variant='labelLarge'>Ajustes generales</Text>
            </View>
          </TouchableOpacity>
          {dataUser.role === "Conductor" && (
            <TouchableOpacity onPress={SubirDocumentosScreen}>
              <View style={styles.settingsItem}>
                <Ionicons name="image" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
                <Text variant='labelLarge'>Subir licencia/tarjeta de circulación</Text>
              </View>
            </TouchableOpacity>
          )}
          {dataUser.role === "Pasajero" && dataUser.conductor === false && (
            <TouchableOpacity onPress={CompletarInfoConductor}>
              <View style={styles.settingsItem}>
                <Ionicons name="car" size={24} color={colors.iconTab} style={{ marginRight: 5 }} />
                <Text variant='labelLarge'>¿Quieres ser conductor?</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.settingsItem}>
              <Ionicons name="log-out" size={24} color="#DC3803" style={{ marginRight: 5 }} />
              <Text variant='labelLarge' style={{ color: "red" }}>Cerrar sesión</Text>
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
            rol={dataUser.role}
            email={dataUser.email}
            conductor={dataUser.conductor}
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