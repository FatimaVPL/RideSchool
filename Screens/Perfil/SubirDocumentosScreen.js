import React from 'react';
import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, ActivityIndicator, Button, MD2Colors } from 'react-native-paper';
import { db, firebase } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearProgress } from 'react-native-elements';

/************************************************************* */
const SubirDocumentosScreen = ({ navigation }) => {
    const { colors } = useTheme()
    const { dataUser } = useAuth();
    //const [permisos, setPermisos] = useState(null);
    //const [tipoDoc, setTipoDoc] = useState('');
    const [progress, setProgress] = useState(0);
    const [showProgressBar, setShowProgressBar] = useState(false)

    /********************************************************** */
    const pickImage = async (tipo) => {
        //setTipoDoc(tipo)
        try {
            const galeriaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (galeriaStatus.status === 'granted') {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                })
                if (!result.canceled) {
                    const originalImageUri = result.assets[0].uri;
                    const manipulatedImage = await manipulateAsync(
                        originalImageUri,
                        [{ resize: { width: 400, height: 300 } }],
                        { compress: 1, format: SaveFormat.JPEG }
                    )
                    const manipulatedImageUri = manipulatedImage.uri

                    try {
                        const response = await fetch(manipulatedImageUri)
                        const blob = await response.blob()
                        const filename = manipulatedImageUri.substring(manipulatedImageUri.lastIndexOf('/') + 1)
                        const ref = firebase.storage().ref().child("documentos/" + filename)

                        ref.put(blob).on(
                            "state_changed",
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                setProgress(progress)
                            },
                            (error) => {
                                console.error(error)
                                setProgress(0)
                            },
                            async () => {
                                const imageURL = await ref.getDownloadURL()
                                blob.close()
                                updatePhotoURL(imageURL, tipo)
                                Alert.alert("Imagen almacenada", "Se subió correctamente tu foto")
                                setProgress(0)
                            }
                        )
                    } catch (error) {
                        console.error(error);
                        setProgress(0);
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

    /**********************************************************************/
    async function updatePhotoURL(URL, tipo) {
        const userRef = db.collection('users').doc(dataUser.email);
        //const updateField = tipoDoc

        //let urlBorrar
        if (tipo === "tarjetaCirculacion") {
            //urlBorrar = dataUser.tarjetaCirculacion?.imageURL
            borrarFoto(dataUser.tarjetaCirculacion?.imageURL)
        } else {
            //urlBorrar = dataUser.licencia?.imageURL
            borrarFoto(dataUser.licencia?.imageURL)
        }
        //borrarFoto(urlBorrar)

        try {
            const docSnapshot = await userRef.get()

            if (docSnapshot.exists) {
                /* const updateObject = {};
                updateObject[updateField] = imageURL
                await userRef.update(updateObject) */
                userRef.update({
                    [tipo]: { imageURL: URL, validado: false }
                });
            }
        } catch (error) {
            console.log('Error al actualizar', error)
        }
    }

    /* *********************** Borrar foto de perfil anterior ************************** */
    const borrarFoto = async (previousPhotoURL) => {
        if (previousPhotoURL) {
            try {
                const previousImageRef = firebase.storage().refFromURL(previousPhotoURL);
                const imageExists = await previousImageRef.getDownloadURL().then(() => true).catch(() => false);

                if (imageExists) {
                    await previousImageRef.delete();
                } else {
                    console.warn("La imagen anterior no existe en Firebase Storage.");
                }
            } catch (error) {
                console.error("Error al eliminar la imagen anterior", error);
            }
        }
    }

    const verImagen = (tipo) => {
        if (tipo === 'licencia') {
            if (dataUser && dataUser.licencia?.imageURL) {
                Linking.openURL(dataUser.licencia?.imageURL)
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
            if (dataUser && dataUser.tarjetaCirculacion?.imageURL) {
                Linking.openURL(dataUser.tarjetaCirculacion?.imageURL)
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
            <Text style={[styles.bienvenida, { color: colors.text }]} variant='headlineLarge'>Para tener más insignias, sube tu licencia o tarjeta de circulación (en imagen)</Text>
            <View style={styles.container2}>
                <TouchableOpacity style={styles.button} onPress={() => pickImage('licencia')}>
                    <Text style={[styles.buttonText, { color: colors.textButton }]}>Subir licencia</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => pickImage('tarjetaCirculacion')}>
                    <Text style={[styles.buttonText, { color: colors.textButton }]}>Subir tarjeta de circulación</Text>
                </TouchableOpacity>
                {showProgressBar && <LinearProgress style={{ marginTop: 10 }} color='#1DBE99' />}
                <View>
                    <Button icon="camera" style={styles.buttonPhoto} mode="contained" buttonColor='gray' textColor={colors.text} onPress={() => verImagen('licencia')}>
                        Ver licencia
                    </Button>
                    <Button icon="camera" style={styles.buttonPhoto} mode="contained" buttonColor='gray' textColor={colors.text} onPress={() => verImagen('tarjetaCirculacion')}>
                        Ver tarjeta de circulación
                    </Button>
                </View>
            </View>
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
    },
});

export default SubirDocumentosScreen;