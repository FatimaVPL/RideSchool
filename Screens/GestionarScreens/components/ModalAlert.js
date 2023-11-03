import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { deleteDoc, updateRide, updateStatus, updateRole, deleteField } from "../others/Queries";
import { db } from "../../../config-firebase";
import { sendNotificationByReference, sendNotificationWithTimer } from "../../../hooks/Notifications";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../hooks/ThemeContext";

// 1 = Cancelar en ride en estado pendiente -- Eliminar ride la BD y las ofertas asociadas
// 2 = Cancelar en estado en curso/aceptada -- Cambiar estado del ride y oferta a cancelado, enviar notificacion 
// 3 = Dialogo para aceptar oferta -- Enviar notificacion al conductor, cambiar estado del ride a en curso
// 4 = Dialogo para evaluacion detallada -- Mostrar modal evaluacion detallada
// 5 = Cambio de rol -- Actualizar el rol
// 6 = Cancelar la oferta en estado pendiente -- Eliminar oferta de la BD
// 7 = Dialogo ride completado -- Cambiar estado de ride/oferta a llego al destino
const ModalALert = ({ icon, color, title, content, type, data, indexOferta, rol, email, conductor,
    modalALert, setModalAlert, setModalReview, setModalOptions, setModalDialog, setModalPropsDialog, setModalRating }) => {
    const { colors } = useTheme()
    const { dataUser } = useAuth();
  
    return (
        <Portal>
            <Modal visible={modalALert} onDismiss={setModalAlert} contentContainerStyle={{ backgroundColor: colors.grayModal, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <AntDesign name={icon} style={{ fontSize: 50 }} color={color} />
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', color: colors.textModal2, fontSize: 18, marginTop: 6 }}>{title}</Text>
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', color: colors.textModal2, fontSize: 16, textAlign: 'center' }}>{content}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button mode="contained" buttonColor={type === 3 || type === 4 || type === 7 || type === 5 ? '#A9CA6D' : '#EE6464'} textColor={colors.textModal2} labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: "48%" }}
                        onPress={() => {
                            switch (type) {
                                case 1:
                                    //Eliminar ride
                                    deleteDoc(data.ride.id, "rides");
                                    //Eliminar ofertas
                                    if (data.ofertas !== undefined) {
                                        for (const oferta of data.ofertas) {
                                            deleteDoc(oferta.oferta.id, "ofertas");
                                        }
                                    }

                                    setModalPropsDialog({
                                        icon: 'checkmark-circle-outline',
                                        color: '#EE6464',
                                        title: 'RIDE CANCELADO'
                                    });
                                    setModalDialog(true);
                                    break;
                                case 2:
                                    const referenceRide = db.collection('rides').doc(data.ride.id);
                                    updateStatus(referenceRide, "cancelado");
                                    updateStatus(data.ride.ofertaID, "cancelada");

                                    //Eliminar el chat
                                    deleteField(data.oferta.conductorID.reference);
                                    deleteField(data.oferta.pasajeroID.reference);

                                    setModalOptions(true);
                                    break;
                                case 3:
                                    //RIDE EN CURSO
                                    updateRide(data.ofertas, indexOferta, data.ride.id);

                                    //Enviar notificacion para recordar marcar que llego al destino
                                    sendNotificationWithTimer(
                                        data.ride.conductorID?.reference,
                                        data.ride.pasajeroID?.reference,
                                        data.ride.informationRoute.duration,
                                        data.ride.estado,
                                        '¿Llegaste a tu destino?',
                                        'Confirmalo en la app',
                                        "Mis Ofertas",
                                    );
                                    break;
                                case 4:
                                    setModalReview(true);
                                    break;
                                case 5:
                                    if (rol === "Pasajero" && conductor === false) {
                                        setModalPropsDialog({
                                            icon: 'information-circle-outline',
                                            color: '#FFC300',
                                            title: 'Primero completa tu registro como conductor'
                                        });
                                        setModalDialog(true);
                                    } else {
                                        updateRole(email, rol);
                                    }
                                    break;
                                case 6:
                                    deleteDoc(data.oferta.id, "ofertas");
                                    setModalPropsDialog({
                                        icon: 'checkmark-circle-outline',
                                        color: '#EE6464',
                                        title: 'OFERTA CANCELADA',
                                        type: 1
                                    });
                                    setModalDialog(true);
                                    break;
                                case 7:
                                    //Actualizar estado oferta/ride
                                    updateStatus(data.ride.ofertaID, "llego al destino");
                                    updateStatus(data.oferta.rideID.reference, "llego al destino");

                                    //Elimar campo de chat para pasajero y conductor
                                    deleteField(data.oferta.conductorID.reference);
                                    deleteField(data.oferta.pasajeroID.reference);

                                    //Enviar notificacion
                                    sendNotificationByReference(
                                        dataUser.rol === "pasajero" ? data.oferta.conductorID.reference : data.oferta.pasajeroID.reference,
                                        'Llegaste a tu destino',
                                        'Recuerda calificar tu experiencia',
                                        dataUser.rol === "pasajero" ? "GestionarOfertas" : "GestionarRides",
                                    );

                                    //Calificar experiencia
                                    setModalRating(true);

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