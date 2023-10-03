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
import Ionicons from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
    modalView: { margin: 15, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320 },
    modalText: { marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' }
});

const FrmSolicitarRide = ({ navigation }) => {
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
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View style={{ flexDirection: 'column', width: "100%", marginTop: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Button style={{ flex: 1, margin: 5, height: 45, justifyContent: 'center' }}
                                icon="clock" mode="contained" buttonColor="gray" contentStyle={{ alignSelf: 'center' }} labelStyle={{ fontSize: 18 }} onPress={() => showDatePicker()}>
                                Fecha y hora del ride
                            </Button>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="datetime"
                                onConfirm={handleConfirm}
                                onCancel={handleCancel}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                            <Text style={{ color: 'green', fontSize: 20 }}>{rightNow ? format(formik.values?.date, 'Pp') : "Justo ahora"}</Text>
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <Button style={{ margin: 5, height: 45, justifyContent: 'center' }}
                                icon="map" mode="contained" buttonColor="gray" contentStyle={{ alignSelf: 'center' }} labelStyle={{ fontSize: 18 }} onPress={showModal}>
                                ¿A dónde te diriges?
                            </Button>
                            {formik.errors.origin || formik.errors.destination ? (<HelperText type="error" visible={true}>{formik.errors.origin}</HelperText>) : null}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                                <Text style={{ color: 'green', fontSize: 20 }}>{formik.values?.origin && formik.values?.destination && "Ubicación cargada"}</Text>
                            </View>
                        </View>

                        <Portal>
                            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{ flex: 1, flexDirection: 'column' }}>
                                <SafeAreaView style={{ flex: 1 }}>
                                    <SolicitarRide formikk={formik} />
                                </SafeAreaView>
                                <View style={{ flexDirection: 'row', padding: 10, justifyContent: 'space-between', backgroundColor: 'white' }}>
                                    <View style={{}}>
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

                        <View style={{ flexDirection: 'column' }}>
                            <TextInput
                                style={{ margin: 7, height: 50 }}
                                mode="outlined"
                                label="¿Cuántas personas van?"
                                value={formik.values.personas}
                                onChangeText={formik.handleChange('personas')}
                                keyboardType='numeric'
                                theme={{ colors: { text: 'green', primary: 'green' } }}
                            />
                            {formik.errors.personas ? (<HelperText type="error" visible={true}>{formik.errors.personas}</HelperText>) : null}
                        </View>

                        <View style={{ flexDirection: 'column' }}>
                            <TextInput
                                style={{ margin: 7, height: 100 }}
                                mode="outlined"
                                label="Comentarios"
                                value={formik.values.comentarios}
                                onChangeText={formik.handleChange('comentarios')}
                                keyboardType='default'
                                theme={{ colors: { text: 'green', primary: 'green' } }}
                                multiline={true}   // habilita múltiples líneas
                                numberOfLines={4}  // muestra 4 líneas antes de desplazarse
                            />
                        </View>
                    </View>

                    <View style={{ width: "75%" }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Button style={{ flex: 1, margin: 5, height: 45, justifyContent: 'center' }}
                                icon="car" mode="contained" buttonColor="#479B3B" 
                                contentStyle={{ alignSelf: 'center' }} labelStyle={{ fontSize: 18 }} onPress={formik.handleSubmit}>
                                Solicitar Ride
                            </Button>
                        </View>
                    </View>

                </View>
            </FormikProvider>

            <Portal>
                <Modal visible={successModalVisible} onDismiss={() => setSuccessModalVisible(false)} contentContainerStyle={{ flex: 1 }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#81BC12" }}></Ionicons>
                                <Text style={[styles.modalText, { fontSize: 18 }]}>SOLICITUD ENVIADA</Text>
                                <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>Espera las ofertas de ride y acepta la que sea más de tu agrado</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Button mode="contained" buttonColor='#B0B0B0' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                    onPress={() => navigation.navigate('GestionarRides')}> Ver Rides </Button>
                                <Button mode="contained" buttonColor='#B2D474' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                    onPress={() => { setSuccessModalVisible(false) }} > Ok </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Portal>

        </PaperProvider>
    );
};

export default FrmSolicitarRide;