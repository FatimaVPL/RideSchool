import * as React from 'react';
import { Button, PaperProvider, TextInput, Modal, Portal, Text, HelperText } from 'react-native-paper';
import { View, SafeAreaView, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { useFormik, FormikProvider } from 'formik';
import SolicitarRide from './SolicitarRide';
import { firebase, db } from '../config-firebase';
import { useAuth } from '../context/AuthContext';
import { GeoFirestore } from 'geofirestore';
import { useTheme } from "../hooks/ThemeContext";

const FrmSolicitarRide = () => {

    const { colors } = useTheme()

    const validate = values => {
        const errors = {};
        if (!values.personas) {
            errors.personas = 'Especifique cuántas personas van';
        } else if (values.personas < 1) {
            errors.personas = 'Debe ser mayor a 0';
        } else if (values.personas > 4) {
            errors.personas = 'Debe ser menor a 4';
        }
        if (!values.origin && !values.destination) {
            errors.origin = 'Especifique el origen y destino';
        }

        return errors;
    };

    //const db = firebase.firestore();
    const { user } = useAuth();

    async function saveRideToFirestore(rideData) {
        const { origin, destination, date, directionOrigin, directionDestination, ...rest } = rideData;
        const geoFirestore = new GeoFirestore(db);

        // Crear una nueva referencia con un ID único
        const docRef = db.collection('rides').doc();

        // Convertir las coordenadas a GeoPoint
        const originGeoPoint = new firebase.firestore.GeoPoint(origin.latitude, origin.longitude);
        const destinationGeoPoint = new firebase.firestore.GeoPoint(destination.latitude, destination.longitude);

        // Datos para el nuevo documento
        const newData = {
            id: docRef.id,
            coordinates: originGeoPoint,
            pasajeroID: { reference: db.collection('users').doc(user.email), uid: user.uid }, // Aquí guardamos el ID del documento dentro del objeto
            origin: { coordinates: originGeoPoint, direction: directionOrigin },
            destination: { coordinates: destinationGeoPoint, direction: directionDestination },
            date: date === null ? new Date() : date,
            estado: "pendiente",
            ...rest
        };

        // Crea un nuevo documento en la colección de GeoFirestore
        geoFirestore.collection('rides').doc(docRef.id).set(newData)
            .then(() => {
                console.log(`Nuevo documento creado en GeoFirestore con ID: ${docRef.id}`);
                setSuccessModalVisible(true); // Mostrar modal de éxito
            })
            .catch((error) => {
                console.error('Error al crear un nuevo documento en GeoFirestore:', error);
            });
    }

    /* Formik */
    const formik = useFormik({
        validate,
        initialValues: {
            personas: '1',
            date: null,
            origin: null,
            destination: null,
            comentarios: null,
            directionOrigin: null,
            directionDestination: null,
            informationRoute: null
        },
        onSubmit: values => {
            saveRideToFirestore(values)
                .then(documentId => {
                    //console.log(`Document written with ID: ${documentId}`);
                })
                .catch(error => {
                    console.error(`Error adding document: ${error}`);
                });
        }
    });

    /* Modal aceptar */
    const [successModalVisible, setSuccessModalVisible] = React.useState(false);

    /* Modal puntos */
    const [visible, setVisible] = React.useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    /* Date picker */
    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
    const [rightNow, setRightNow] = React.useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        formik.setFieldValue('date', date);
        hideDatePicker();
        setRightNow(true);
    };
    const handleCancel = () => {
        setRightNow(false);
        formik.setFieldValue('date', null);
        hideDatePicker();
    };

    return (
        <PaperProvider>
            <FormikProvider value={formik}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.button1}>
                        <Button
                            icon="clock" mode="contained" buttonColor='#D6A50C' textColor='white' onPress={() => showDatePicker()}>
                            Fecha y hora del ride
                        </Button>
                    </View>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="datetime"
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        color
                    />

                    <Text style={{ color: colors.text, fontSize: 20 }}>{rightNow ? format(formik.values?.date, 'Pp') : "Justo ahora"}</Text>

                    <View style={styles.button1}>
                        <Button
                            icon="map" mode="contained" onPress={showModal} buttonColor='#D6A50C' textColor='white'>
                            ¿A dónde te diriges?
                        </Button>
                    </View>

                    {formik.errors.origin || formik.errors.destination ? (<HelperText type="error" visible={true}>{formik.errors.origin}</HelperText>) : null}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                        <Text style={{ color: 'green', fontSize: 20 }}>{formik.values?.origin && formik.values?.destination && "Ubicación cargada"}</Text>
                    </View>

                    <Portal>
                        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{ flex: 1, flexDirection: 'column' }}>

                            <SafeAreaView style={{ flex: 1 }}>
                                <SolicitarRide formikk={formik} />
                            </SafeAreaView>
                            <View style={{ padding: 10, justifyContent: 'space-between', backgroundColor: 'white' }}>
                                <View style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '90%',
                                    height: 50,
                                    backgroundColor: 'green',
                                    borderRadius: 10,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 3,
                                    },
                                    shadowOpacity: 0.27,
                                    shadowRadius: 4.65,
                                    elevation: 6,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Button icon="cancel" mode="contained" onPress={() => { hideModal(); formik.setFieldValue('origin', null); formik.setFieldValue('destination', null); }} buttonColor='red'>
                                        Cancelar
                                    </Button>
                                </View>
                                {
                                    formik.values.origin && formik.values.destination &&
                                    <View style={{}}>
                                        <Button icon="check" mode="contained" onPress={hideModal} buttonColor='green'>
                                            Aceptar
                                        </Button>
                                    </View>
                                }

                            </View>
                        </Modal>
                    </Portal>

                    <TextInput
                        style={{ margin: 7, height: 50, width: 350 }}
                        mode="outlined"
                        label="¿Cuántas personas van?"
                        value={formik.values.personas}
                        onChangeText={formik.handleChange('personas')}
                        keyboardType='numeric'
                        theme={{ colors: { text: 'green', primary: 'green' } }}
                    />
                    {formik.errors.personas ? (<HelperText type="error" visible={true}>{formik.errors.personas}</HelperText>) : null}


                    <TextInput
                        style={{ margin: 7, height: 100, width: 350 }}
                        mode="outlined"
                        label="Comentarios"
                        value={formik.values.comentarios}
                        onChangeText={formik.handleChange('comentarios')}
                        keyboardType='default'
                        theme={{ colors: { text: 'green', primary: 'green' } }}
                        multiline={true}
                        numberOfLines={4}
                    />
                    <View style={styles.button}>
                        <Button
                            icon="car" mode="contained" textColor='white' buttonColor='green' onPress={formik.handleSubmit}>
                            Solicitar Ride
                        </Button>
                    </View>
                </View>
            </FormikProvider>

            <Portal>
                <Modal visible={successModalVisible} onDismiss={() => setSuccessModalVisible(false)} contentContainerStyle={{ padding: 20, backgroundColor: colors.background3, width: '100%' }}>
                    <Text style={{ fontSize: 20, color: '#171717' }}>¡Solicitud enviada con éxito!</Text>
                    <Text style={{ marginTop: 10, color: '#171717' }}>Espera las ofertas de ride y acepta la que sea más de tu agrado.</Text>
                    <Button style={styles.button} textColor='white' mode="contained" onPress={() => { setSuccessModalVisible(false) }}>Entendido</Button>
                </Modal>
            </Portal>

        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        marginTop: 30,
        width: 300,
        height: 50,
        backgroundColor: 'green',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button1: {
        margin: 5,
        width: 300,
        height: 50,
        backgroundColor: '#D6A50C',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputs: {
        borderRadius: 8,
    }
});

export default FrmSolicitarRide;