import * as React from "react";
import { useEffect, useState } from 'react'
import * as Location from "expo-location";
import { View, StyleSheet } from "react-native";
import { PaperProvider, ActivityIndicator, MD2Colors, Text } from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { db, firebase } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { GeoFirestore } from 'geofirestore';
import { useTheme } from "../../hooks/ThemeContext";
import { subscribeToRides } from '../../firebaseSubscriptions';
import ModalInfoRide from "./components/ModalInfoRide";
import ModalOfertaDetails from "./components/ModalOfertaDetails";
import ModalDialog from "../GestionarScreens/components/ModalDialog";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    }
});

const RidesMap = ({ navigation }) => {
    const { colors } = useTheme()
    const { user } = useAuth();
    const [origin, setOrigin] = useState(null);
    const [data, setData] = useState([]);
    const [index, setIndex] = useState([]);
    const [modalInfoRide, setModalInfoRide] = useState(false);
    const [modalDetails, setModalDetails] = useState(false);
    const [modalDialog, setModalDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribeRides = subscribeToRides(() => { getRides() });

        return () => {
            unsubscribeRides();
        };
    }, []);

    async function getLocationPermission() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied");
            return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        return coords;
    }

    async function getRides() {
        const coords = await getLocationPermission();
        setOrigin({ lat: coords.latitude, lng: coords.longitude });

        const geoFirestore = new GeoFirestore(db);
        const locationsCollection = geoFirestore.collection('rides');
        const center = new firebase.firestore.GeoPoint(coords.latitude, coords.longitude);
        const radiusInKm = 4;
        const query = locationsCollection.near({ center, radius: radiusInKm });

        try {
            query.get().then(async (snapshot) => {
                const resultados = [];
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    if (data.estado === "pendiente") {
                        const passengerRef = data.pasajeroID.reference;
                        try {
                            const passengerSnapshot = await passengerRef.get();
                            if (passengerSnapshot.exists) {
                                const passengerData = passengerSnapshot.data();

                                const resultado = {
                                    ride: data,
                                    pasajero: passengerData
                                };
                                resultados.push(resultado);
                            } else {
                                console.log('El documento del pasajero no existe.');
                            }
                        } catch (error) {
                            console.error('Error al obtener el documento del pasajero:', error);
                        }
                    }
                }

                setData(resultados);
                setIsLoading(false);
            });
        } catch (error) {
            console.error('Error al obtener los documentos:', error);
        }
    }

    return (
        <PaperProvider>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {!isLoading ? (
                    <><MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={{
                            latitude: origin?.lat,
                            longitude: origin?.lng,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        {data.map((m, index) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: m.ride.origin.coordinates?.latitude, longitude: m.ride.origin.coordinates?.longitude }}
                                onPress={() => { setIndex(index); setModalInfoRide(true); }} />
                        ))}
                    </MapView>

                        {modalInfoRide && (
                            <ModalInfoRide
                                data={data[index]}
                                modalInfoRide={modalInfoRide}
                                setModalInfoRide={setModalInfoRide}
                                setModalDetails={setModalDetails}
                            />
                        )}

                        {modalDetails && (
                            <ModalOfertaDetails
                                ride={data[index].ride}
                                //email={user.email}
                                //uid={user.uid}
                                modalDetails={modalDetails}
                                setModalDetails={setModalDetails}
                                setModalAlert={setModalDialog}
                            />
                        )}

                        {modalDialog && (
                            <ModalDialog
                                icon={'checkmark-circle-outline'}
                                color={"#81BC12"}
                                title={'SOLICITUD ENVIADA'}
                                type={'Te notificaremos cuando el pasajero confirme el ride'}
                                modalDialog={modalDialog}
                                setModalDialog={setModalDialog}
                            />
                        )}

                    </>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 }}>
                        <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
                        <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
                    </View>
                )}
            </View>
        </PaperProvider >
    )
}

export default RidesMap;