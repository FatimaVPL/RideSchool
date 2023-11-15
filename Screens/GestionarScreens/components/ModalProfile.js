import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import { Avatar } from 'react-native-elements';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useTheme } from "../../../hooks/ThemeContext";

const Profile = ({ user, oferta, modalUser, setModalUser, setModalPropsAlert, setModalAlert }) => {
    const { colors } = useTheme();
    return (
        <Portal>
            <Modal visible={modalUser} onDismiss={setModalUser} contentContainerStyle={{ backgroundColor: colors.grayModal, padding: 20, borderRadius: 15, width: '73%', alignSelf: 'center', justifyContent: 'center', }}>
                <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: colors.textModal }}>Información de la oferta</Text>
                <View style={{ flexDirection: 'row', marginBottom: 18, width: '95%' }}>
                    <View style={{ justifyContent: 'center' }}>
                        <Avatar
                            rounded
                            size={70}
                            source={user.photoURL ? { uri: user.photoURL } : require('../../../assets/default.jpg')}
                        />
                    </View>
                    <View style={{ marginStart: 12 }}>
                        <Text style={{ paddingTop: 6, fontSize: 18, color: colors.textModal2 }}>{`${user.firstName} \n${user.lastName}`}</Text>

                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            {user.califConductor.promedio !== 0 && (
                                <><Text style={{ fontSize: 15, color: colors.textModal2 }}>{user.califConductor.promedio.toFixed(1)}
                                </Text><Ionicons name="star" style={{ marginLeft: 5, fontSize: 20, color: "#FFC107" }} /></>
                            )}
                            {user.numRidesConductor !== 0 && (
                                <Text style={{ fontSize: 15, color: colors.textModal2, marginLeft: 15 }}>{user.numRidesConductor} viajes</Text>
                            )}
                        </View>
                    </View>
                </View>

                {(user.licencia.validado || user.tarjetaCirculacion.validado) && (
                    <View style={{ backgroundColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 15 }}>
                        {user.licencia.validado && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, color: 'black' }}>Licencia de Conducir</Text>
                                <Ionicons name="checkmark-circle" style={{ marginLeft: 10, fontSize: 22, color: 'green' }} />
                            </View>
                        )}
                        {user.tarjetaCirculacion.validado && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, color: 'black' }}>Tarjeta de Circulación</Text>
                                <Ionicons name="checkmark-circle" style={{ marginLeft: 8, fontSize: 22, color: 'green' }} />
                            </View>
                        )}
                    </View>
                )}

                {oferta.comentario !== null && (
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="chatbubbles" style={{ marginRight: 10, fontSize: 24, color: colors.icon }} />
                        <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 17, color: colors.textModal2 }}>{oferta.oferta.comentario}</Text>
                    </View>
                )}

                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome5 name="coins" style={{ marginRight: 10, fontSize: 24, alignSelf: 'center', color: colors.icon }} />
                        <Text style={{ paddingTop: 6, fontSize: 17, color: colors.textModal2 }}>{oferta.oferta.cooperacion}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 30 }}>
                        <Text style={{ paddingTop: 6, fontSize: 17, color: colors.textModal2 }}>Vehículo:</Text>
                        <FontAwesome5 name={user.tipoVehiculo === "motocicleta" ? "motorcycle" : "car"} style={{ marginLeft: 10, fontSize: 24, alignSelf: 'center', color: colors.icon }} />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Button icon="check" mode="contained" buttonColor='#A9CA6D' textColor='white' style={{ width: '100%' }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                        onPress={() => {
                            setModalUser(false);
                            setModalPropsAlert({
                                icon: 'like2',
                                color: 'green',
                                title: 'ACEPTAR OFERTA',
                                content: 'Se le notificará al conductor que su oferta fue aceptada y pueden iniciar el viaje',
                                type: 3
                            });
                            setModalAlert(true);
                        }}> Aceptar </Button>
                </View>
            </Modal>
        </Portal>
    )
}

export default Profile