import * as React from 'react';
import { Button, PaperProvider, TextInput, Modal, Portal, Text, HelperText } from 'react-native-paper';
import { View, SafeAreaView, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { useFormik, FormikProvider } from 'formik';
import CargarRuta from './components/CargarRuta';
import { firebase, db } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { GeoFirestore } from 'geofirestore';
import { getDriverUsers } from '../GestionarScreens/others/Queries';
import Lottie from 'lottie-react-native';
import { useTheme } from '../../hooks/ThemeContext';
import ModalDialog from '../GestionarScreens/components/ModalDialog';
import { ScrollView } from 'react-native-gesture-handler';
import { useNotificationContext } from '../../context/NotificationsContext';

const FrmSolicitarRide = ({ navigation }) => {

    const { colors } = useTheme();
    const {sendPushNotification} = useNotificationContext()

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
    const { user, dataUser } = useAuth();
    //console.log(dataUser.token)

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
            pasajeroID: { reference: db.collection('users').doc(user.email), uid: user.uid, token: dataUser?.token }, // Aquí guardamos el ID del documento dentro del objeto
            origin: { coordinates: originGeoPoint, direction: directionOrigin },
            destination: { coordinates: destinationGeoPoint, direction: directionDestination },
            date: date === null ? new Date() : date,
            estado: "pendiente",
            ...rest
        };

        // Crea un nuevo documento en la colección de GeoFirestore
        geoFirestore.collection('rides').doc(docRef.id).set(newData)
            .then(() => {
                //console.log(`Nuevo documento creado en GeoFirestore con ID: ${docRef.id}`);
            })
            .catch((error) => {
                console.error('Error al crear un nuevo documento en GeoFirestore:', error);
            });
    }
    const initObject = {
        personas: '1',
        date: null,
        origin: null,
        destination: null,
        comentarios: null,
        directionOrigin: null,
        directionDestination: null,
        informationRoute: null
    }
    /* Formik */
    const formik = useFormik({
        validate,
        initialValues: initObject,
        onSubmit: (values) => {
            saveRideToFirestore(values)
                .then(documentId => {
                    //console.log(`Document written with ID: ${documentId}`);
                    setModalDialog(true);
                    formik.resetForm();
                    getDriverUsers(sendPushNotification);
                })
                .catch(error => {
                    console.error(`Error adding document: ${error}`);
                });
        }
    });

    /* Modal aceptar */
    const [modalDialog, setModalDialog] = React.useState(false);

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

                <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

                    <Text
                        style={{
                            fontSize: 26,
                            fontWeight: 'bold',
                            color: colors.text,
                            marginBottom: 20,
                            marginTop: 40,
                            textAlign: 'center'
                        }}>
                        Completa la información {'\n'} y solicita tu ride
                    </Text>

                    <View style={{
                        height: 160,
                        width: '100%',
                        marginBottom: 35,
                    }}>
                        <Lottie source={require('../../assets/LottieFiles/passagerOrCar.json')} />
                    </View>

                    {/* <View style={{ flexDirection: 'column', width: '100%', marginBottom: 10, alignItems: 'center' }}>
                        <Button
                            style={{ width: '100%' }}
                            icon="clock" mode="contained"
                            buttonColor='#D6A50C' textColor='white'
                            onPress={() => showDatePicker()}
                            labelStyle={{ fontSize: 17 }}>
                            Fecha y hora del ride
                        </Button>
                        <Text style={{ color: colors.textRide, fontSize: 18, fontWeight: 'bold' }}>{rightNow ? format(formik.values?.date, 'Pp') : "Justo ahora"}</Text>
                    </View> */}

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="datetime"
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />

                    <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center', marginBottom: 5 }}>
                        <Button
                            style={{ width: '100%', height: 42 }}
                            icon="map" mode="contained"
                            onPress={showModal}
                            buttonColor='#D6A50C'
                            textColor='white'
                            labelStyle={{ fontSize: 17 }}>
                            ¿A dónde te diriges?
                        </Button>

                        {formik.errors.origin || formik.errors.destination ? (<HelperText type="error" visible={true}>{formik.errors.origin}</HelperText>) : null}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                            <Text style={{ color: colors.textRide, fontSize: 18, fontWeight: 'bold' }}>{formik.values?.origin && formik.values?.destination && formik.values?.directionDestination}</Text>
                        </View>
                    </View>

                    <Portal>
                        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{ flex: 1, flexDirection: 'column' }}>

                            <SafeAreaView style={{ flex: 1 }}>
                                <CargarRuta formikk={formik} />
                            </SafeAreaView>
                            <View style={{
                                padding: 10,
                                justifyContent: 'space-between',
                                backgroundColor: colors.background2,
                                flexDirection: 'row',
                            }}>
                                <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Button
                                        style={{ width: '48%', height: 40 }}
                                        icon="cancel"
                                        mode="contained"
                                        onPress={() => {
                                            hideModal(); formik.setFieldValue('origin', null);
                                            formik.setFieldValue('destination', null);
                                        }}
                                        buttonColor='red'
                                        labelStyle={{ color: 'white', fontWeight: 'bold' }}>
                                        Cancelar
                                    </Button>

                                    {
                                        formik.values.origin && formik.values.destination &&
                                        <Button
                                            style={{ width: '48%', height: 40 }}
                                            icon="check"
                                            mode="contained"
                                            onPress={hideModal}
                                            buttonColor='green'
                                            labelStyle={{ color: 'white', fontWeight: 'bold' }}>
                                            Aceptar
                                        </Button>
                                    }
                                </View>
                            </View>
                        </Modal>
                    </Portal>

                    <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                        <TextInput
                            style={{ margin: 7, height: 50, width: '100%' }}
                            mode="outlined"
                            label="¿Cuántas personas van?"
                            value={formik.values.personas}
                            onChangeText={formik.handleChange('personas')}
                            keyboardType='numeric'
                            theme={{ colors: { text: 'green', primary: 'green' } }}
                            placeholderTextColor={colors.text}
                        />
                        {formik.errors.personas ? (<HelperText type="error" visible={true}>{formik.errors.personas}</HelperText>) : null}
                    </View>

                    <View style={{ flexDirection: 'column', width: '100%', marginBottom: 20, alignItems: 'center' }}>

                        <TextInput
                            style={{ margin: 7, height: 100, width: '100%' }}
                            mode="outlined"
                            label="Comentarios"
                            value={formik.values.comentarios}
                            onChangeText={formik.handleChange('comentarios')}
                            keyboardType='default'
                            theme={{ colors: { text: 'green', primary: 'green' } }}
                            multiline={true}
                            numberOfLines={4}
                            placeholderTextColor={colors.text}
                            placeholder="Deja un comentario que ayude al conductor a identificarte"
                        />
                    </View>
                    <Button
                        style={{ width: '100%', height: 45 }}
                        icon="car" mode="contained"
                        textColor='white'
                        buttonColor='green'
                        onPress={formik.handleSubmit}
                        labelStyle={{ fontSize: 17, textAlign: 'center', textAlignVertical: 'center' }}>
                        Solicitar Ride
                    </Button>

                </ScrollView>
            </FormikProvider>

            {modalDialog && (
                <ModalDialog
                    icon={'checkmark-circle-outline'}
                    color={'#A9CA6D'}
                    title={'¡Solicitud enviada con éxito!'}
                    navigation={navigation}
                    screen={'Mis Rides'}
                    modalDialog={modalDialog}
                    setModalDialog={setModalDialog}
                />
            )}

        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        // justifyContent: 'start',
        // alignItems: 'center',
        paddingHorizontal: 20,
    },
})

export default FrmSolicitarRide;