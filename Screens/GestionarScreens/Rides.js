import * as React from "react";
import { useEffect, useState } from 'react'
import { View, StyleSheet, FlatList } from "react-native";
import { Button, Card, Text, ActivityIndicator, MD2Colors, PaperProvider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { subscribeToOfertas, subscribeToRides } from '../../firebaseSubscriptions';
import { useTheme } from "../../hooks/ThemeContext";
import CardOferta from "./components/CardOferta";
import Profile from "./components/ModalProfile";
import ModalALert from "./components/ModalAlert";
import ModalRating from "./components/ModalRating";
import ModalDetails from "./components/ModalDetails";
import ModalReview from "./components/ModalReview";
import ModalOptions from "./components/ModalOptions";
import ModalDialog from "./components/ModalDialog";
import { cut, formatDate, getInfoByStatus } from "./others/Functions";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,

        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    textBorder: { borderBottomWidth: 2, fontWeight: 'bold', fontSize: 16, color: 'black' },
    text: { marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black' }
})

const GestionarRides = ({ navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [indexRide, setIndexRide] = useState(null);
    const [indexOferta, setIndexOferta] = useState(null);
    const [modalDetails, setModalDetails] = useState(false); // Detalles del Ride
    const [modalALert, setModalAlert] = useState(false);
    const [modalPropsAlert, setModalPropsAlert] = useState({});
    const [modalDialog, setModalDialog] = useState(false); // Notificacion Ride Cancelado
    const [modalPropsDialog, setModalPropsDialog] = useState({});
    const [modalUser, setModalUser] = useState(false); // Informacion del conductor/oferta
    const [modalRating, setModalRating] = useState(false); // Calificar el Ride
    const [modalReview, setModalReview] = useState(false); // Evaluacion detallada
    const [modalOptions, setModalOptions] = useState(false); // Seleccionar porque cancelo el ride

    useEffect(() => {
        const unsubscribeOfertas = subscribeToOfertas(() => { getData() });
        const unsubscribeRides = subscribeToRides(() => { getData() });

        return () => {
            unsubscribeOfertas();
            unsubscribeRides();
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
                    try {
                        const oferta = await rideData.ofertaID.get();
                        const conductor = await rideData.conductorID.reference.get();
                        if (oferta.exists && conductor.exists) {
                            const resultado = {
                                ride: rideData,
                                oferta: oferta.data(),
                                conductor: conductor.data()
                            };

                            resultados.push(resultado);
                        }
                    } catch (error) {
                        console.error('Error al obtener los documentos:', error);
                        throw error;
                    }
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

    return (
        <PaperProvider>
            <View style={[styles.container, { alignItems: 'center' }, { backgroundColor: colors.background }]}>
                {!isLoading ? (
                    <>
                        <FlatList
                            data={data}
                            renderItem={({ item, index }) => {
                                const parentIndex = index;
                                return (
                                    <Card
                                        key={index}
                                        style={{ width: 360, borderRadius: 8, margin: 8, padding: 8, backgroundColor: colors.backgroundCard }}>
                                        <Card.Content>
                                            <Text variant="titleLarge" style={[styles.textBorder, { borderBottomColor: getInfoByStatus(item.ride.estado).color }]}>{item.ride.estado.toUpperCase()}</Text>

                                            <View style={{ flexDirection: 'row', width: 300 }}>
                                                <Ionicons name="location-sharp" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                                <Text style={styles.text}>
                                                    Ruta {'\n'}
                                                    <Text style={{ fontWeight: 'bold', color: '#171717' }}>Inicio:</Text> {cut(item.ride.origin.direction, null)} {'\n'}
                                                    <Text style={{ fontWeight: 'bold', color: '#171717' }}>Destino:</Text> {cut(item.ride.destination.direction, null)}
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

                                                    <FlatList
                                                        data={item.ofertas}
                                                        renderItem={({ item, index }) => (
                                                            <CardOferta
                                                                parentIndex={parentIndex}
                                                                item={item}
                                                                index={index}
                                                                setIndexOferta={setIndexOferta}
                                                                setIndexRide={setIndexRide}
                                                                setModalUser={setModalUser}
                                                            />
                                                        )}
                                                    />
                                                </>)}
                                        </Card.Content>

                                        <Card.Actions>
                                            <Button textColor="black" style={{ width: 160 }} labelStyle={{ fontWeight: 'bold', fontSize: 13 }}
                                                onPress={() => { setIndexRide(index); setModalDetails(true); }}>Ver Detalles</Button>
                                            {item.ride.estado !== "cancelado" && (
                                                <Button buttonColor={getInfoByStatus(item.ride.estado).color} textColor="white" style={{ width: 160 }} labelStyle={{ fontWeight: 'bold', fontSize: 14 }}
                                                    onPress={() => {
                                                        setIndexRide(index);
                                                        {
                                                            switch (item.ride?.estado) {
                                                                case "en curso":
                                                                    navigation.navigate('ChatScreen');
                                                                    break;
                                                                case "finalizado":
                                                                    setModalRating(true); setScore(item.ride.califP_C?.puntaje); onChangeText(item.ride.califP_C?.comentario);
                                                                    break;
                                                                default:
                                                                    setModalPropsAlert({
                                                                        icon: 'warning',
                                                                        color: '#FFC300',
                                                                        title: 'CANCELAR RIDE',
                                                                        content: '¿Estas seguro de que deseas cancelar tu ride?',
                                                                        type: 1
                                                                    });
                                                                    setModalAlert(true);
                                                                    break;
                                                            }
                                                        }
                                                    }}> {item.ride.califP_C === undefined ? getInfoByStatus(item.ride.estado).text : `${item.ride.califP_C.puntaje} `}
                                                    {item.ride.califP_C !== undefined && <Ionicons name="star" style={{ fontSize: 15 }} />} </Button>
                                            )}
                                        </Card.Actions>
                                    </Card>
                                );
                            }}
                        />

                        {modalALert && (
                            <ModalALert
                                icon={modalPropsAlert.icon}
                                color={modalPropsAlert.color}
                                title={modalPropsAlert.title}
                                content={modalPropsAlert.content}
                                type={modalPropsAlert.type}
                                ride={data[indexRide].ride}
                                indexOferta={indexOferta}
                                ofertas={data[indexRide].ofertas}
                                rol={"pasajero"}
                                modalALert={modalALert}
                                setModalAlert={setModalAlert}
                                setModalReview={setModalReview}
                                setModalOptions={setModalOptions}
                                setModalDialog={setModalDialog}
                                setModalPropsDialog={setModalPropsDialog}
                            />
                        )}

                        {modalDetails && (
                            <ModalDetails
                                data={data[indexRide]}
                                modalDetails={modalDetails}
                                setModalDetails={setModalDetails}
                                setModalPropsAlert={setModalPropsAlert}
                                setModalAlert={setModalAlert}
                            />
                        )}

                        {modalOptions && (
                            <ModalOptions
                                ride={data[indexRide].ride}
                                rol={"pasajero"}
                                modalOptions={modalOptions}
                                setModalOptions={setModalOptions}
                                setModalDialog={setModalDialog}
                                setModalPropsDialog={setModalPropsDialog}
                            />
                        )}

                        {modalUser && (
                            <Profile
                                user={data[0].ofertas[0].conductor}
                                oferta={data[0].ofertas[0]}
                                modalUser={modalUser}
                                setModalUser={setModalUser}
                                setModalPropsAlert={setModalPropsAlert}
                                setModalAlert={setModalAlert}
                            />
                        )}

                        {modalRating && (
                            <ModalRating
                                ride={data[indexRide].ride}
                                rol={"pasajero"}
                                modalRating={modalRating}
                                setModalRating={setModalRating}
                                setModalReview={setModalReview}
                                setModalPropsAlert={setModalPropsAlert}
                                setModalAlert={setModalAlert}
                            />
                        )}

                        {modalReview && (
                            <ModalReview
                                userType={"conductor"}
                                modalReview={modalReview}
                                setModalReview={setModalReview}
                                rideID={data[indexRide].ride.id}
                            />
                        )}

                        {modalDialog && (
                            <ModalDialog
                                icon={modalPropsDialog.icon}
                                color={modalPropsDialog.color}
                                title={modalPropsDialog.title}
                                modalDialog={modalDialog}
                                setModalDialog={setModalDialog}
                            />
                        )}
                    </>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                        <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
                        <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
                    </View>
                )}
            </View>
        </PaperProvider >
    )
}

export default GestionarRides;