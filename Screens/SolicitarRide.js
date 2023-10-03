import * as React from "react";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env"
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Keyboard } from "react-native";
import { useAuth } from '../context/AuthContext'
import { Image } from "react-native";
import Geocoder from 'react-native-geocoding';
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
});

const ITSUR_PLACE = {
    description: "Instituto Tecnologico Superior del Sur de Guanajuato",
    geometry: {
        location: {
            lat: 20.140368,
            lng: -101.150601,
        }
    }
}

const SolicitarRide = ({ formikk }) => {
    const { user } = useAuth();
    const { colors } = useTheme()
    // Referencias a los componentes
    const mapRef = React.useRef(null);
    const originRef = React.useRef(null);
    const destinationRef = React.useRef(null);

    // ubicacion actual
    const [homePlace, setHomePlace] = React.useState(null);

    // Ruta que se va a solicitar
    const [route, setRoute] = React.useState({ origin: null, destination: null })

    // Indica si se esta seleccionando un lugar
    const [selecting, setSelecting] = React.useState(null)

    React.useEffect(() => {
        Geocoder.init(GOOGLE_MAPS_API_KEY);
        getLocationPermission();
    }, []);

    async function getLocationPermission() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied");
            return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        setHomePlace({ description: 'Ubicacion Actual', geometry: { location: { lat: coords.latitude, lng: coords.longitude } } })
    }

    // Marcar el centro del mapa cuando se esta seleccionando un lugar
    const markCenter = async (selecting) => {

        // Acceder a la posicion del centro del mapa
        const mapRegion = await mapRef.current.getCamera();
        const { latitude, longitude } = mapRegion.center;

        // Obtener la direccion del centro del mapa
        await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                // Settear la direccion en el Input correspondiente
                if (data.results && data.results.length > 0) {
                    const address = data.results[0].formatted_address;
                    if (selecting === 'origin') {
                        originRef?.current?.setAddressText(address)
                        destinationRef?.current?.focus()
                    }
                    if (selecting === 'destination') {
                        destinationRef?.current?.setAddressText(address)
                        setSelecting(null)
                    }
                } else {
                    console.error("Couldn't fetch address");
                }
            })
            .catch(error => console.warn(error));

        setRoute(p => ({ ...p, [selecting]: { latitude, longitude } }))
    }

    const handleSolicitar = () => {
        console.log({
            ...user,
            route,
            date: new Date().toLocaleString(),
        })
    }

    //Formik
    React.useEffect(() => {
        if (route.origin !== null && route.destination !== null) {
            formikk.setFieldValue('origin', route.origin);
            formikk.setFieldValue('destination', route.destination);
        }
    }, [route])
    React.useEffect(() => {
        if (formikk.values.origin !== null && formikk.values.destination !== null) {
            setRoute({
                origin: formikk.values.origin,
                destination: formikk.values.destination,
            })
            Geocoder.from(formikk.values.destination.latitude, formikk.values.destination.longitude).then(json => {
                var addressComponent = json.results[0].formatted_address;
                destinationRef.current?.setAddressText(addressComponent);
            }).catch(error => console.warn(error));
            Geocoder.from(formikk.values.origin.latitude, formikk.values.origin.longitude).then(json => {
                var addressComponent = json.results[0].formatted_address;
                originRef.current?.setAddressText(addressComponent);
            }).catch(error => console.warn(error));
        }
    }, [])


    return (
        <View style={[styles.container, { position: 'relative' }]}>
            <View
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}>
                {/* Inputs Origin & Destino */}
                <View style={{ zIndex: 20, width: '100%', position: 'absolute', backgroundColor: colors.background }}>
                    <GooglePlacesAutocomplete
                        styles={
                            {
                                textInput: {
                                    backgroundColor: '#85929E', height: 38,
                                    color: colors.text,
                                    fontSize: 16,
                                    height: 50,
                                    fontWeight:'bold',
                                    shadowColor: "#000",
                                    shadowOffset: {
                                      width: 0,
                                      height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    paddingHorizontal: 16,
                                    marginTop: 10,
                                },
                                predefinedPlacesDescription: {
                                    color: colors.text,
                                },
                                listView: {},
                                row: {
                                    backgroundColor: colors.input,
                                    padding: 13,
                                    height: 44,
                                    flexDirection: 'row',
                                },
                            }
                        }
                        ref={originRef}
                        fetchDetails={true}
                        placeholder='¿Dónde estás?'
                        textInputProps={{ onFocus: () => setSelecting('origin'), }}
                        onPress={(data, details = null) => {
                            setRoute(p => ({
                                ...p,
                                origin: {
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                }
                            }));
                            setSelecting(null)
                            formikk.setFieldValue('directionOrigin', data.description);
                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'es',
                            location: '20.141825,-101.178825', // Coordenadas del centro
                            radius: '15000', // Radio en metros
                            strictbounds: true,
                        }}
                        onFail={(error) => console.error(error)}
                        predefinedPlaces={[homePlace]}
                    />
                    <GooglePlacesAutocomplete
                        styles={
                            {
                                textInput: {
                                    backgroundColor: '#85929E', height: 38,
                                    color: colors.text,
                                    fontSize: 16,
                                    height: 50,
                                    fontWeight:'bold',
                                    shadowColor: "#000",
                                    shadowOffset: {
                                      width: 0,
                                      height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    paddingHorizontal: 16,
                                    marginTop: 10,
                                },
                                predefinedPlacesDescription: {
                                    color: colors.text,
                                },
                                listView: {},
                                row: {
                                    backgroundColor: colors.input,
                                    padding: 13,
                                    height: 44,
                                    flexDirection: 'row',
                                },
                            }
                        }
                        ref={destinationRef}
                        placeholder='¿A dónde te diriges?'
                        autoFocus={false}
                        textInputProps={{ onFocus: () => setSelecting('destination') }}
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setRoute(p => ({
                                ...p,
                                destination: {
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                }
                            }));
                            setSelecting(null)
                            formikk.setFieldValue('directionDestination', data.description);

                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'es',
                            location: '20.141825,-101.178825', // Coordenadas del centro
                            radius: '15000', // Radio en metros
                            strictbounds: true,
                        }}
                        onFail={(error) => console.error(error)}
                        predefinedPlaces={[ITSUR_PLACE]}
                    />
                </View>
                {/* Mapa */}
                <TouchableWithoutFeedback onPressIn={Keyboard.dismiss}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                        initialRegion={{
                            latitude: 20.140368,
                            longitude: -101.150601,
                            latitudeDelta: 0.09,
                            longitudeDelta: 0.04,
                        }}
                        followUserLocation={true}
                    >
                        {route.origin !== null &&
                            <Marker
                                title="origin"
                                id="origin"
                                coordinate={route.origin}
                                draggable={true}
                            //onDragEnd={(e) => setOrigin(e.nativeEvent.coordinate)}

                            />
                        }
                        {route.destination !== null &&
                            <Marker
                                title="destination"
                                id="destination"
                                coordinate={route.destination}
                                draggable={true}
                            //onDragEnd={(e) => setOrigin(e.nativeEvent.coordinate)}

                            />
                        }
                        {route.origin !== null && route.destination !== null &&
                            <MapViewDirections
                                origin={route.origin}
                                destination={route.destination}
                                apikey={GOOGLE_MAPS_API_KEY}
                                mode="DRIVING"
                                strokeWidth={3}
                                strokeColor="green"
                                onReady={(result) => {
                                    formikk.setFieldValue('informationRoute', { distance: Math.ceil(result.distance), duration: Math.ceil(result.duration) });
                                }}
                            />
                        }
                    </MapView>
                </TouchableWithoutFeedback>
                {
                    selecting !== null && <>
                        {/* Centered Mark */}
                        <View
                            style={{
                                position: 'absolute',
                                height: 36,
                                width: 36,
                                left: '50%',
                                top: '50%',
                                transform: [{ translateX: -18 }, { translateY: -40 }],
                                zIndex: 2,
                            }}>
                            <View style={{ position: 'relative', height: '100%', width: '100%' }}>
                                <View style={{
                                    position: 'absolute',
                                    height: "100%",
                                    width: "100%",
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }} >
                                    <Image
                                        style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
                                        source={require('../assets/placeholder.png')}></Image>
                                </View>
                            </View>
                        </View>

                        {/* Boton seleccionar ubicacion */}
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                            <TouchableOpacity
                                onPress={() => markCenter(selecting)}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '90%',
                                    height: 50,
                                    backgroundColor: 'green',
                                    borderRadius: 10,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 3,
                                    },
                                    shadowOpacity: 0.27,
                                    shadowRadius: 4.65,
                                    elevation: 6,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Seleccionar</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
            </View>
        </View>
    );
};

export default SolicitarRide;