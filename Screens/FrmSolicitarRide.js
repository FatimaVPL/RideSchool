import * as React from 'react';
import { Button, PaperProvider, TextInput, Modal, Portal, Text, HelperText } from 'react-native-paper';
import { View, SafeAreaView } from "react-native";
import GoogleMapOD from './GoogleMapOD';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { useFormik, FormikProvider } from 'formik';
import SolicitarRide from './SolicitarRide';
import { firebase } from '../config-firebase';

const FrmSolicitarRide = () => {
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
    const db = firebase.firestore();

    async function saveRideToFirestore(rideData) {
        const { origin, destination, date,...rest } = rideData;

        // Convertir las coordenadas a GeoPoint
        const originGeoPoint = new firebase.firestore.GeoPoint(origin.latitude, origin.longitude);
        const destinationGeoPoint = new firebase.firestore.GeoPoint(destination.latitude, destination.longitude);

        // Crear una nueva referencia con un ID único
        const docRef = db.collection('rides').doc();

        return docRef.set({
            id: docRef.id, // Aquí guardamos el ID del documento dentro del objeto
            origin: originGeoPoint,
            destination: destinationGeoPoint,
            date: date===null?new Date(): date,
            ...rest
        })
            .then(() => {
                return docRef.id; // Devolvemos el ID del documento
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
        },
        onSubmit: values => {
            saveRideToFirestore(values)
              .then(documentId => {
                console.log(`Document written with ID: ${documentId}`);
              })
              .catch(error => {
                console.error(`Error adding document: ${error}`);
              });
          }
          
    });

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
                            <Button style={{ flex: 1, margin: 5 }}
                                icon="clock" mode="contained" buttonColor="gray" onPress={() => showDatePicker()}>
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
                            <Button style={{ margin: 5 }}
                                icon="map" mode="contained" buttonColor="gray" onPress={showModal}>
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

                    <View style={{ flexDirection: 'column', width: "50%" }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Button style={{ flex: 1, margin: 5 }}
                                icon="car" mode="contained" buttonColor="green" onPress={formik.handleSubmit}>
                                Solicitar Ride
                            </Button>
                        </View>
                    </View>

                </View>
            </FormikProvider>
        </PaperProvider>
    );
};

export default FrmSolicitarRide;