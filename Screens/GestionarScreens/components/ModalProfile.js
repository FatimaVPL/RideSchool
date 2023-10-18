import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import { Avatar } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getInfoMedal } from "../others/Functions";

const Profile = ({ user, oferta, modalUser, setModalUser, setModalPropsAlert, setModalAlert }) => {
    return (
        <Portal>
            <Modal visible={modalUser} onDismiss={() => setModalUser(false)} contentContainerStyle={{ flex: 1 }} >
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={{ margin: 15, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320 }}>
                        <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' }}>Información de la oferta</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
                            <View>
                                <Avatar
                                    rounded
                                    size="large"
                                    source={data.pasajero.photoURL ? { uri: data.pasajero.photoURL } : require('../../../assets/default.jpg')}
                                />
                            </View>
                            <View style={{ marginStart: 10 }}>
                                <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black', textAlign: 'center' }}>{`${user.firstName} \n ${user.lastName}`}</Text>

                                {/* CALIFICACION GENERAL */}
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: -10 }}>
                                    {Array.from({ length: user.califConductor }).map((_, index) => (
                                        <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#FFC107" }} />
                                    ))}
                                    {Array.from({ length: 5 - user.califConductor }).map((_, index) => (
                                        <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#8C8A82" }} />
                                    ))}
                                </View>

                                {/* INSIGNIAS */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {user.numRidesConductor >= 30 && (
                                        <MaterialCommunityIcons name="medal" style={{ fontSize: 30 }} color={getInfoMedal(user.numRidesConductor)} />
                                    )}
                                    {user.licencia !== "ninguna" && (
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="card-account-details-star" style={{ fontSize: 28 }} />
                                        </View>
                                    )}
                                    {user.tarjetaCirculacion && (
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="credit-card-check" style={{ fontSize: 30 }} />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        {oferta.comentario !== null && (
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicons name="chatbubbles" style={{ marginRight: 10, fontSize: 24 }} />
                                <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black' }}>{oferta.oferta.comentario}</Text>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name="cash" style={{ marginRight: 10, fontSize: 24 }} />
                            <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black' }}>{oferta.oferta.cooperacion}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button icon="check" mode="contained" buttonColor='#B2D474' textColor='white' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                                onPress={() => {
                                    setModalUser(false);
                                    setModalPropsAlert({
                                        icon: 'like2',
                                        color: 'green',
                                        title: 'ACEPTAR OFERTA',
                                        content: 'El conductor recibirá la notificación de que su oferta fue aceptada y pueden iniciar el viaje',
                                        type: 3
                                    });
                                    setModalAlert(true);
                                }}> Aceptar </Button>
                            <Button icon="close" mode="contained" buttonColor='#EE6464' textColor='white' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                                onPress={() => setModalUser(false)}> Cerrar</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal >
    )
}

export default Profile