import * as React from "react";
import { View, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList } from "react-native";
import { AirbnbRating } from 'react-native-elements';
import { Button, Card, Text, ActivityIndicator, MD2Colors, PaperProvider, TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { firebase } from '../config-firebase';
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";

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
    textBorder: { borderBottomWidth: 2, paddingBottom: 5, fontWeight: 'bold', fontSize: 16, color: 'black' },
    text: { marginBottom: 10, paddingTop: 6, fontSize: 15, color: 'black' },
    overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 15, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320 },
    modalText: { marginBottom: 15, fontWeight: 'bold', fontSize: 20, color: 'black' },
    icon: { marginRight: 10, fontSize: 24 },
    button: { borderRadius: 10, padding: 8, margin: 2, justifyContent: 'center', alignItems: 'center', width: '50%', height: 45 }
});

const RidesConductor = ({ navigation }) => {

    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState([]);
    const [index, setIndex] = React.useState(null);
    const [comen, onChangeText] = React.useState('');
    const [score, setScore] = React.useState(null);
    const [showOverlay, setShowOverlay] = React.useState(false);
    const [modalDetails, setModalDetails] = React.useState(false);
    const [modalALert, setModalAlert] = React.useState(false);
    const [modalDialog, setModalDialog] = React.useState(false);
    const [modalRating, setModalRating] = React.useState(false);

    React.useEffect(() => {
        const unsubscribeOfertas = firebase.firestore().collection('ofertas').onSnapshot(() => { getData('id123') });
        const unsubscribeRides = firebase.firestore().collection('rides').onSnapshot(() => { getData('id123') });

        return () => {
            if (unsubscribeOfertas && unsubscribeRides) {
                unsubscribeOfertas();
                unsubscribeRides();
            }
        };
    }, []);

    async function getData(id) {
        try {
            const ofertasSnapshot = await firebase.firestore().collection('ofertas').where('idConductor', '==', id).get();
            const resultados = [];

            for (const ofertasDoc of ofertasSnapshot.docs) {
                const ofertasData = ofertasDoc.data();
                const rideSnapshot = await ofertasData.rideID.get();
                const rideData = rideSnapshot.data();
                const passengerSnapshot = await ofertasData.pasajeroID.get();
                const passengerData = passengerSnapshot.data();

                const resultado = {
                    oferta: ofertasData,
                    ride: rideData,
                    pasajero: passengerData
                };

                resultados.push(resultado);
            }

            function orderByDate(a, b) {
                return b.oferta.fechaSolicitud - a.oferta.fechaSolicitud;
            }

            resultados.sort(orderByDate);

            setData(resultados);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener las publicaciones:', error);
            throw error;
        }
    }

    //CHECAR COMO SE GUARDA EL ID EN LA BD (por el momento se esta guardando como referencia)
    async function deleteDoc(id) {
        //var reference = firebase.firestore().collection("ofertas").doc(id);
        await id.delete()
            .then(() => {
                console.log("Documento eliminado exitosamente");
            })
            .catch((error) => {
                console.error("Error al eliminar el documento: ", error);
            });
    }

    async function updateData(values, reference) {
        try {
            const docSnapshot = await reference.get();
            if (docSnapshot.exists) {
                reference.update({
                    calificacionC_P: values
                });
            }
        } catch (error) {
            console.log('Error al actualizar', error);
        }
    }

    const getInfoByStatus = (status) => {
        switch (status) {
            case "aceptada":
                return { color: "#BEE27B", text: "Ir al chat" };
            case "finalizada":
                return { color: "#EEBF55", text: "Calificar" };
            default:
                return { color: "#EE6464", text: "Cancelar" };
        }
    };

    function formatDate(timestamp, monthType) {
        //console.log("formatDate")
        var fecha = new Date(timestamp?.seconds * 1000);
        var opcionesFormato = {
            year: 'numeric',
            month: monthType,
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };
        return fecha.toLocaleString('es-ES', opcionesFormato);
    }

    return (
        <PaperProvider>
            <View style={[styles.container, { alignItems: 'center' }]}>
                {!isLoading ? (
                    <><FlatList
                        data={data}
                        renderItem={({ item, index }) => (
                            <Card
                                key={index}
                                style={{ width: 360, borderRadius: 8, margin: 8, backgroundColor: "#F8F7F6" }}
                            >
                                <Card.Content>
                                    <Text variant="titleLarge" style={[styles.textBorder, { borderBottomColor: getInfoByStatus(item.oferta.estado).color }]}>{item.oferta.estado.toUpperCase()}</Text>

                                    <View style={{ flexDirection: 'row' }}>
                                        <Ionicons name="person" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                        <Text style={styles.text} >{`${data[index].pasajero?.firstName} ${data[index].pasajero?.lastName}`}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Ionicons name="calendar" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                        <Text style={styles.text} >{formatDate(item.oferta.fechaSolicitud, 'long')}</Text>
                                    </View>
                                </Card.Content>
                                <Card.Actions>
                                    <Button textColor="black" style={{ width: 130 }}
                                        onPress={() => { setIndex(index); setShowOverlay(true); setModalDetails(true); }}>Ver Detalles</Button>
                                    <Button buttonColor={getInfoByStatus(item.oferta.estado).color} textColor="white" style={{ width: 130 }}
                                        onPress={() => {
                                            setShowOverlay(true); setIndex(index);
                                            { item.oferta.estado == "pendiente" ? setModalAlert(true) : setModalRating(true); setScore(data[index].ride.calificacionC_P?.puntaje); onChangeText(data[index].ride.calificacionC_P?.comentario); }
                                        }}>{data[index].ride?.calificacionC_P === undefined ?
                                            getInfoByStatus(item.oferta.estado).text : `${data[index].ride.calificacionC_P?.puntaje} `}
                                        {data[index].ride?.calificacionC_P !== undefined && <Ionicons name="star" style={{ fontSize: 15 }} />}</Button>
                                </Card.Actions>
                            </Card>
                        )}
                    />

                        {showOverlay && (
                            <TouchableOpacity
                                style={styles.overlay}
                                activeOpacity={1}
                            />
                        )}

                        {modalDetails && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalDetails}
                                onRequestClose={() => {
                                    setShowOverlay(!showOverlay); setModalDetails(!modalDetails);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View><Text style={[styles.modalText, { marginRight: 20 }]}>Información del Ride</Text></View>
                                            <View>
                                                <Pressable onPress={() => { setShowOverlay(!showOverlay); setModalDetails(!modalDetails); }}>
                                                    <Ionicons name="close-circle-outline" style={{ color: '#D83F20', fontSize: 40, marginTop: -5, marginLeft: 30 }} />
                                                </Pressable>
                                            </View>
                                        </View>

                                        <View>
                                            <TextInput
                                                style={{ margin: 6, height: 45, width: 260 }}
                                                mode="outlined"
                                                label="Pasajero"
                                                value={`${data[index].pasajero?.firstName} ${data[index].pasajero?.lastName}`}
                                                editable={false}
                                                left={<TextInput.Icon icon="account" style={{ marginTop: 15 }} />}
                                            />
                                            <TextInput
                                                style={{ margin: 6, height: 45, width: 260 }}
                                                mode="outlined"
                                                label="Num Pasajeros"
                                                value={`${data[index].ride?.numPasajeros}`}
                                                editable={false}
                                                left={<TextInput.Icon icon="account-multiple" style={{ marginTop: 15 }} />}
                                            />
                                            <TextInput
                                                style={{ margin: 6, height: 45, width: 260 }}
                                                mode="outlined"
                                                label="Cooperación Voluntaria"
                                                value={data[index].oferta?.cooperacion}
                                                editable={false}
                                                left={<TextInput.Icon icon="cash-multiple" style={{ marginTop: 10 }} />}
                                            />
                                            <TextInput
                                                style={{ margin: 6, height: 45, width: 260 }}
                                                mode="outlined"
                                                label="Fecha/Hora"
                                                value={formatDate(data[index].oferta?.fechaSolicitud, 'numeric')}
                                                editable={false}
                                                left={<TextInput.Icon icon="calendar-clock" style={{ marginTop: 15 }} />}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Ionicons name="map-outline" style={styles.icon} />
                                            <Text style={styles.text}>Ruta</Text>
                                        </View>
                                        <View style={{ width: '100%', height: 200 }}>
                                            <MapView
                                                provider={PROVIDER_GOOGLE}
                                                style={styles.map}
                                                initialRegion={{
                                                    latitude: data[index].ride.origin.coordinates?.latitude,
                                                    longitude: data[index].ride.origin.coordinates?.longitude,
                                                    latitudeDelta: 0.04,
                                                    longitudeDelta: 0.04,
                                                }}
                                            >
                                                <Marker
                                                    title="Punto Encuentro"
                                                    coordinate={{ latitude: data[index].ride.origin.coordinates?.latitude, longitude: data[index].ride.origin.coordinates?.longitude }} />
                                                <Marker
                                                    title="Punto Destino"
                                                    coordinate={{ latitude: data[index].ride.destination.coordinates?.latitude, longitude: data[index].ride.destination.coordinates?.longitude }} />
                                                <MapViewDirections
                                                    origin={{ latitude: data[index].ride.origin.coordinates?.latitude, longitude: data[index].ride.origin.coordinates?.longitude }}
                                                    destination={{ latitude: data[index].ride.destination.coordinates?.latitude, longitude: data[index].ride.destination.coordinates?.longitude }}
                                                    apikey={GOOGLE_MAPS_API_KEY}
                                                    mode="DRIVING"
                                                    strokeWidth={3}
                                                    strokeColor="green"
                                                />
                                            </MapView>
                                        </View>
                                    </View>
                                </View>
                            </Modal>)}

                        {modalALert && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalALert}
                                onRequestClose={() => {
                                    setModalAlert(!modalALert); setShowOverlay(!showOverlay);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="warning" style={{ marginRight: 6, fontSize: 70, color: "#FFC300" }}></Ionicons>
                                            <Text style={[styles.modalText, { fontSize: 18 }]}>CANCELAR OFERTA</Text>
                                            <Text style={[styles.modalText, { fontSize: 16, textAlign: 'center' }]}>¿Estas seguro de que deseas eliminar tu oferta?</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#EE6464' }]}
                                                onPress={() => { deleteDoc(data[index].oferta?.id); setModalAlert(false); setModalDialog(true); }}
                                            >
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>SI</Text>
                                                </View>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#B0B0B0' }]}
                                                onPress={() => { setModalAlert(false); setShowOverlay(false); }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>NO</Text>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>)}

                        {modalDialog && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalDialog}
                                onRequestClose={() => {
                                    setModalDialog(!modalDialog); setShowOverlay(!showOverlay);
                                }}>

                                <View style={styles.centeredView}>
                                    <View style={[styles.modalView, { padding: 15 }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle-outline" style={{ marginRight: 6, fontSize: 70, color: "#EE6464" }}></Ionicons>
                                            <Text style={[styles.modalText, { fontSize: 18 }]}>OFERTA CANCELADA</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row' }}>
                                            <Pressable style={[styles.button, { backgroundColor: '#B0B0B0', width: "100%" }]}
                                                onPress={() => { setModalDialog(false); setShowOverlay(false); }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>OK</Text>
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>)}

                        {modalRating && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalRating}
                                onRequestClose={() => {
                                    setModalRating(!modalRating); setShowOverlay(!showOverlay);
                                }}>

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
                                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                            <Pressable
                                                style={[styles.button, { backgroundColor: '#BEE27B' }]}
                                                onPress={() => {
                                                    updateData({ puntaje: score, comentario: comen }, data[index].oferta?.rideID);
                                                    setModalRating(!modalRating); setShowOverlay(!showOverlay);
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Guardar</Text>
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
                            </Modal>)}
                    </>
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

export default RidesConductor;