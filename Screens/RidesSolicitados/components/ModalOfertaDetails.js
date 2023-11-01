import * as React from "react";
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { View } from "react-native";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { db } from "../../../config-firebase";
import { useAuth } from "../../../context/AuthContext";
import { sendNotificationByReference } from "../../../hooks/Notifications";
import { useTheme } from "../../../hooks/ThemeContext";

const ModalOfertaDetails = ({ ride, modalDetails, setModalDetails, setModalAlert }) => {
    const { user } = useAuth();
    const { colors } = useTheme();
    
    const validationSchema = Yup.object().shape({
        cooperacion: Yup.number()
            .typeError('Debe ser un número')
            .integer('Debe ser un número entero')
            .min(0, 'Si no deseas cobrar el ride, escribe un cero')
            .max(50, 'Debe ser menor o igual a 50')
            .required('Este campo es obligatorio'),
        comentario: Yup.string(),
    })

    async function setValues(values) {
        try {
            sendNotificationByReference(
                ride.pasajeroID.reference,
                'Nueva Oferta',
                'Tienes una nueva oferta de Ride!',
                'GestionarRides'
            );
            
            const docRef = db.collection('ofertas').doc();
            return await docRef.set({
                id: docRef.id,
                fechaSolicitud: new Date(),
                estado: 'pendiente',
                rideID: { reference: db.collection('rides').doc(ride.id), id: ride.id },
                pasajeroID: ride.pasajeroID,
                conductorID: { reference: db.collection('users').doc(user === null ? "" : user.email), uid: user === null ? "" : user.uid },
                ...values
            })
        } catch (error) {
            console.log("Error al guardar", error)
        }
    }

    return (
        <Portal>
            <Modal visible={modalDetails} onDismiss={setModalDetails} contentContainerStyle={{ backgroundColor: colors.grayModal, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>
                <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: colors.text }}>Detalles del Ride</Text>

                <Formik
                    initialValues={{
                        cooperacion: 10,
                        comentario: "",
                    }}
                    validateOnMount={true}
                    validationSchema={validationSchema}
                    onSubmit={(values) => { setValues(values) }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                        <View style={{backgroundColor: colors.grayModal}}>
                            <TextInput
                                style={{ margin: 7, height: 60 }}
                                mode="outlined"
                                label="Cooperación voluntaria"
                                value={values.cooperacion.toString()}
                                onChangeText={handleChange('cooperacion')}
                                onBlur={handleBlur('cooperacion')}
                                keyboardType='numeric'
                                theme={{ colors: { text: colors.cardText , primary: colors.cardText } }}
                            />
                            {touched.cooperacion && errors.cooperacion && <Text style={{ color: 'red' }}>{errors.cooperacion}</Text>}

                            <TextInput
                                style={{ margin: 7, height: 100 }}
                                mode="outlined"
                                value={values.comentario}
                                multiline={true}
                                onChangeText={handleChange('comentario')}
                                onBlur={handleBlur('comentario')}
                                theme={{ colors: { text: colors.cardText, primary: colors.cardText } }}
                                placeholderTextColor={colors.Text}
                                placeholder="Deja un comentario que ayude al pasajero a identificarte"
                                label="Comentarios"
                            />
                            {touched.comentario && errors.comentario && <Text style={{ color: 'red' }}>{errors.comentario}</Text>}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                <Button icon="check" mode="contained" buttonColor='#479B3B' labelStyle={{ fontWeight: 'bold', fontSize: 15, color: 'white' }} disabled={!isValid} style={{ width: '49%' }}
                                    onPress={() => { handleSubmit(); setModalDetails(false); setModalAlert(true); }}> Aceptar </Button>
                                <Button icon="close" mode="contained" buttonColor='#D83F20' labelStyle={{ fontWeight: 'bold', fontSize: 15, color: 'white' }} style={{ width: '49%' }}
                                    onPress={() => setModalDetails(false)} > Cancelar </Button>
                            </View>
                        </View>)}
                </Formik>
            </Modal>
        </Portal>
    )
}

export default ModalOfertaDetails