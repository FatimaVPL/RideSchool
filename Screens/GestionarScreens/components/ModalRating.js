import * as React from "react";
import { useState } from 'react'
import { Button, Text, TextInput, Modal, Portal } from 'react-native-paper';
import { View, Pressable } from "react-native";
import { AirbnbRating } from 'react-native-elements';
import { updateRating, updateStatus } from "../others/Queries";
import { db } from "../../../config-firebase";
import { useTheme } from "../../../hooks/ThemeContext";

const ModalRating = ({ ride, rol, modalRating, setModalRating, setModalReview, setModalPropsAlert, setModalAlert }) => {
    const { colors } = useTheme();
    let fileName = rol === "conductor" ? "califC_P" : "califP_C";
    let userReference = rol === "conductor" ? ride.pasajeroID.reference: ride.conductorID.reference;

    const [text, onChangeText] = useState(ride[fileName]?.comentario);
    const [score, setScore] = useState(ride[fileName]?.puntaje);

    return (
        <Portal>
            <Modal visible={modalRating} onDismiss={setModalRating} contentContainerStyle={{ backgroundColor: colors.grayModal, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>
                <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: colors.textModal, textAlign: 'center' }}>Califica tu experiencia</Text>
                <AirbnbRating
                    count={5}
                    reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                    defaultRating={score}
                    size={30}
                    onFinishRating={setScore}
                />
                <TextInput
                    style={{ margin: 7, height: 100, marginTop: 15 }}
                    mode="outlined"
                    label="Comentarios"
                    multiline={true}
                    editable={((rol === "conductor" && ride.califC_P === undefined) ||
                        (rol === "pasajero" && ride.califP_C === undefined)) ? true : false}
                    value={text}
                    onChangeText={onChangeText}
                    theme={{ colors: { text: 'green', primary: 'green' } }}
                />
                {((rol === "conductor" && ride.califDetalles_P === undefined) ||
                    (rol === "pasajero" && ride.califDetalles_C === undefined)) && (
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                            <Pressable onPress={() => { setModalRating(false); setModalReview(true); }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ marginBottom: 10, fontSize: 15, borderBottomWidth: 1, borderBottomColor: 'gray', color: 'gray' }}>Evaluar con más detalle</Text>
                                </View>
                            </Pressable>
                        </View>
                    )}
                {((rol === "conductor" && ride.califC_P === undefined) ||
                    (rol === "pasajero" && ride.califP_C === undefined)) && (
                        <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                            <Button mode="contained" buttonColor='#B2D474' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: '49%' }}
                                onPress={() => {
                                    const reference = db.collection('rides').doc(ride.id);
                                    updateStatus(reference, "finalizado")
                                    updateRating({ puntaje: score, comentario: text, id: ride.id, fileName, userReference }); 
                                    setModalPropsAlert({
                                        icon: 'form',
                                        color: 'green',
                                        title: 'Contestar encuesta detallada',
                                        content: `Realiza una evaluación detallada de tu  ${rol}`,
                                        type: 4
                                    });
                                    setModalAlert(true);
                                    setModalRating(false);
                                }}> Guardar </Button>
                            <Button mode="contained" buttonColor='#B0B0B0' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: '49%' }}
                                onPress={() => setModalRating(false)} > Cancelar </Button>
                        </View>
                    )}
            </Modal>
        </Portal>
    )
}

export default ModalRating