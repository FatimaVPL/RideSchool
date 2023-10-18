import * as React from "react";
import { useEffect, useState } from 'react'
import { View, StyleSheet, FlatList } from "react-native";
import { Button, Card, Text, ActivityIndicator, MD2Colors, PaperProvider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../../config-firebase';
import { useAuth } from '../../context/AuthContext';
import { subscribeToOfertas, subscribeToRides } from '../../firebaseSubscriptions';
import { useTheme } from "../../hooks/ThemeContext";
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

const RidesConductor = ({ navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [index, setIndex] = useState(null);
    const [modalDetails, setModalDetails] = useState(false);
    const [modalALert, setModalAlert] = useState(false);
    const [modalPropsALert, setModalPropsALert] = useState({});
    const [modalDialog, setModalDialog] = useState(false);
    const [modalPropsDialog, setModalPropsDialog] = useState({});
    const [modalRating, setModalRating] = useState(false);
    const [modalReview, setModalReview] = useState(false);
    const [modalOptions, setModalOptions] = useState(false);

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
            const ofertasSnapshot = await db.collection('ofertas').where('conductorID.uid', '==', user.uid).get();
            const resultados = [];

            for (const ofertasDoc of ofertasSnapshot.docs) {
                const ofertasData = ofertasDoc.data();
                const rideSnapshot = await ofertasData.rideID.reference.get();
                const rideData = rideSnapshot.data();
                const passengerSnapshot = await ofertasData.pasajeroID.reference.get();
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

    return (
        <PaperProvider>
            <View style={[styles.container, { alignItems: 'center' }, { backgroundColor: colors.background }]}>
                {!isLoading ? (
                    <><FlatList
                        data={data}
                        renderItem={({ item, index }) => (
                            <Card
                                key={index}
                                style={{ width: 360, borderRadius: 8, margin: 8, backgroundColor: colors.backgroundCard }}
                            >
                                <Card.Content>
                                    <Text variant="titleLarge" style={[styles.textBorder, { borderBottomColor: getInfoByStatus(item.oferta.estado).color }]}>{item.oferta.estado.toUpperCase()}</Text>

                                    <View style={{ flexDirection: 'row' }}>
                                        <Ionicons name="person" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                        <Text style={styles.text} >{cut(null, `${data[index].pasajero.firstName} ${data[index].pasajero.lastName}`)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Ionicons name="calendar" style={{ fontSize: 22, paddingTop: 6, marginRight: 6 }} />
                                        <Text style={styles.text} >{formatDate(item.oferta.fechaSolicitud, 'long')}</Text>
                                    </View>
                                </Card.Content>
                                <Card.Actions>
                                    <Button textColor="black" style={{ width: 160 }} labelStyle={{ fontWeight: 'bold', fontSize: 13 }}
                                        onPress={() => { setIndex(index); setModalDetails(true); }}>Ver Detalles</Button>
                                    {item.oferta.estado !== "descartada" && item.oferta.estado !== "cancelada" && (
                                        <Button buttonColor={getInfoByStatus(item.oferta.estado).color} textColor="white" style={{ width: 160 }} labelStyle={{ fontWeight: 'bold', fontSize: 14 }}
                                            onPress={() => {
                                                setIndex(index);
                                                {
                                                    switch (item.oferta.estado) {
                                                        case "aceptada":
                                                            navigation.navigate('ChatScreen');
                                                            break;
                                                        case "finalizada":
                                                            setModalRating(true); setScore(data[index].ride.califC_P?.puntaje); onChangeText(data[index].ride.califC_P?.comentario);
                                                            break;
                                                        default:
                                                            setModalPropsALert({
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
                                            }}> {data[index].ride.califC_P === undefined ? getInfoByStatus(item.oferta.estado).text : `${data[index].ride.califC_P?.puntaje} `}
                                            {data[index].ride.califC_P !== undefined && <Ionicons name="star" style={{ fontSize: 15 }} />}</Button>
                                    )}
                                </Card.Actions>
                            </Card>
                        )}
                    />

                        {modalDetails && (
                            <ModalDetails
                                data={data[index]}
                                modalDetails={modalDetails}
                                setModalDetails={setModalDetails}
                                setModalPropsALert={setModalPropsALert}
                                setModalAlert={setModalAlert}
                            />
                        )}

                        {modalALert && (
                            <ModalALert
                                icon={modalPropsALert.icon}
                                color={modalPropsALert.color}
                                title={modalPropsALert.title}
                                content={modalPropsALert.content}
                                type={modalPropsALert.type}
                                ride={data[index].ride}
                                indexOferta={0}
                                ofertas={null}
                                rol={"pasajero"}
                                modalALert={modalALert}
                                setModalAlert={setModalAlert}
                                setModalReview={setModalReview}
                                setModalOptions={setModalOptions}
                                setModalDialog={setModalDialog}
                                setModalPropsDialog={setModalPropsDialog}
                            />
                        )}

                        {modalOptions && (
                            <ModalOptions
                                ride={data[index].ride}
                                rol={"conductor"}
                                modalOptions={modalOptions}
                                setModalOptions={setModalOptions}
                                setModalDialog={setModalDialog}
                                setModalPropsDialog={setModalPropsDialog}
                            />
                        )}

                        {modalRating && (
                            <ModalRating
                                ride={data[index].ride}
                                rol={"conductor"}
                                modalRating={modalRating}
                                setModalRating={setModalRating}
                                setModalReview={setModalReview}
                                setModalPropsALert={setModalPropsALert}
                                setModalAlert={setModalAlert}
                            />
                        )}

                        {modalReview && (
                            <ModalReview
                                userType={"pasajero"}
                                modalReview={modalReview}
                                setModalReview={setModalReview}
                                rideID={data[index].ride.id}
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
        </PaperProvider>
    )
}

export default RidesConductor;