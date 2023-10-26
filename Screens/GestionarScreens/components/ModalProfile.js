import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import { Avatar } from 'react-native-elements';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { getInfoMedal } from "../others/Functions";

const Profile = ({ user, oferta, modalUser, setModalUser, setModalPropsAlert, setModalAlert }) => {
    return (
        <Portal>
            <Modal visible={modalUser} onDismiss={setModalUser} contentContainerStyle={{ backgroundColor: 'white', padding: 18, borderRadius: 15, width: '73%', alignSelf: 'center', justifyContent: 'center', }}>
                <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' }}>Información de la oferta</Text>
                <View style={{ flexDirection: 'row', marginBottom: 18, width: '95%' }}>
                    <View style={{ justifyContent: 'center' }}>
                        <Avatar
                            rounded
                            size={90}
                            source={user.photoURL ? { uri: user.photoURL } : require('../../../assets/default.jpg')}
                        />
                    </View>
                    <View style={{ marginStart: 12 }}>
                        <Text style={{ paddingTop: 6, fontSize: 18, color: 'black' }}>{`${user.firstName} \n${user.lastName}`}</Text>

                        {/* CALIFICACION GENERAL */}
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            {Array.from({ length: user.califConductor }).map((_, index) => (
                                <Ionicons key={index} name="star" style={{ marginRight: 6, fontSize: 20, color: "#FFC107" }} />
                            ))}
                            {Array.from({ length: 5 - user.califConductor }).map((_, index) => (
                                <Ionicons key={index} name="star" style={{ marginRight: 6, fontSize: 20, color: "#8C8A82" }} />
                            ))}
                        </View>

                        {/* INSIGNIAS */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '65%' }}>
                            {user.numRidesConductor >= 30 && (<MaterialCommunityIcons name="medal" style={{ fontSize: 29 }} color={getInfoMedal(user.numRidesConductor)} />)}
                            {user.licencia && (<MaterialCommunityIcons name="card-account-details-star" style={{ fontSize: 28 }} />)}
                            {user.tarjetaCirculacion && (<MaterialCommunityIcons name="credit-card-check" style={{ fontSize: 30 }} />)}
                        </View>
                    </View>
                </View>

                {oferta.comentario !== null && (
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="chatbubbles" style={{ marginRight: 10, fontSize: 24 }} />
                        <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 17, color: 'black' }}>{oferta.oferta.comentario}</Text>
                    </View>
                )}

                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome5 name="coins" style={{ marginRight: 10, fontSize: 24, alignSelf: 'center' }} />
                        <Text style={{ paddingTop: 6, fontSize: 17, color: 'black' }}>{oferta.oferta.cooperacion}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 30 }}>
                        <Text style={{ paddingTop: 6, fontSize: 17, color: 'black' }}>Vehículo</Text>
                        <FontAwesome5 name={user.tipoVehiculo === "motocicleta" ? "motorcycle" : "car"} style={{ marginLeft: 10, fontSize: 24, alignSelf: 'center' }} />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Button icon="check" mode="contained" buttonColor='#B2D474' textColor='white' style={{ width: '100%' }} labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
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