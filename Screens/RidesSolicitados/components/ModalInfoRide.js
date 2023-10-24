import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View, Pressable } from "react-native";
import { Avatar } from 'react-native-elements';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDate } from "../../GestionarScreens/others/Functions";
import { getInfoMedal } from "../../GestionarScreens/others/Functions";

const ModalInfoRide = ({ data, modalInfoRide, setModalInfoRide, setModalDetails }) => {
    return (
        <Portal>
            <Modal visible={modalInfoRide} onDismiss={setModalInfoRide} contentContainerStyle={{ backgroundColor: 'white', padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>
                <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' }}>Información del Ride</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
                    <View>
                        <Avatar
                            rounded
                            size="large"
                            source={data.pasajero.photoURL ? { uri: data.pasajero.photoURL } : require('../../../assets/default.jpg')}
                        />
                    </View>
                    <View style={{ marginStart: 12 }}>
                        <View style={{ flexDirection: 'row' }}>
                            {/* INSIGNIA */}
                            {data.pasajero.numRidesPasajero >= 30 && (
                                <MaterialCommunityIcons name="medal" style={{ fontSize: 30 }} color={getInfoMedal(data.pasajero.numRidesPasajero)} />
                            )}
                            <Text style={{ marginBottom: 15, fontSize: 20, textAlign: 'center', color: 'black' }}>{`${data.pasajero.firstName} \n ${data.pasajero.lastName}`}</Text>
                        </View>
                        {/* CALIFICACION GENERAL */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: -10 }}>
                            {Array.from({ length: data.pasajero.califPasajero }).map((_, index) => (
                                <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#FFC107" }} />
                            ))}
                            {Array.from({ length: 5 - data.pasajero.califPasajero }).map((_, index) => (
                                <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#8C8A82" }} />
                            ))}
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="time" style={{ marginRight: 10, fontSize: 24 }} />
                        <Text style={{ marginBottom: 15, fontSize: 20, color: 'black' }}>{formatDate(data.ride.date, "numeric")}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="person" style={{ marginRight: 10, fontSize: 24 }} />
                        <Text style={{ marginBottom: 15, fontSize: 20, color: 'black' }}>{data.ride.personas}</Text>
                    </View>
                </View>

                {data.ride.comentarios !== null && (
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="chatbubbles" style={{ marginRight: 10, fontSize: 24 }} />
                        <Text style={{ marginBottom: 15, fontSize: 20, color: 'black' }}>{data.ride.comentarios}</Text>
                    </View>
                )}

                <View style={{ flexDirection: 'row', width: 210 }}>
                    <Ionicons name="location-sharp" style={{ marginRight: 10, fontSize: 24 }} />
                    <Text style={{ marginBottom: 15, fontSize: 20, color: 'black' }}>
                        Ruta {'\n'}
                        <Text style={{ fontWeight: 'bold', color: 'black' }}>Inicio:</Text> {data.ride.origin.direction} {'\n'}
                        <Text style={{ fontWeight: 'bold', color: 'black' }}>Destino:</Text> {data.ride.destination.direction}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Pressable onPress={() => console.log('hacer algo')}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ marginBottom: 10, fontSize: 15, borderBottomWidth: 1, borderBottomColor: 'gray', color: 'gray' }}>Ver detalles</Text>
                        </View>
                    </Pressable>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button icon="check" mode="contained" buttonColor='#479B3B' style={{ width: '49%' }} labelStyle={{ fontWeight: 'bold', fontSize: 15, color: 'white' }}
                        onPress={() => { setModalInfoRide(false); setModalDetails(true); }}> Aceptar </Button>
                    <Button icon="close" mode="contained" buttonColor='#D83F20' style={{ width: '49%' }} labelStyle={{ fontWeight: 'bold', fontSize: 15, color: 'white' }}
                        onPress={() => setModalInfoRide(false)}> Cancelar </Button>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalInfoRide