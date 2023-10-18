import * as React from "react";
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { View } from "react-native";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { db } from "../../../config-firebase";
import { useAuth } from "../../../context/AuthContext";

const ModalOfertaDetails = ({ride, modalDetails, setModalDetails, setModalAlert}) => {
    const { user } = useAuth();

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
            const docRef = db.collection('ofertas').doc();
            return await docRef.set({
                id: docRef.id,
                fechaSolicitud: new Date(),
                estado: 'pendiente',
                rideID: { reference: db.collection('rides').doc(ride.id), id: ride.id },
                pasajeroID: ride.pasajeroID,
                conductorID: { reference: db.collection('users').doc(user.email), uid: user.uid },
                ...values
            })
        } catch (error) {
            console.log("Error al guardar", error)
        }
    }

    return (
        <Portal>
            <Modal visible={modalDetails} onDismiss={() => setModalDetails(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: 320 }}>
                        <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20 }}>Detalles del Ride</Text>

                        <Formik
                            initialValues={{
                                cooperacion: 0,
                                comentario: "",
                            }}
                            validateOnMount={true}
                            validationSchema={validationSchema}
                            onSubmit={(values) => { setValues(values) }}
                        >
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                                <View>
                                    <TextInput
                                        style={{ margin: 7, height: 60 }}
                                        mode="outlined"
                                        label="Cooperación voluntaria"
                                        value={values.cooperacion.toString()}
                                        onChangeText={handleChange('cooperacion')}
                                        onBlur={handleBlur('cooperacion')}
                                        keyboardType='numeric'
                                        theme={{ colors: { text: 'green', primary: 'green' } }}
                                    />
                                    {touched.cooperacion && errors.cooperacion && <Text style={{ color: 'red' }}>{errors.cooperacion}</Text>}

                                    <TextInput
                                        style={{ margin: 7, height: 100 }}
                                        mode="outlined"
                                        label="Comentarios"
                                        value={values.comentario}
                                        multiline={true}
                                        onChangeText={handleChange('comentario')}
                                        onBlur={handleBlur('comentario')}
                                        theme={{ colors: { text: 'green', primary: 'green' } }}
                                    />
                                    {touched.comentario && errors.comentario && <Text style={{ color: 'red' }}>{errors.comentario}</Text>}

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Button icon="check" mode="contained" buttonColor='#479B3B' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} disabled={!isValid} style={{width: 135}}
                                            onPress={() => { handleSubmit(); setModalDetails(false); setModalAlert(true); }}> Aceptar </Button>
                                        <Button icon="close" mode="contained" buttonColor='#D83F20' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{width: 135}}
                                            onPress={() => setModalDetails(false)} > Cancelar </Button>
                                    </View>
                                </View>)}
                        </Formik>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalOfertaDetails