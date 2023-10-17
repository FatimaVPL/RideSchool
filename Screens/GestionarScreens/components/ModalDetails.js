import * as React from "react";
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { View, Pressable, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cut, formatDate } from "../others/Functions";

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

const ModalDetails = ({ data, modalDetails, setModalDetails, setModalPropsAlert, setModalAlert }) => {
    const latitudeOrigin = data.ride.origin.coordinates.latitude;
    const longitudeOrigin = data.ride.origin.coordinates.longitude;
    const latitudeDestination = data.ride.destination.coordinates.latitude;
    const longitudeDestination = data.ride.destination.coordinates.longitude;
    const mapRef = React.useRef(null);

    return (
        <Portal>
            <Modal visible={modalDetails} onDismiss={() => setModalDetails(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={{ margin: 15, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View><Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black', marginRight: 20 }}>Información del Ride</Text></View>
                            <View>
                                <Pressable onPress={() => setModalDetails(false)}>
                                    <Ionicons name="close-circle-outline" style={{ color: '#D83F20', fontSize: 40, marginTop: -5, marginLeft: 30 }} />
                                </Pressable>
                            </View>
                        </View>

                        <View>
                            {data.ride.estado !== "pendiente" && (
                                <TextInput
                                    style={{ margin: 6, height: 45, width: 260 }}
                                    mode="outlined"
                                    label={data.conductor === undefined ? "Pasajero" : "Conductor"}
                                    value={data.conductor === undefined ? cut(null, `${data.pasajero.firstName} ${data.pasajero.lastName}`) : cut(null, `${data.conductor.firstName} ${data.conductor.lastName}`)}
                                    editable={false}
                                    left={<TextInput.Icon icon="account" style={{ marginTop: 15 }} />}
                                />
                            )}
                            <TextInput
                                style={{ margin: 6, height: 45, width: 260 }}
                                mode="outlined"
                                label="Num Pasajeros"
                                value={`${data.ride.personas}`}
                                editable={false}
                                left={<TextInput.Icon icon="account-multiple" style={{ marginTop: 15 }} />}
                            />
                            {data.ride.estado !== "pendiente" && (
                                <TextInput
                                    style={{ margin: 6, height: 45, width: 260 }}
                                    mode="outlined"
                                    label="Cooperación"
                                    value={data.oferta.cooperacion}
                                    editable={false}
                                    left={<TextInput.Icon icon="cash-multiple" style={{ marginTop: 10 }} />}
                                />
                            )}
                            <TextInput
                                style={{ margin: 6, height: 45, width: 260 }}
                                mode="outlined"
                                label="Fecha/Hora"
                                value={formatDate(data.ride.date, 'numeric')}
                                editable={false}
                                left={<TextInput.Icon icon="calendar-clock" style={{ marginTop: 15 }} />}
                            />
                            {data.ride.estado === "pendiente" && (
                                <><TextInput
                                    style={{ margin: 6, height: 45, width: 260 }}
                                    mode="outlined"
                                    label="Tiempo aproximado del viaje"
                                    value={data.ride.informationRoute.duration.toLocaleString() + "min"}
                                    editable={false}
                                    left={<TextInput.Icon icon="map-clock" style={{ marginTop: 15 }} />}
                                />
                                    <TextInput
                                        style={{ margin: 6, height: 45, width: 260 }}
                                        mode="outlined"
                                        label="Distancia"
                                        value={data.ride.informationRoute.distance.toLocaleString() + "km"}
                                        editable={false}
                                        left={<TextInput.Icon icon="map-marker-distance" style={{ marginTop: 15 }} />}
                                    /></>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name="map" style={{ marginRight: 10, fontSize: 24 }} />
                            <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black' }}>Ruta</Text>
                        </View>
                        <View style={{ width: '100%', height: 200 }}>
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
                                    }}
                                />
                            </MapView>
                        </View>

                        {(((data.pasajero === undefined) && data.ride.estado === "en curso") ||
                            (data.conductor === undefined && data.oferta.estado === "aceptada")) && (
                                <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
                                    <Button
                                        textColor="#EE6464"
                                        style={{ width: '80%', borderWidth: 1, borderColor: '#EE6464' }}
                                        labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                        buttonColor='#F8F7F6'
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

                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalDetails