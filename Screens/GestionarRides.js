import * as React from "react";
import { useEffect, useState } from 'react'
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { AirbnbRating } from 'react-native-elements';
import { Button, Card, Text, ActivityIndicator, MD2Colors, PaperProvider, TextInput, Modal, Portal, Avatar, AntDesign } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../config-firebase';
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { useAuth } from '../context/AuthContext';
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
    textBorder: { borderBottomWidth: 2, paddingBottom: 2, fontWeight: 'bold', fontSize: 16, color: 'black' },
    text: { marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black' },
    modalView: { margin: 15, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320 },
    modalText: { marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' },
    icon: { marginRight: 10, fontSize: 24 },
    button: { borderRadius: 10, padding: 8, margin: 2, justifyContent: 'center', alignItems: 'center', width: '50%', height: 45 }
});

const GestionarRides = ({ navigation }) => {
    const { colors} = useTheme();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [indexRide, setIndexRide] = useState(null);
    const [indexOferta, setIndexOferta] = useState(null);
    const [comen, onChangeText] = useState('');
    const [score, setScore] = useState(null);
    const [modalDetails, setModalDetails] = useState(false); // Detalles del Ride
    const [modalALert, setModalAlert] = useState(false); // Cancelar Ride
    const [modalDialog, setModalDialog] = useState(false); // Notificacion Ride Cancelado
    const [modalUser, setModalUser] = useState(false); // Informacion del conductor/oferta
    const [modalOferta, setModalOferta] = useState(false); // Aceptar Oferta
    const [modalRating, setModalRating] = useState(false); // Calificar el Ride
    const [modalReview, setModalReview] = useState(false); // Evaluacion detallada

    useEffect(() => {
        const unsubscribeOfertas = db.collection('ofertas').onSnapshot(() => { getData() });
        const unsubscribeRides = db.collection('rides').onSnapshot(() => { getData() });
        const unsubscribeUsers = db.collection('users').onSnapshot(() => { getData() });

        return () => {
            if (unsubscribeOfertas && unsubscribeRides && unsubscribeUsers) {
                unsubscribeOfertas();
                unsubscribeRides();
                unsubscribeUsers();
            }
        };
    }, []);

    async function getData() {
        try {
            const ridesSnapshot = await db.collection('rides').where('pasajeroID.uid', '==', user.uid).get();
            const resultados = [];

            for (const ridesDoc of ridesSnapshot.docs) {
                const rideData = ridesDoc.data();

                if (rideData.estado === "pendiente") {
                    try {
                        const ofertasSnapshot = await db.collection('ofertas').where('rideID.id', '==', rideData.id).get();
                        const ofertas = [];

                        for (const ofertasDoc of ofertasSnapshot.docs) {
                            const ofertasData = ofertasDoc.data();
                            const driverSnapshot = await ofertasData.conductorID.reference.get();
                            const driverData = driverSnapshot.data();

                            const resultado = {
                                oferta: ofertasData,
                                conductor: driverData
                            };

                            ofertas.push(resultado);
                        }

                        const resultado = {
                            ride: rideData,
                            ofertas: ofertas
                        };

                        resultados.push(resultado);
                    } catch (error) {
                        console.error('Error al obtener las ofertas', error);
                    }

                } else {
                    const resultado = {
                        ride: rideData,
                    };

                    resultados.push(resultado);
                }
            }

            function orderByDate(a, b) {
                return b.ride.date - a.ride.date;
            }

            resultados.sort(orderByDate);

            setData(resultados);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los rides', error);
            throw error;
        }
    }

    async function deleteDoc(id) {
        var reference = db.collection("rides").doc(id);
        await reference.delete()
            .then(() => {
                console.log("Documento eliminado exitosamente");
            })
            .catch((error) => {
                console.error("Error al eliminar el documento: ", error);
            });
    }

    async function updateRating(values, id) {
        const reference = db.collection('rides').doc(id);

        try {
            const docSnapshot = await reference.get();
            if (docSnapshot.exists) {
                reference.update({
                    calificacionP_C: values
                });
            }
        } catch (error) {
            console.log('Error al actualizar', error);
        }
    }

    async function updateRide() {
        const oferta = data[indexRide].ofertas[indexOferta].oferta;
        const referenceRide = oferta.rideID.reference;
        const referenceOferta = db.collection('ofertas').doc(oferta.id);

        try {
            const docSnapshot = await referenceRide.get();
            if (docSnapshot.exists) {
                referenceRide.update({
                    estado: "en curso",
                    ofertaID: referenceOferta
                });
            }
        } catch (error) {
            console.log('Error al actualizar', error);

        }

        try {
            const docSnapshot = await referenceOferta.get();
            if (docSnapshot.exists) {
                referenceOferta.update({
                    estado: "aceptada"
                });
            }
        } catch (error) {
            console.log('Error al actualizar', error);
        }

        const ofertas = data[indexRide].ofertas;
        ofertas.splice(indexOferta, 1);

        for (const oferta of ofertas) {
            const reference = db.collection('ofertas').doc(oferta.oferta.id);

            try {
                const docSnapshot = await reference.get();
                if (docSnapshot.exists) {
                    reference.update({
                        estado: "descartada"
                    });
                }
            } catch (error) {
                console.log('Error al actualizar', error);
            }
        }
    }

    const getInfoByStatus = (status) => {
        switch (status) {
            case "en curso":
                return { color: "#B2D474", text: "Ir al chat" };
            case "finalizado":
                return { color: "#EEBF55", text: "Calificar" };
            default:
                return { color: "#EE6464", text: "Cancelar" };
        }
    }

    const getInfoMedal = (num) => {
        if (num >= 100) {
            return "#E6BB3F";
        } else if (num >= 50) {
            return "#AAA499";
        } else if (num >= 30) {
            return "#BA9248";
        }
    }

    const cutDirection = (direction) => {
        switch (direction) {
            case "Instituto Tecnologico Superior del Sur de Guanajuato":
                return "ITSUR";
            default:
                const arreglo = direction.split(',', 3);
                return `${arreglo[0]}, ${arreglo[1]}, ${arreglo[2]}`;
        }
    }

    function formatDate(timestamp, monthType) {
        var fecha = new Date(timestamp?.seconds * 1000);
        var opcionesFormato = {
            year: 'numeric',
            month: monthType,
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }
        return fecha.toLocaleString('es-ES', opcionesFormato);
    }

    const CardOferta = ({ parentIndex, item, index }) => {
        return (
            <Card
                key={parentIndex + 0.1}
                style={{ width: 290, borderRadius: 18, margin: 6, backgroundColor: '#F8F7F6', borderWidth: 1, borderColor: "green", height: 70, marginLeft: 20 }}
                onPress={() => { setIndexOferta(index); setIndexRide(parentIndex); setModalUser(true); }}>
                <Card.Content>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name="person" style={{ fontSize: 21, paddingTop: 6, marginRight: 6 }} />
                            <Text style={styles.text}>{`${item.conductor.firstName} ${item.conductor.lastName}`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginLeft: 90 }}>
                            <Text style={{ color: 'black', marginRight: 5, fontSize: 22, fontWeight: 'bold' }}>$</Text>
                            <Text style={styles.text}>{item.oferta.cooperacion}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        )
    }

    return (
        <PaperProvider>
            <View style={[styles.container, { alignItems: 'center' }, {backgroundColor: colors.background}]}>
                {!isLoading ? (
                    <>
                        <FlatList
                            data={data}
                            renderItem={({ item, index }) => {
                                const parentIndex = index;
                                return (
                                    <Card
                                        key={index}
                                        style={{ width: 360, borderRadius: 8, margin: 8, padding: 8, backgroundColor: "#F8F7F6" }} >
                                        <Card.Content>
                                            <Text variant="titleLarge" style={[styles.textBorder, { borderBottomColor: getInfoByStatus(item.ride.estado).color }]}>{item.ride.estado.toUpperCase()}</Text>

                                            <View style={{ flexDirection: 'row', width: 300 }}>
                                                <Ionicons name="location-sharp" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                                <Text style={styles.text}>
                                                    Ruta {'\n'}
                                                    <Text style={{ fontWeight: 'bold', color: '#171717' }}>Inicio:</Text> {cutDirection(item.ride.origin.direction)} {'\n'}
                                                    <Text style={{ fontWeight: 'bold', color: '#171717' }}>Destino:</Text> {cutDirection(item.ride.destination.direction)}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Ionicons name="calendar" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                                <Text style={styles.text}>{formatDate(item.ride.date, 'long')}</Text>
                                            </View>

                                            {/* OFERTAS */}
                                            {item.ride.estado === "pendiente" && (
                                                <>
                                                    {item.ofertas.length === 0 ? (
                                                        <View style={{ width: 310 }}>
                                                            <Text variant="titleLarge" style={{ marginLeft: 20, marginTop: 10, paddingBottom: 5, fontWeight: 'bold', fontSize: 16, color: 'black' }}>SIN OFERTAS</Text>
                                                        </View>
                                                    ) : (
                                                        <View style={{ width: 310 }}>
                                                            <Text variant="titleLarge" style={[styles.textBorder, { borderBottomColor: "#B2D474", marginLeft: 20, marginTop: 10 }]}>OFERTAS</Text>
                                                        </View>
                                                    )}

                                                    <>
                                                        <FlatList
                                                            data={item.ofertas}
                                                            renderItem={({ item, index }) => (
                                                                <><CardOferta parentIndex={parentIndex} item={item} index={index} /></>)}
                                                        />
                                                    </>
                                                </>)}
                                        </Card.Content>

                                        <Card.Actions>
                                            <Button textColor="black" style={{ width: 130 }} labelStyle={{ fontWeight: 'bold', fontSize: 14 }}
                                                onPress={() => { setIndexRide(index); setModalDetails(true); }}>Ver Detalles</Button>
                                            <Button buttonColor={getInfoByStatus(item.ride.estado).color} textColor="white" style={{ width: 130 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                onPress={() => {
                                                    setIndexRide(index);
                                                    {
                                                        switch (item.ride?.estado) {
                                                            case "aceptada":
                                                                navigation.navigate('ChatScreen');
                                                                break;
                                                            case "finalizado":
                                                                setModalRating(true); setScore(item.ride.calificacionP_C?.puntaje); onChangeText(item.ride.calificacionP_C?.comentario);
                                                                break;
                                                            default:
                                                                setModalAlert(true);
                                                                break;
                                                        }
                                                    }
                                                }}> {item.ride.calificacionP_C === undefined ? getInfoByStatus(item.ride.estado).text : `${item.ride.calificacionP_C.puntaje} `}
                                                {item.ride.calificacionP_C !== undefined && <Ionicons name="star" style={{ fontSize: 15 }} />} </Button>
                                        </Card.Actions>
                                    </Card>
                                );
                            }}
                        />

                        {modalDetails && (
                            <Portal>
                                <Modal visible={modalDetails} onDismiss={() => setModalDetails(false)} contentContainerStyle={{ flex: 1 }}>
                                    <View style={styles.centeredView}>
                                        <View style={styles.modalView}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View><Text style={[styles.modalText, { marginRight: 20 }]}>Información del Ride</Text></View>
                                                <View>
                                                    <Pressable onPress={() => setModalDetails(false)}>
                                                        <Ionicons name="close-circle-outline" style={{ color: '#D83F20', fontSize: 40, marginTop: -5, marginLeft: 30 }} />
                                                    </Pressable>
                                                </View>
                                            </View>

                                            <View>
                                                {data[indexRide].ride.estado !== "pendiente" && (
                                                    <TextInput
                                                        style={{ margin: 6, height: 45, width: 260 }}
                                                        mode="outlined"
                                                        label="Conductor"
                                                        value={`${data[indexRide].ofertas[indexOferta].conductor.firstName} ${data[indexRide].ofertas[indexOferta].conductor.lastName}`}
                                                        editable={false}
                                                        left={<TextInput.Icon icon="account" style={{ marginTop: 15 }} />}
                                                    />
                                                )}
                                                <TextInput
                                                    style={{ margin: 6, height: 45, width: 260 }}
                                                    mode="outlined"
                                                    label="Num Pasajeros"
                                                    value={`${data[indexRide].ride.personas}`}
                                                    editable={false}
                                                    left={<TextInput.Icon icon="account-multiple" style={{ marginTop: 15 }} />}
                                                />
                                                {data[indexRide].ride.estado !== "pendiente" && (
                                                    <TextInput
                                                        style={{ margin: 6, height: 45, width: 260 }}
                                                        mode="outlined"
                                                        label="Cooperación"
                                                        value={data[indexRide].ofertas[indexOferta].oferta.cooperacion}
                                                        editable={false}
                                                        left={<TextInput.Icon icon="cash-multiple" style={{ marginTop: 10 }} />}
                                                    />
                                                )}
                                                <TextInput
                                                    style={{ margin: 6, height: 45, width: 260 }}
                                                    mode="outlined"
                                                    label="Fecha/Hora"
                                                    value={formatDate(data[indexRide].ride.date, 'numeric')}
                                                    editable={false}
                                                    left={<TextInput.Icon icon="calendar-clock" style={{ marginTop: 15 }} />}
                                                />
                                                {data[indexRide].ride.estado === "pendiente" && (
                                                    <><TextInput
                                                        style={{ margin: 6, height: 45, width: 260 }}
                                                        mode="outlined"
                                                        label="Tiempo aproximado del viaje"
                                                        value={data[indexRide].ride.informationRoute.duration.toLocaleString() + "min"}
                                                        editable={false}
                                                        left={<TextInput.Icon icon="map-clock" style={{ marginTop: 15 }} />}
                                                    />
                                                        <TextInput
                                                            style={{ margin: 6, height: 45, width: 260 }}
                                                            mode="outlined"
                                                            label="Distancia"
                                                            value={data[indexRide].ride.informationRoute.distance.toLocaleString() + "km"}
                                                            editable={false}
                                                            left={<TextInput.Icon icon="map-marker-distance" style={{ marginTop: 15 }} />}
                                                        /></>
                                                )}
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Ionicons name="map" style={styles.icon} />
                                                <Text style={styles.text}>Ruta</Text>
                                            </View>
                                            <View style={{ width: '100%', height: 200 }}>
                                                <MapView
                                                    provider={PROVIDER_GOOGLE}
                                                    style={styles.map}
                                                    initialRegion={{
                                                        latitude: data[indexRide].ride.origin.coordinates.latitude,
                                                        longitude: data[indexRide].ride.origin.coordinates.longitude,
                                                        latitudeDelta: 0.04,
                                                        longitudeDelta: 0.04,
                                                    }}
                                                >
                                                    <Marker
                                                        title="Punto Encuentro"
                                                        coordinate={{ latitude: data[indexRide].ride.origin.coordinates.latitude, longitude: data[indexRide].ride.origin.coordinates.longitude }} />
                                                    <Marker
                                                        title="Punto Destino"
                                                        coordinate={{ latitude: data[indexRide].ride.destination.coordinates.latitude, longitude: data[indexRide].ride.destination.coordinates.longitude }} />
                                                    <MapViewDirections
                                                        origin={{ latitude: data[indexRide].ride.origin.coordinates.latitude, longitude: data[indexRide].ride.origin.coordinates.longitude }}
                                                        destination={{ latitude: data[indexRide].ride.destination.coordinates.latitude, longitude: data[indexRide].ride.destination.coordinates.longitude }}
                                                        apikey={GOOGLE_MAPS_API_KEY}
                                                        mode="DRIVING"
                                                        strokeWidth={3}
                                                        strokeColor="green"
                                                    />
                                                </MapView>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </Portal>
                        )}

                        <Portal>
                            <Modal visible={modalALert} onDismiss={() => setModalAlert(false)} contentContainerStyle={{ flex: 1 }}>
                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="warning" style={{ marginRight: 6, fontSize: 70, color: "#FFC300" }}></Ionicons>
                                            <Text style={[styles.modalText, { fontSize: 18 }]}>CANCELAR RIDE</Text>
                                            <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>¿Estas seguro de que deseas eliminar tu ride?</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Button mode="contained" buttonColor='#EE6464' style={{ width: 140 }}
                                                onPress={() => { deleteDoc(data[indexRide].ride.id); setModalAlert(false); setModalDialog(true); }}> SI </Button>
                                            <Button mode="contained" buttonColor='#B0B0B0' style={{ width: 140 }}
                                                onPress={() => setModalAlert(false)}> NO </Button>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        </Portal>

                        <Portal>
                            <Modal visible={modalDialog} onDismiss={() => setModalDialog(false)} contentContainerStyle={{ flex: 1 }}>
                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#EE6464" }}></Ionicons>
                                            <Text style={[styles.modalText, { fontSize: 18 }]}>RIDE CANCELADO</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                            <Button mode="contained" buttonColor='#B0B0B0' style={{ width: '90%' }}
                                                onPress={() => setModalDialog(false)}> OK </Button>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        </Portal>

                        {modalUser && (
                            <Portal>
                                <Modal visible={modalUser} onDismiss={() => setModalUser(false)} contentContainerStyle={{ flex: 1 }} >
                                    <View style={styles.centeredView}>
                                        <View style={styles.modalView}>
                                            <Text style={styles.modalText}>Información de la oferta</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
                                                <View><Avatar.Image size={90} source={require('../assets/PerfilImage.jpg')} /></View>
                                                <View style={{ marginStart: 10 }}>
                                                    <Text style={[styles.text, { textAlign: 'center' }]}>{`${data[indexRide].ofertas[indexOferta].conductor.firstName} \n ${data[indexRide].ofertas[indexOferta].conductor.lastName}`}</Text>

                                                    {/* CALIFICACION GENERAL */}
                                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: -10 }}>
                                                        {Array.from({ length: data[indexRide].ofertas[indexOferta].conductor.califConductor }).map((_, index) => (
                                                            <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#FFC107" }} />
                                                        ))}
                                                        {Array.from({ length: 5 - data[indexRide].ofertas[indexOferta].conductor.califConductor }).map((_, index) => (
                                                            <Ionicons key={index} name="star" style={{ marginRight: 4, fontSize: 20, color: "#8C8A82" }} />
                                                        ))}
                                                    </View>

                                                    {/* INSIGNIAS */}
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        {data[indexRide].ofertas[indexOferta].conductor.numRidesConductor >= 30 && (
                                                            <MaterialCommunityIcons name="medal" style={{ fontSize: 30 }} color={getInfoMedal(data[indexRide].ofertas[indexOferta].conductor.numRidesConductor)} />
                                                        )}
                                                        {data[indexRide].ofertas[indexOferta].conductor.licencia !== "ninguna" && (
                                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                                <MaterialCommunityIcons name="card-account-details-star" style={{ fontSize: 28 }} />
                                                            </View>
                                                        )}
                                                        {data[indexRide].ofertas[indexOferta].conductor.tarjetaCirculacion && (
                                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                                <MaterialCommunityIcons name="credit-card-check" style={{ fontSize: 30 }} />
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>

                                            {data[indexRide].ofertas[indexOferta].comentario !== null && (
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Ionicons name="chatbubbles" style={styles.icon} />
                                                    <Text style={styles.text}>{data[indexRide].ofertas[indexOferta].oferta.comentario}</Text>
                                                </View>
                                            )}

                                            <View style={{ flexDirection: 'row' }}>
                                                <Ionicons name="cash" style={styles.icon} />
                                                <Text style={styles.text}>{data[indexRide].ofertas[indexOferta].oferta.cooperacion}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Button icon="check" mode="contained" buttonColor='#B2D474' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                    onPress={() => { setModalUser(false); setModalOferta(true); }}> Aceptar </Button>
                                                <Button icon="close" mode="contained" buttonColor='#EE6464' style={{ width: 135 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                    onPress={() => setModalUser(false)}> Cerrar</Button>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </Portal>
                        )}

                        <Portal>
                            <Modal visible={modalOferta} onDismiss={() => setModalOferta(false)} contentContainerStyle={{ flex: 1 }}>
                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <AntDesign name="like2" style={{ fontSize: 50 }} color='green' />
                                            <Text style={[styles.modalText, { fontSize: 18, marginTop: 12 }]}>ACEPTAR OFERTA</Text>
                                            <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>El conductor recibirá la notificación de que su oferta fue aceptada y pueden iniciar el viaje</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Button mode="contained" buttonColor='#B2D474' style={{ width: 140 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                onPress={() => { setModalOferta(false); updateRide(); }}> Aceptar </Button>
                                            <Button mode="contained" buttonColor='#EE6464' style={{ width: 140 }} labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                                                onPress={() => setModalOferta(false)}> Cancelar </Button>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        </Portal>

                        {modalRating && (
                            <Portal>
                                <Modal visible={modalRating} onDismiss={() => setModalRating(false)} contentContainerStyle={{ flex: 1 }} >
                                    <View style={styles.centeredView}>
                                        <View style={[styles.modalView, { padding: 20 }]}>
                                            <Text style={[styles.modalText, { textAlign: 'center' }]}>Califica tu experiencia</Text>
                                            <AirbnbRating
                                                count={5}
                                                reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                                                defaultRating={score}
                                                size={30}
                                                onFinishRating={setScore}
                                            />
                                            <TextInput
                                                style={{ margin: 7, height: 100, marginTop: 15 }}
                                                mode="outlined"
                                                label="Comentarios"
                                                multiline={true}
                                                value={comen}
                                                onChangeText={onChangeText}
                                                theme={{ colors: { text: 'green', primary: 'green' } }}
                                            />
                                            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                                                <Button mode="contained" buttonColor='#B2D474' style={{ width: 135 }}
                                                    onPress={() => { updateRating({ puntaje: score, comentario: comen }, data[indexRide].ride.id); setModalRating(false); }}> Guardar </Button>
                                                <Button mode="contained" buttonColor='#B0B0B0' style={{ width: 135 }}
                                                    onPress={() => setModalRating(false)} > Cancelar </Button>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </Portal>
                        )}

                        {/*{modalReview && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalReview}
                                onRequestClose={() => {
                                    setModalRating(!modalReview); setShowOverlay(!showOverlay);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 20 }]}>
                                        <Text style={[styles.modalText, { textAlign: 'center' }]}>Califica los siguientes aspectos del pasajero</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.text}>Puntual</Text>
                                            <AirbnbRating
                                                count={5}
                                                reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                                                defaultRating={score}
                                                size={30}
                                                //onFinishRating={setScore}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.text}>Confiable</Text>
                                            <AirbnbRating
                                                count={5}
                                                reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                                                defaultRating={score}
                                                size={30}
                                                //onFinishRating={setScore}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.text}>Cooperación</Text>
                                            <AirbnbRating
                                                count={5}
                                                reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                                                defaultRating={score}
                                                size={30}
                                                //onFinishRating={setScore}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.text}>Chismesito</Text>
                                            <AirbnbRating
                                                count={5}
                                                reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                                                defaultRating={score}
                                                size={30}
                                                //onFinishRating={setScore}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.text}>Nice</Text>
                                            <AirbnbRating
                                                count={5}
                                                reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                                                defaultRating={score}
                                                size={30}
                                                //onFinishRating={setScore}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#B2D474' }]}
                                                onPress={() => {
                                                    updateData({ puntaje: score, comentario: comen }, data[index].oferta?.rideID);
                                                    setModalRating(!modalRating); setShowOverlay(!showOverlay);
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Enviar</Text>
                                                </View>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#B0B0B0' }]}
                                                onPress={() => { setModalRating(false); setShowOverlay(false); }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Cancelar</Text>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>)} */}
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

export default GestionarRides;