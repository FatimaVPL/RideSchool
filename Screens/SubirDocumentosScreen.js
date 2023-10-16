import React from 'react';
import { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from 'react-native';
import {
    Text, ActivityIndicator, Button, MD2Colors,
} from 'react-native-paper';
import { firebase, db } from '../config-firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import ProgressBar from './ProgressBar';

/************************************************************* */
const SubirDocumentosScreen = ({ navigation }) => {
    const { colors } = useTheme()
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [permisos, setPermisos] = useState(null);
    const [imagen, setImagen] = useState(null);
    const [tipoDoc, setTipoDoc] = useState('licenciaImagen');
    const [progress, setProgress] = useState(0);
    /********************************************************** */

    const pickImage = async (tipo) => {
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
                [{ resize: { width: 400, height: 300 } }], 
                { compress: 1, format: SaveFormat.JPEG }
            )
            setImagen(manipulatedImage.uri)
                if (imagen) {
                    try {
                        const response = await fetch(imagen);
                        const blob = await response.blob();
                        const filename = imagen.substring(imagen.lastIndexOf('/') + 1)
                        const ref = firebase.storage().ref().child("documentos/" + filename);
                        ref.put(blob).on(
                            "state_changed",
                            (snapshot) => {
                              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                              setProgress(progress);
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
                        setProgress(0)
                    }
                }
            } else {
                Alert.alert("No hay imagen", "Por favor selecciona una imagen")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setProgress(0)
        }
    }

    /**********************************************************************/
    async function updatePhotoURL(imageURL) {
        const userRef = db.collection('users').doc(userData.email);
        const updateField = tipoDoc
        try {
            const docSnapshot = await userRef.get();

            if (docSnapshot.exists) {
                const updateObject = {};
                updateObject[updateField] = imageURL;
                await userRef.update(updateObject);
            }
        } catch (error) {
            console.log('Error al actualizar', error);
        }
    }

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

    const verImagen = (tipo) => {
        if (tipo === 'licenciaImagen') {
            if (userData && userData.licenciaImagen) {
                Linking.openURL(userData?.licenciaImagen)
                    .then(() => {
                        console.log('Enlace abierto correctamente en el navegador.');
                    })
                    .catch((err) => {
                        console.error('Error al abrir el enlace:', err);
                    });
            } else {
              Alert.alert("No hay imagen", "Sube tu imagen para poder visualizarla")
            }
        } else {
            if (userData && userData.tarjetaCirculacionImagen) {
                Linking.openURL(userData?.tarjetaCirculacionImagen)
                    .then(() => {
                        console.log('Enlace abierto correctamente en el navegador.');
                    })
                    .catch((err) => {
                        console.error('Error al abrir el enlace:', err);
                    });
            } else {
                Alert.alert("No hay imagen", "Sube tu imagen para poder visualizarla")
            }
        }
    }


    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {!isLoading ? (
                <>
                    <Text style={[styles.bienvenida, { color: colors.text }]} variant='headlineLarge'>Para tener más insignias, sube tu licencia o tarjeta de circulación (en imagen)</Text>
                    <View style={styles.container2}>
                        <TouchableOpacity style={styles.button} onPress={() => pickImage('licenciaImagen')}>
                            <Text style={[styles.buttonText, { color: colors.textButton }]}>Subir licencia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => pickImage('tarjetaCirculacionImagen')}>
                            <Text style={[styles.buttonText, { color: colors.textButton }]}>Subir tarjeta de circulación</Text>
                        </TouchableOpacity>
                      { imagen &&  <ProgressBar progress={progress}/> } 
                        <View>
                            <Button icon="camera" style={styles.buttonPhoto} mode="contained" buttonColor='gray' textColor={colors.text} onPress={() => verImagen('licenciaImagen')}>
                                Ver licencia
                            </Button>
                            <Button icon="camera" style={styles.buttonPhoto} mode="contained" buttonColor='gray' textColor={colors.text} onPress={() => verImagen('tarjetaCirculacionImagen')}>
                                Ver tarjeta de circulación
                            </Button>
                        </View>
                    </View>
                </>) : (
                <View style={styles.centeredView}>
                    <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
                    <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    container2: { alignItems: 'center', paddingTop: 50 },
    bienvenida: {
        textAlign: 'center',
        fontSize: 27,
        fontWeight: '900',
        marginBottom: 10,
        marginTop: '20%',
    },
    button: {
        width: 300,
        backgroundColor: 'green',
        padding: 10,
        marginTop: 20,
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
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textInfo: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 15,
        fontWeight: "500",
    },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
    buttonPhoto: {
        marginTop: 15,
    }
});

export default SubirDocumentosScreen;
