import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { deleteDoc, updateRide, updateStatus } from "../others/Queries";
import { db } from "../../../config-firebase";

// 1 = Cancelar en estado pendiente -- Eliminar ride la BD
// 2 = Cancelar en estado en curso/aceptada -- Cambiar estado del ride y oferta a cancelado, enviar notificacion 
// 3 = Dialogo para aceptar oferta -- Enviar notificacion al conductor, cambiar estado del ride a en curso
// 4 = Dialogo para evaluacion detallada -- Mostrar modal evaluacion detallada
const ModalALert = ({ icon, color, title, content, type, ride, indexOferta, ofertas, modalALert, setModalAlert, setModalReview, setModalOptions, setModalDialog, setModalPropsDialog }) => {
    return (
        <Portal>
            <Modal visible={modalALert} onDismiss={() => setModalAlert(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={{ margin: 15, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320, padding: 15 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name={icon} style={{ fontSize: 50 }} color={color} />
                            <Text style={{ marginBottom: 15, fontWeight: 'bold', color: 'black', fontSize: 18, marginTop: 6 }}>{title}</Text>
                            <Text style={{ marginBottom: 15, fontWeight: 'bold', color: 'black', fontSize: 16, textAlign: 'center' }}>{content}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button mode="contained" buttonColor={type === 3 || type === 4 ? '#B2D474' : '#EE6464'} textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: 140 }}
                                onPress={() => {
                                    switch (type) {
                                        case 1:
                                            deleteDoc(ride.id, "rides");
                                            setModalPropsDialog({
                                                icon: 'checkmark-circle-outline',
                                                color: '#EE6464',
                                                title: 'RIDE CANCELADO', 
                                            });
                                            setModalDialog(true);
                                            break;
                                        case 2:
                                            const referenceRide = db.collection('rides').doc(ride.id);
                                            updateStatus(referenceRide, "cancelado");
                                            updateStatus(ride.ofertaID, "cancelada");
                                            setModalOptions(true);
                                            break;
                                        case 3:
                                            updateRide(ofertas, indexOferta, ride.id);
                                            break;
                                        case 4:
                                            setModalReview(true);
                                            break;
                                    }
                                    setModalAlert(false);
                                }}> {type === 3 ? "Aceptar" : "SI"} </Button>
                            <Button mode="contained" buttonColor='#B0B0B0' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: 140 }}
                                onPress={() => setModalAlert(false)}> {type === 3 ? "Cancelar" : "NO"} </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal>


    )
}

export default ModalALert