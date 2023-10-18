import * as React from "react";
import { useEffect, useState } from 'react'
import * as Location from "expo-location";
import { View, StyleSheet } from "react-native";
import { PaperProvider, ActivityIndicator, MD2Colors, Modal, Portal, Text, Button } from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db, firebase } from '../../config-firebase';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { GeoFirestore } from 'geofirestore';
import { useTheme } from "../../hooks/ThemeContext";
import { subscribeToRides } from '../../firebaseSubscriptions';
import ModalInfoRide from "./components/ModalInfoRide";
import ModalOfertaDetails from "./components/ModalOfertaDetails";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: 320 },
    textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 20 },
    modalText: { marginBottom: 15, fontWeight: 'bold', fontSize: 20 },
    text: { marginBottom: 15, fontSize: 20 },
    iconWhite: { marginRight: 5, color: 'white', fontSize: 24 },
    icon: { marginRight: 10, fontSize: 24 },
});

const RidesMap = ({ navigation }) => {
    const { colors } = useTheme()
    const { user } = useAuth();
    const [origin, setOrigin] = useState(null);
    const [data, setData] = useState([]);
    const [index, setIndex] = useState([]);
    const [modalInfoRide, setModalInfoRide] = useState(false);
    const [modalDetails, setModalDetails] = useState(false);
    const [modalAlert, setModalAlert] = useState(false);
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

    async function setValues(values) {
        setModalDetails(false);

        try {
            const docRef = db.collection('ofertas').doc();
            return await docRef.set({
                id: docRef.id,
                fechaSolicitud: new Date(),
                estado: 'pendiente',
                rideID: { reference: db.collection('rides').doc(data[index].ride.id), id: data[index].ride.id },
                pasajeroID: data[index].ride.pasajeroID,
                conductorID: { reference: db.collection('users').doc(user.email), uid: user.uid },
                ...values
            })
        } catch (error) {
            console.log("Error al guardar", error)
        }
    }

    const validationSchema = Yup.object().shape({
        cooperacion: Yup.number()
            .typeError('Debe ser un número')
            .integer('Debe ser un número entero')
            .max(50, 'Debe ser menor o igual a 50')
            .min(0, 'Si no deseas cobrar el ride, escribe un cero')
            .required('Este campo es obligatorio'),
        comentario: Yup.string(),
    })

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
                                modalDetails={modalDetails}
                                setModalDetails={setModalDetails}
                                setModalAlert={setModalAlert}
                            />
                        )}

                        <Portal>
                            <Modal visible={modalAlert} onDismiss={() => setModalAlert(false)} contentContainerStyle={{ flex: 1 }}>
                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#81BC12" }}></Ionicons>
                                            <Text style={[styles.modalText, { fontSize: 18 }]}>SOLICITUD ENVIADA</Text>
                                            <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>Te notificaremos cuando el pasajero confirme el ride</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Button mode="contained" buttonColor='#B0B0B0' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                onPress={() => navigation.navigate('GestionarOfertas')}> Ver Ofertas </Button>
                                            <Button mode="contained" buttonColor='#B2D474' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                onPress={() => setModalAlert(false)} > Ok </Button>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        </Portal>
                    </>
                ) : (
                    <View style={styles.centeredView}>
                        <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
                        <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
                    </View>
                )}
            </View>
        </PaperProvider >
    )
}

export default RidesMap;