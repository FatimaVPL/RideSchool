import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View, Pressable, Image } from "react-native";
import { Avatar, AirbnbRating } from 'react-native-elements';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDate } from "../../GestionarScreens/others/Functions";
import { useTheme } from "../../../hooks/ThemeContext";
import { getInfoMedal2 } from "../../GestionarScreens/others/Functions";

const ModalInfoRide = ({ data, modalInfoRide, setModalInfoRide, setModalDetails }) => {
    const { colors } = useTheme();
    return (
        <Portal>
            <Modal visible={modalInfoRide} onDismiss={setModalInfoRide} contentContainerStyle={{ backgroundColor: colors.grayModal, padding: 20, borderRadius: 15, width: '85%', alignSelf: 'center', justifyContent: 'center', }}>
                <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: colors.textModal }}>Información del Ride</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
                    <View>
                        <Avatar
                            rounded
                            size="large"
                            source={data.pasajero.photoURL ? { uri: data.pasajero.photoURL } : require('../../../assets/default.jpg')}
                        />
                    </View>
                    <View style={{marginLeft: 15}}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            {data.pasajero.numRidesPasajero >= 30 && (
                                <Image source={getInfoMedal2(data.pasajero.numRidesConductor).uri} style={{ width: 25, height: 25, marginTop: 6 }} />
                            )}
                            <Text style={{ marginBottom: 5, fontSize: 20, textAlign: 'center', color: colors.textModal2 }}>{`${data.pasajero.firstName} \n${data.pasajero.lastName}`}</Text>
                        </View>
                        {/* CALIFICACION GENERAL*/}
                        <AirbnbRating
                            count={5}
                            defaultRating={data.pasajero.califPasajero.promedio}
                            size={22}
                            showRating={false}
                            isDisabled={true}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="time" style={{ marginRight: 10, fontSize: 24, color: colors.icon }} />
                        <Text style={{ marginBottom: 15, fontSize: 20, color: colors.textModal2 }}>{formatDate(data.ride.date, "numeric")}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="person" style={{ marginRight: 10, fontSize: 24, color: colors.icon }} />
                        <Text style={{ marginBottom: 15, fontSize: 20, color: colors.textModal2 }}>{data.ride.personas}</Text>
                    </View>
                </View>

                {data.ride.comentarios !== null && (
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="chatbubbles" style={{ marginRight: 10, fontSize: 24, color: colors.icon }} />
                        <Text style={{ marginBottom: 15, fontSize: 20, color: colors.textModal2 }}>{data.ride.comentarios}</Text>
                    </View>
                )}

                <View style={{ flexDirection: 'row', width: 210 }}>
                    <Ionicons name="location-sharp" style={{ marginRight: 10, fontSize: 24, color: colors.icon }} />
                    <Text style={{ marginBottom: 15, fontSize: 20, color: colors.textModal2 }}>
                        Ruta {'\n'}
                        <Text style={{ fontWeight: 'bold', color: colors.textModal2 }}>Inicio:</Text> {data.ride.origin.direction} {'\n'}
                        <Text style={{ fontWeight: 'bold', color: colors.textModal2 }}>Destino:</Text> {data.ride.destination.direction}
                    </Text>
                </View>

                {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Pressable onPress={() => console.log('hacer algo')}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ marginBottom: 10, fontSize: 15, borderBottomWidth: 1, borderBottomColor: 'gray', color: 'gray' }}>Ver detalles</Text>
                        </View>
                    </Pressable>
                </View> */}

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