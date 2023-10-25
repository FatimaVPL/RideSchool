import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { deleteDoc, updateRide, updateStatus, updateRole } from "../others/Queries";
import { db } from "../../../config-firebase";
import { useTheme } from "../../../hooks/ThemeContext";

// 1 = Cancelar en ride en estado pendiente -- Eliminar ride la BD y las ofertas asociadas
// 2 = Cancelar en estado en curso/aceptada -- Cambiar estado del ride y oferta a cancelado, enviar notificacion 
// 3 = Dialogo para aceptar oferta -- Enviar notificacion al conductor, cambiar estado del ride a en curso
// 4 = Dialogo para evaluacion detallada -- Mostrar modal evaluacion detallada
// 5 = Cambio de rol -- Actualizar el rol
// 6 = Cancelar la oferta en estado pendiente -- Eliminar oferta de la BD
const ModalALert = ({ icon, color, title, content, type, ride, ofertas, indexOferta, rol, email, conductor,
    modalALert, setModalAlert, setModalReview, setModalOptions, setModalDialog, setModalPropsDialog }) => {
    const { colors } = useTheme();
    return (
        <Portal>
            <Modal visible={modalALert} onDismiss={setModalAlert} contentContainerStyle={{ backgroundColor: colors.background, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <AntDesign name={icon} style={{ fontSize: 50 }} color={color} />
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', color: colors.text, fontSize: 18, marginTop: 6 }}>{title}</Text>
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', color: colors.text, fontSize: 16, textAlign: 'center' }}>{content}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button mode="contained" buttonColor={type === 3 || type === 4 ? '#A9CA6D' : '#EE6464'} textColor={colors.text} labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: "48%" }}
                        onPress={() => {
                            switch (type) {
                                case 1:
                                    //Eliminar ride
                                    deleteDoc(ride.id, "rides");
                                    //Eliminar ofertas
                                    for (const oferta of ofertas) {
                                        deleteDoc(oferta.oferta.id, "ofertas");
                                    }
                                    setModalPropsDialog({
                                        icon: 'checkmark-circle-outline',
                                        color: '#EE6464',
                                        title: 'RIDE CANCELADO',
                                        type: 1
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
                                case 5:
                                    if (rol === "Pasajero" && conductor === false) {
                                        setModalPropsDialog({
                                            icon: 'information-circle-outline',
                                            color: '#FFC300',
                                            title: 'Primero completa tu registro como conductor',
                                            type: 2
                                        });
                                        setModalDialog(true);
                                    } else {
                                        updateRole(email, rol);
                                    }
                                    break;
                                case 6:
                                    deleteDoc(ride.id, "ofertas");
                                    setModalPropsDialog({
                                        icon: 'checkmark-circle-outline',
                                        color: '#EE6464',
                                        title: 'OFERTA CANCELADA',
                                        type: 1
                                    });
                                    setModalDialog(true);
                                    break;
                            }
                            setModalAlert(false);
                        }}> {type === 3 ? "Aceptar" : "SI"} </Button>
                    <Button mode="contained" buttonColor='#B0B0B0' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: "48%" }}
                        onPress={() => setModalAlert(false)}> {type === 3 ? "Cancelar" : "NO"} </Button>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalALert