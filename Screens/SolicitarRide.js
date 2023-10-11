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
import { set } from "date-fns";

/* Styles */
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

/* Places */
const ITSUR_PLACE = {
    description: "ITSUR",
    geometry: {
        location: {
            lat: 20.140368,
            lng: -101.150601,
        }
    }
}

const SolicitarRide = ({ formikk }) => {
    const { user } = useAuth();

    /* Referencias a los componentes */
    const mapRef = React.useRef(null);
    const originRef = React.useRef(null);
    const destinationRef = React.useRef(null);

    /* Ruta que se va a solicitar */
    const [route, setRoute] = React.useState({ origin: null, destination: null })
    const [homePlace, setHomePlace] = React.useState(null);


    /* Obtener permiso de ubicacion */
    React.useEffect(() => {
        Geocoder.init(GOOGLE_MAPS_API_KEY);
        getLocationPermission();
    }, []);

    const updateAddressInAutocomplete = async (latitude, longitude, ref, fieldName) => {
        try {
            const json = await Geocoder.from(latitude, longitude);
            const addressComponent = json.results[0].formatted_address;
            ref.current?.setAddressText(addressComponent);
            formikk.setFieldValue(fieldName, addressComponent);
        } catch (error) {
            console.warn(error);
        }
    };

    const handleDragEnd = async (type, e) => {
        const coords = {
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude
        };
        setRoute(prev => ({ ...prev, [type]: coords }));
        const ref = type === 'origin' ? originRef : destinationRef;
        const fieldName = type === 'origin' ? 'directionOrigin' : 'directionDestination';
        updateAddressInAutocomplete(coords.latitude, coords.longitude, ref, fieldName);
    }

    /* Obtener la ubicacion actual */

    const getLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }
            const { coords } = await Location.getCurrentPositionAsync({});
            const currentPlace = {
                description: 'Ubicación actual',
                geometry: { location: { lat: coords.latitude, lng: coords.longitude } },
            };
            setHomePlace(currentPlace);
            if (!formikk.values.origin) {
                setRoute((p) => ({ ...p, origin: { latitude: coords.latitude, longitude: coords.longitude } }));
            }
            updateAddressInAutocomplete(coords.latitude, coords.longitude, originRef, 'directionOrigin');
            mapRef.current.animateCamera({ center: { latitude: coords.latitude, longitude: coords.longitude } });
        } catch (error) {
            console.error('Error getting location permission:', error);
        }
    };




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
                    backgroundColor: "#e55",
                }}>
                {/* Inputs Origin & Destino */}
                <View style={{ zIndex: 20, width: '100%', position: 'absolute' }}>
                    <GooglePlacesAutocomplete
                        ref={originRef}
                        fetchDetails={true}
                        placeholder='Donde estas?'
                        onPress={(data, details = null) => {
                            setRoute(p => ({
                                ...p,
                                origin: {
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                }
                            }));
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
                        ref={destinationRef}
                        placeholder='A donde te diriges?'
                        autoFocus={false}
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setRoute(p => ({
                                ...p,
                                destination: {
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                }
                            }));
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
                                onDragEnd={(e) => handleDragEnd('origin', e)}

                            />
                        }
                        {route.destination !== null &&
                            <Marker
                                title="destination"
                                id="destination"
                                coordinate={route.destination}
                                draggable={true}
                                onDragEnd={(e) => handleDragEnd('destination', e)}

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

            </View>
        </View>
    );
};

export default SolicitarRide;