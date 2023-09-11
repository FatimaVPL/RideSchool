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

const SolicitarRide = ({formikk}) => {
    const { user } = useAuth();

    // Referencias a los componentes
    const mapRef = React.useRef(null);
    const originRef = React.useRef(null);
    const destinationRef = React.useRef(null);

    // ubicacion actual
    const [homePlace, setHomePlace] = React.useState(null);

    // Ruta que se va a solicitar
    const [route, setRoute] = React.useState({ origin: null, destination: null})

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
        if(formikk.values.origin !== null && formikk.values.destination !== null){
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
                    backgroundColor: "#e55",
                }}>
                {/* Inputs Origin & Destino */}
                <View style={{ zIndex: 1, width: '100%', position: 'absolute' }}>
                    <GooglePlacesAutocomplete
                        ref={originRef}
                        fetchDetails={true}
                        placeholder='Donde estas?'
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
                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'es',
                        }}
                        onFail={(error) => console.error(error)}
                        predefinedPlaces={[homePlace]}
                    />
                    <GooglePlacesAutocomplete
                        ref={destinationRef}
                        placeholder='A donde te diriges?'
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
                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'es',
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
                        <TouchableOpacity
                            onPress={() => markCenter(selecting)}
                            style={{ position: 'absolute', bottom: 0, width: '100%', height: 50, backgroundColor: '#5e5' }}>
                            <Text>Seleccionar</Text>
                        </TouchableOpacity>
                    </>
                }
            </View>
        </View>
    );
};

export default SolicitarRide;