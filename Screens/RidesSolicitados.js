import * as React from "react";
import { useEffect, useState } from 'react'
import * as Location from "expo-location";
import { Text, Modal, Pressable, View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, PaperProvider, ActivityIndicator, MD2Colors } from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db, firebase } from '../config-firebase';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { GeoFirestore } from 'geofirestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from "../hooks/ThemeContext";

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
    button: { borderRadius: 10, padding: 8, margin: 2, justifyContent: 'center', alignItems: 'center', width: '50%' },
    buttonOpen: { backgroundColor: '#479B3B', marginLeft: -3.5 },
    buttonClose: { backgroundColor: '#D83F20' },
    textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 20 },
    modalText: { marginBottom: 15, fontWeight: 'bold', fontSize: 20 },
    text: { marginBottom: 15, fontSize: 20 },
    iconWhite: { marginRight: 5, color: 'white', fontSize: 24 },
    icon: { marginRight: 10, fontSize: 24 },
    iconRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: -10 },
    overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }
});

const RidesSolicitados = ({ navigation }) => {
    const { colors } = useTheme()
    const { user } = useAuth();
    const [origin, setOrigin] = useState(null);
    const [data, setData] = useState([]);
    const [index, setIndex] = useState([]);
    const [modalUser, setModalUser] = useState(false);
    const [modalDetails, setModalDetails] = useState(false);
    const [modalALert, setModalAlert] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribeOfertas = db.collection('users').onSnapshot(() => { getRides() });
        const unsubscribeRides = db.collection('rides').onSnapshot(() => { getRides() });

        return () => {
            if (unsubscribeOfertas && unsubscribeRides) {
                unsubscribeOfertas();
                unsubscribeRides();
            }
        };
    }, []);

    async function getLocationPermission() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied");
            return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        //setOrigin({ lat: coords.latitude, lng: coords.longitude });
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
                //console.log(resultados);
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
                rideID: { reference: db.collection('rides').doc(data[index].ride?.id), id: data[index].ride?.id },
                pasajeroID: data[index].ride?.pasajeroID,
                conductorID: { reference: db.collection('users').doc(user.email), uid: user.uid },
                ...values
            })
        } catch (error) {
            console.log("Error al guardar", error)
        }
    }

    function formatDate(timestamp) {
        var fecha = new Date(timestamp?.seconds * 1000);
        var opcionesFormato = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };
        return fecha.toLocaleString('es-ES', opcionesFormato);
    }

    const validationSchema = Yup.object().shape({
        cooperacion: Yup.number()
            .typeError('Debe ser un número')
            .integer('Debe ser un número entero')
            .max(50, 'Debe ser menor o igual a 50')
            .min(0, 'Si no deseas cobrar el ride, escribe un cero')
            .required('Este campo es obligatorio'),
        comentario: Yup.string(),
    });

    const getInfoMedal = (num) => {
        if (num >= 100) {
            return "#E6BB3F";
        } else if (num >= 50) {
            return "#AAA499";
        } else if (num >= 30) {
            return "#BA9248";
        }
    }

    return (
        <PaperProvider>
            <View style={[styles.container, {backgroundColor: colors.background}]}>
                {!isLoading ? (
                    <><MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={{
                            latitude: origin?.lat,
                            longitude: origin?.lng,
                            latitudeDelta: 0.003,
                            longitudeDelta: 0.003,
                        }}
                    >
                        {data.map((m, index) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: m.ride.origin.coordinates?.latitude, longitude: m.ride.origin.coordinates?.longitude }}
                                onPress={() => { setIndex(index); setShowOverlay(true); setModalUser(true); }} />
                        ))}
                    </MapView>

                        {showOverlay && (
                            <TouchableOpacity
                                style={styles.overlay}
                                activeOpacity={1}
                            />
                        )}

                        {modalUser && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalUser}
                                onRequestClose={() => {
                                    setModalUser(!modalUser); setShowOverlay(false);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <Text style={styles.modalText}>Información del Ride</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
                                            <View><Avatar.Image size={80} source={require('../assets/PerfilImage.jpg')} /></View>
                                            <View style={{ marginStart: 10 }}>
                                                <View style={{ flexDirection: 'row'}}>
                                                    {/* INSIGNIA */}
                                                    {data[index].pasajero?.numRidesPasajero >= 30 && (
                                                        <MaterialCommunityIcons name="medal" style={{ fontSize: 30 }} color={getInfoMedal(data[index].pasajero?.numRidesPasajero)} />
                                                    )}
                                                    <Text style={styles.text}>{`${data[index].pasajero?.firstName} ${data[index].pasajero?.lastName}`}</Text>
                                                </View>
                                                {/* CALIFICACION GENERAL */}
                                                <View style={styles.iconRow}>
                                                    {Array.from({ length: data[index].pasajero?.califPasajero }).map((_, index) => (
                                                        <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#FFC107" }} />
                                                    ))}
                                                    {Array.from({ length: 5 - data[index].pasajero?.califPasajero }).map((_, index) => (
                                                        <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#8C8A82" }} />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Ionicons name="time" style={styles.icon} />
                                                <Text style={styles.text}>{formatDate(data[index].ride?.date)}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Ionicons name="person" style={[styles.icon, { marginLeft: 30 }]} />
                                                <Text style={styles.text}>{data[index].ride?.personas}</Text>
                                            </View>
                                        </View>

                                        {data[index].ride.comentarios !== null && (
                                            <View style={{ flexDirection: 'row' }}>
                                                <Ionicons name="chatbubbles" style={styles.icon} />
                                                <Text style={styles.text}>{data[index].ride?.comentarios}</Text>
                                            </View>
                                        )}

                                        <View style={{ flexDirection: 'row' }}>
                                            <Ionicons name="location-sharp" style={styles.icon} />
                                            <Text style={styles.text}>{`Ruta \n Inicio: ${data[index].ride.origin?.direction} \n Destino: ${data[index].ride.destination?.direction}`}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <Pressable onPress={() => console.log('hacer algo')}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ marginBottom: 10, fontSize: 15, borderBottomWidth: 1, borderBottomColor: 'gray', color: 'gray' }}>Ver detalles</Text>
                                                </View>
                                            </Pressable>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Pressable
                                                style={[styles.button, styles.buttonOpen]}
                                                onPress={() => { setModalUser(false); setModalDetails(true); }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Ionicons name="checkmark-circle" style={styles.iconWhite} />
                                                    <Text style={styles.textStyle}>Ofrecer</Text>
                                                </View>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.button, styles.buttonClose]}
                                                onPress={() => { setModalUser(false); setShowOverlay(false); }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Ionicons name="close-circle" style={styles.iconWhite} />
                                                    <Text style={styles.textStyle}>Cancelar</Text>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>)}

                        {modalDetails && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalDetails}
                                onRequestClose={() => {
                                    setModalDetails(!modalDetails); setShowOverlay(false);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <Text style={styles.modalText}>Detalles del Ride</Text>

                                        <Formik
                                            initialValues={{
                                                cooperacion: null,
                                                comentario: '',
                                            }}
                                            validateOnMount={true}
                                            validationSchema={validationSchema}
                                            onSubmit={(values) => { setValues(values) }}
                                        >
                                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
                                                <View>
                                                    <TextInput
                                                        style={{ margin: 7, height: 60 }}
                                                        mode="outlined"
                                                        label="Cooperación voluntaria"
                                                        value={values.cooperacion}
                                                        onChangeText={handleChange('cooperacion')}
                                                        onBlur={handleBlur('cooperacion')}
                                                        keyboardType='numeric'
                                                        theme={{ colors: { text: 'green', primary: 'green' } }}
                                                    />
                                                    {touched.cooperacion && errors.cooperacion && <Text style={{ color: 'red' }}>{errors.cooperacion}</Text>}

                                                    <TextInput
                                                        style={{ margin: 7, height: 100 }}
                                                        mode="outlined"
                                                        label="Comentarios"
                                                        value={values.comentario}
                                                        multiline={true}
                                                        onChangeText={handleChange('comentario')}
                                                        onBlur={handleBlur('comentario')}
                                                        theme={{ colors: { text: 'green', primary: 'green' } }}
                                                    />
                                                    {touched.comentario && errors.comentario && <Text style={{ color: 'red' }}>{errors.comentario}</Text>}

                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Pressable
                                                            style={[styles.button, styles.buttonOpen]}
                                                            disabled={!isValid}
                                                            onPress={() => { handleSubmit(); setModalDetails(false); setModalAlert(true); }}>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <Ionicons name="checkmark-circle" style={styles.iconWhite} />
                                                                <Text style={styles.textStyle}>Ofrecer</Text>
                                                            </View>
                                                        </Pressable>
                                                        <Pressable
                                                            style={[styles.button, styles.buttonClose]}
                                                            onPress={() => { setModalDetails(!modalDetails); setShowOverlay(false); }}>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <Ionicons name="close-circle" style={styles.iconWhite} />
                                                                <Text style={styles.textStyle}>Cancelar</Text>
                                                            </View>
                                                        </Pressable>
                                                    </View>
                                                </View>)}
                                        </Formik>
                                    </View>
                                </View>
                            </Modal>)}

                        {modalALert && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalALert}
                                onRequestClose={() => {
                                    setModalAlert(!modalALert); setShowOverlay(false);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#81BC12" }}></Ionicons>
                                            <Text style={[styles.modalText, { fontSize: 18 }]}>SOLICITUD ENVIADA</Text>
                                            <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>Te notificaremos cuando el pasajero confirme el ride</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#B0B0B0' }]}
                                                onPress={() => { navigation.navigate('GestionarOfertas') }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Ver Ofertas</Text>
                                                </View>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#BEE27B' }]}
                                                onPress={() => { setModalAlert(false); setShowOverlay(false); }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Ok</Text>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>)}</>

                ) : (
                    <View style={styles.centeredView}>
                        <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
                        <Text style={{ color: "black", marginTop: 40 }}>Cargando...</Text>
                    </View>
                )}
            </View>
        </PaperProvider>
    )
}

export default RidesSolicitados;