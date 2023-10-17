import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import { AirbnbRating } from 'react-native-elements';
import { useState } from 'react'
import { sendCalifs } from "../others/Queries";

const ModalReview = ({ userType, modalReview, setModalReview, rideID }) => {
    const [califs, setCalifs] = useState({});

    const handleRatingChange = (nombre, calif) => {
        setCalifs((prevCalifs) => ({
            ...prevCalifs,
            [nombre]: calif,
        }))
    }

    const userTypeKey = userType === "conductor" ? "califDetalles_C" : "califDetalles_P";

    const values = userType === "conductor" ?
        {
            title: ["Puntualidad", "Habilidad \nde manejo", "Condiciones \ndel vehículo", "Buena onda", "Confiable"],
            field: ["puntualidad", "manejo", "vehiculo", "cool", "confiable"]
        } :
        {
            title: ["Puntualidad", "Cumple con la \ncooperación", "Buena \nconversación", "Buena onda", "Confiable"],
            field: ["puntualidad", "cooperacion", "conversacion", "cool", "confiable"]
        }


    return (
        <Portal>
            <Modal visible={modalReview} onDismiss={() => setModalReview(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={{ margin: 15, backgroundColor: 'white', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320, padding: 25 }}>
                        <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' , textAlign: 'center' }}>Califica a tu {userType}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{marginBottom: 15, fontSize: 18, color: 'black' }}>{values.title[0]}</Text>
                            <AirbnbRating
                                count={5}
                                defaultRating={0}
                                size={25}
                                showRating={false}
                                onFinishRating={(v) => handleRatingChange(values.field[0], v)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{marginBottom: 15, fontSize: 18, color: 'black' }}>{values.title[1]}</Text>
                            <AirbnbRating
                                count={5}
                                defaultRating={0}
                                size={25}
                                showRating={false}
                                onFinishRating={(v) => handleRatingChange(values.field[1], v)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={{marginBottom: 15, fontSize: 18, color: 'black' }}>{values.title[2]}</Text>
                            <AirbnbRating
                                count={5}
                                defaultRating={0}
                                size={25}
                                showRating={false}
                                onFinishRating={(v) => handleRatingChange(values.field[2], v)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{marginBottom: 15, fontSize: 18, color: 'black' }}>{values.title[3]}</Text>
                            <AirbnbRating
                                count={5}
                                defaultRating={0}
                                size={25}
                                showRating={false}
                                onFinishRating={(v) => handleRatingChange(values.field[3], v)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{marginBottom: 15, fontSize: 18, color: 'black' }}>{values.title[4]}</Text>
                            <AirbnbRating
                                count={5}
                                defaultRating={0}
                                size={25}
                                showRating={false}
                                onFinishRating={(v) => handleRatingChange(values.field[4], v)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                            <Button mode="contained" buttonColor='#B2D474' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: 128 }}
                                onPress={() => { sendCalifs(rideID, userTypeKey, califs); setModalReview(false); }}> Guardar </Button>
                            <Button mode="contained" buttonColor='#B0B0B0' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: 128 }}
                                onPress={() => setModalReview(false)} > Cancelar </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalReview