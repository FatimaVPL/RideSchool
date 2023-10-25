import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View, StyleSheet, Pressable } from "react-native"
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDate } from "../others/Functions";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../hooks/ThemeContext";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,

        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    }
})

const ModalMoreDetails = ({ data, modalDetails, setModalDetails, setModalPropsAlert, setModalAlert }) => {
    const { colors } = useTheme();
    const { dataUser } = useAuth();

    const pasajero = data.pasajero === undefined ? `${dataUser.firstName} ${dataUser.lastName}` : `${data.pasajero.firstName} ${data.pasajero.lastName}`;
    const conductor = data.conductor === undefined ? `${dataUser.firstName} ${dataUser.lastName}` : `${data.conductor.firstName} ${data.conductor.lastName}`;

    const fechaHora = formatDate(data.ride.date, 'numeric');
    const arreglo = fechaHora.split(',', 2);
    const fecha = arreglo[0];
    const hora = arreglo[1];

    const latitudeOrigin = data.ride.origin.coordinates.latitude;
    const longitudeOrigin = data.ride.origin.coordinates.longitude;
    const latitudeDestination = data.ride.destination.coordinates.latitude;
    const longitudeDestination = data.ride.destination.coordinates.longitude;

    const mapRef = React.useRef(null);

    return (
        <Portal>
            <Modal visible={modalDetails} onDismiss={setModalDetails} contentContainerStyle={{ backgroundColor: colors.background, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: colors.text, marginRight: 15 }}>Información Detallada</Text>
                    </View>
                    <View>
                        <Pressable onPress={() => setModalDetails(false)}>
                            <Ionicons name="close-circle-outline" style={{ color: '#D83F20', fontSize: 38, marginTop: -12 }} />
                        </Pressable>
                    </View>
                </View>

                {data.oferta !== undefined && (
                    <View style={{ borderWidth: 1.5, borderColor: colors.cardText }}>
                        <Text style={{ marginTop: -10, fontWeight: 'bold', color: colors.text, marginLeft: 10, fontSize: 16, backgroundColor: colors.background, width: '30%', textAlign: 'center' }}>OFERTA</Text>
                        <Text style={{ marginBottom: 15, marginLeft: 8, fontWeight: 'bold', color: colors.text, fontSize: 16, marginTop: 6 }}>
                            Conductor: <Text style={{ fontWeight: 'normal', color: colors.text }}>{'\n'}{conductor}{'\n'}</Text>
                            {data.oferta.comentario !== null && (
                                <><Text style={{ fontWeight: 'bold', color: colors.text }}>Comentario:</Text><Text style={{ fontWeight: 'normal', color: colors.text }}>{'\n'}{data.oferta.comentario}{'\n'}</Text></>
                            )}
                            Coperación: <Text style={{ fontWeight: 'normal', color: colors.text }}>$ {data.oferta.cooperacion}</Text>
                        </Text>
                    </View>
                )}

                <View style={{ borderWidth: 1.5, borderColor: colors.cardText, marginTop: 12 }}>
                    <Text style={{ marginTop: -10, fontWeight: 'bold', color: colors.text, marginLeft: 10, fontSize: 16, backgroundColor: colors.background, width: '30%', textAlign: 'center' }}>RIDE</Text>
                    <Text style={{ marginBottom: 15, marginLeft: 8, fontWeight: 'bold', color: colors.text, fontSize: 16, marginTop: 6 }}>
                        Pasajero: <Text style={{ fontWeight: 'normal', color: colors.text }}>{'\n'}{pasajero}{'\n'}</Text>
                        {data.ride.comentarios !== null && (
                            <><Text style={{ fontWeight: 'bold',  color: colors.text }}>Comentario:</Text><Text style={{ fontWeight: 'normal', color: 'black' }}>{'\n'}{data.ride.comentarios}{'\n'}</Text></>
                        )}
                        Num. Personas: <Text style={{ fontWeight: 'normal', color: colors.text }}>{data.ride.personas}{'\n'}</Text>
                        Fecha: <Text style={{ fontWeight: 'normal', color: colors.text }}>{fecha}</Text>  Hora:<Text style={{ fontWeight: 'normal', color: 'black' }}>{hora}{'\n'}</Text>
                        Ruta: <Text style={{ fontWeight: 'normal', color: colors.text }}>{data.ride.informationRoute.distance}km/{data.ride.informationRoute.duration}min aproximados</Text>
                    </Text>

                    <View style={{ width: '95%', height: 180, alignSelf: 'center', marginBottom: 5 }}>
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={{
                                latitude: latitudeOrigin,
                                longitude: longitudeOrigin,
                                latitudeDelta: 0.04,
                                longitudeDelta: 0.04,
                            }}
                        >
                            <Marker
                                title="Punto Encuentro"
                                coordinate={{ latitude: latitudeOrigin, longitude: longitudeOrigin }} />
                            <Marker
                                title="Punto Destino"
                                coordinate={{ latitude: latitudeDestination, longitude: longitudeDestination }} />
                            <MapViewDirections
                                origin={{ latitude: latitudeOrigin, longitude: longitudeOrigin }}
                                destination={{ latitude: latitudeDestination, longitude: longitudeDestination }}
                                apikey={GOOGLE_MAPS_API_KEY}
                                mode="DRIVING"
                                strokeWidth={3}
                                strokeColor="green"
                                onReady={(result) => {
                                    mapRef.current?.fitToCoordinates(result.coordinates, {
                                        edgePadding: {
                                            right: 8,
                                            bottom: 12,
                                            left: 8,
                                            top: 12,
                                        },
                                    });
                                }} />
                        </MapView>
                    </View>
                </View>

                {((data.pasajero === undefined && data.ride?.estado === "en curso") ||
                    (data.conductor === undefined && data.oferta?.estado === "aceptada")) && (
                        <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
                            <Button
                                textColor="#EE6464"
                                style={{ width: '80%', borderWidth: 2, borderColor: '#EE6464' }}
                                labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                buttonColor= {colors.background}
                                onPress={() => {
                                    setModalDetails(false);
                                    setModalPropsAlert({
                                        icon: 'warning',
                                        color: '#FFC300',
                                        title: 'CANCELAR RIDE',
                                        content: '¿Estás seguro de que deseas cancelar tu ride?',
                                        type: 2
                                    });
                                    setModalAlert(true);
                                }}>
                                Cancelar Ride
                            </Button>
                        </View>
                    )
                }

            </Modal>
        </Portal>
    )
}

export default ModalMoreDetails