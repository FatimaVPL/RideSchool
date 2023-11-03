import React from 'react';
import { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const { colors, isDark } = useTheme()
  const { dataUser, getDataUser, logoutUser } = useAuth();
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

  const SubirDocumentosScreen = () => {
    navigation.navigate('Subir documentos');
  }
  
  const CompletarInfoConductor = () => {
    navigation.navigate('Completar informacion conductor');
  }

  return (
    <PaperProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <View style={{ justifyContent: 'center' }}>
            <Avatar
              rounded
              onPress={() => verImagen()}
              size={125}
              source={dataUser.photoURL ? { uri: dataUser.photoURL } : require('../../assets/default.jpg')}
            >
              <Avatar.Accessory size={38} underlayColor="#696969" selectionColor="red" onPress={() => pickImage()} />
            </Avatar>
            {showProgressBar && <LinearProgress style={{ marginTop: 10 }} color='#1DBE99' />}
          </View>

          <View style={{ marginStart: 12, justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>{`${dataUser.firstName} \n${dataUser.lastName}`}</Text>
            <Text variant='bodySmall' style={{ textAlign: 'center' }}>{dataUser.email}</Text>

            {/* CALIFICACION GENERAL */}
            <View style={{ flexDirection: 'row', marginTop: 10, alignSelf: 'center' }}>
              {Array.from({ length: dataUser.role === "Pasajero" ? dataUser.califPasajero.promedio : dataUser.califConductor.promedio }).map((_, index) => (
                <Ionicons key={index} name="star" style={{ marginRight: 6, fontSize: 22, color: "#FFC107" }} />
              ))}
              {Array.from({ length: 5 - (dataUser.role === "Pasajero" ? dataUser.califPasajero.promedio: dataUser.califConductor.promedio) }).map((_, index) => (
                <Ionicons key={index} name="star" style={{ marginRight: 6, fontSize: 22, color: "#8C8A82" }} />
              ))}
            </View>

            <Button /* icon="repeat" */ mode="contained" buttonColor='gray' style={{ width: '75%', alignSelf: 'center', marginTop: 10 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 15, color: 'white' }}
              onPress={() => {
                let content = dataUser.role === "Conductor" ? "PASAJERO" : "CONDUCTOR";
                setModalPropsALert({
                  icon: 'retweet',
                  color: '#FFC300',
                  title: 'Cambiar la app a modo:',
                  content: content,
                  type: 5
                });
                setModalAlert(true);
              }}>{dataUser.role === "Conductor" ? "Conductor" : "Pasajero"}</Button>
          </View>
        </View>
        <Divider style={{ backgroundColor: colors.divider }} />

        {/* INSIGNIAS */}
        <View style={{ margin: 10, marginTop: 20 }}>
          <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10, marginTop: 10 }}>Mis Insignias</Text>

          {dataUser.role === "Conductor" && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '30%', height: 102, justifyContent: 'space-between' }}>
                <Image source={isDark ? require('../../assets/Insignias/candado-white.png') : require('../../assets/Insignias/candado-black.png')} style={styles.lockIcon} />
                <View style={{ backgroundColor: '#e2e8f0', opacity: getInfoMedal2(dataUser.numRidesConductor).opacity, borderRadius: 10, justifyContent: 'center' }}>
                  <Image source={getInfoMedal2(dataUser.numRidesConductor).uri} style={{ width: '60%', height: '60%', alignSelf: 'center', opacity: getInfoMedal2(dataUser.numRidesConductor).opacity }} />
                  <Text style={{ textAlign: 'center', fontSize: 15, color: 'black', opacity: getInfoMedal2(dataUser.numRidesConductor).opacity }}>Conductor {'\n'}{getInfoMedal2(dataUser.numRidesConductor).text}</Text>
                </View>
              </View>

              <View style={{ width: '30%', height: 102, justifyContent: 'space-between' }}>
                <Image source={isDark ? require('../../assets/Insignias/candado-white.png') : require('../../assets/Insignias/candado-black.png')} style={styles.lockIcon} />
                <View style={{ backgroundColor: '#e2e8f0', opacity: dataUser.licencia.validado ? 1 : 0.4, borderRadius: 10, justifyContent: 'center' }}>
                  <Image source={require('../../assets/Insignias/licencia-de-conducir.png')} style={{ width: '60%', height: '60%', alignSelf: 'center', opacity: dataUser.licencia.validado ? 1 : 0.4 }} />
                  <Text style={{ textAlign: 'center', fontSize: 15, color: 'black', opacity: dataUser.licencia.validado ? 1 : 0.4, }}>Licencia {'\n'}Conducir</Text>
                </View>
              </View>

              <View style={{ width: '30%', height: 102, justifyContent: 'space-between' }}>
                <Image source={isDark ? require('../../assets/Insignias/candado-white.png') : require('../../assets/Insignias/candado-black.png')} style={styles.lockIcon} />
                <View style={{ backgroundColor: '#e2e8f0', opacity: dataUser.tarjetaCirculacion.validado ? 1 : 0.4, borderRadius: 10, justifyContent: 'center' }}>
                  <Image source={require('../../assets/Insignias/tarjeta-circulacion.png')} style={{ width: '60%', height: '60%', alignSelf: 'center', opacity: dataUser.tarjetaCirculacion.validado ? 1 : 0.4 }} />
                  <Text style={{ textAlign: 'center', fontSize: 15, color: 'black', opacity: dataUser.tarjetaCirculacion.validado ? 1 : 0.4 }}>Tarjeta {'\n'}Circulación</Text>
                </View>
              </View>
            </View>
          )}

          {dataUser.role === "Pasajero" && (
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ width: '30%', height: 102, justifyContent: 'center' }}>
                <Image source={isDark ? require('../../assets/Insignias/candado-white.png') : require('../../assets/Insignias/candado-black.png')} style={styles.lockIcon} />
                <View style={{ backgroundColor: '#e2e8f0', opacity: getInfoMedal2(dataUser.numRidesPasajero).opacity, borderRadius: 10, justifyContent: 'center' }}>
                  <Image source={getInfoMedal2(dataUser.numRidesPasajero).uri} style={{ width: '60%', height: '60%', alignSelf: 'center', opacity: getInfoMedal2(dataUser.numRidesPasajero).opacity }} />
                  <Text style={{ textAlign: 'center', fontSize: 15, color: 'black', opacity: getInfoMedal2(dataUser.numRidesPasajero).opacity }}>Pasajero {'\n'}{getInfoMedal2(dataUser.numRidesPasajero).text}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{marginTop: 40}}>
          <Divider style={{ backgroundColor: colors.divider }} />
          <TouchableOpacity onPress={() => {
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
            <View style={styles.settingsItem}>
              <Ionicons name="repeat" size={25} color={colors.iconTab} style={{ marginRight: 5 }} />
              <Text variant='titleMedium'>Cambiar a modo {dataUser.role === "Conductor" ? "pasajero" : "conductor"}</Text>
            </View>
          </TouchableOpacity>

          {dataUser.role === "Conductor" && (
            <TouchableOpacity onPress={SubirDocumentosScreen}>
              <View style={styles.settingsItem}>
                <Ionicons name="image" size={25} color={colors.iconTab} style={{ marginRight: 5 }} />
                <Text variant='titleMedium'>Subir licencia/tarjeta de circulación</Text>
              </View>
            </TouchableOpacity>
          )}

          {dataUser.role === "Pasajero" && dataUser.conductor === false && (
            <TouchableOpacity onPress={CompletarInfoConductor}>
              <View style={styles.settingsItem}>
                <Ionicons name="car" size={25} color={colors.iconTab} style={{ marginRight: 5 }} />
                <Text variant='titleMedium'>¿Quieres ser conductor?</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={logoutUser}>
            <View style={styles.settingsItem}>
              <Ionicons name="log-out" size={25} color="#DC3803" style={{ marginRight: 5 }} />
              <Text variant='titleMedium' style={{ color: "red" }}>Cerrar sesión</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.infoPerfil, borderRadius: 20 }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'green', textAlign: 'center', color: colors.cardText }}>¿Tienes alguna duda?</Text>
            <View style={{margin: 5, marginTop: 10}}>
                <Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>Escribenos al correo:</Text>
                <Text style={{ color: colors.linkText, fontSize: 18, fontWeight: 'bold', textAlign: 'center'  }}>rideschool8@gmail.com</Text>
            </View>
        </View>
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
  badgesContainer: { flexDirection: 'row', marginBottom: 10, alignSelf: 'center' },
  settingsContainer: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 20 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  lockIcon: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: '62%',
    height: '62%',
  },
})

export default PerfilScreen