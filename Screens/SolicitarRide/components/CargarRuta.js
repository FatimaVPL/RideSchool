import * as React from "react";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env"
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleSheet, TouchableWithoutFeedback, View, Keyboard } from "react-native";
import { useAuth } from '../../../context/AuthContext'
import Geocoder from 'react-native-geocoding';
import { useTheme } from "../../../hooks/ThemeContext";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button, PaperProvider, TextInput, Modal, Portal, Text, HelperText } from 'react-native-paper';
import { add, set } from "date-fns";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";


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

const CargarRuta = ({ formikk }) => {
    const { user } = useAuth();
    const { colors } = useTheme()

    const [alertUbication, setAlertUbication] = React.useState(false);

    // Referencias a los componentes
    const mapRef = React.useRef(null);
    const originRef = React.useRef(null);
    const destinationRef = React.useRef(null);

    /* Ruta que se va a solicitar */
    const [route, setRoute] = React.useState({ origin: null, destination: null })
    const [homePlace, setHomePlace] = React.useState({
        description: '',
        toAutoComplete: '',
        geometry: {},
    });


    /* Obtener permiso de ubicacion */
    React.useEffect(() => {
        Geocoder.init(GOOGLE_MAPS_API_KEY);
        getLocationPermission();
    }, []);

    //Cambiar altura en los inputs
    const [text, setText] = React.useState(''); // Estado para el contenido del TextInput
    const [inputHeight, setInputHeight] = React.useState(40); // Estado para la altura del TextInput

    const handleContentSizeChange = (contentWidth, contentHeight) => {
        setInputHeight(contentHeight); // Actualiza la altura del TextInput según su contenido
    };

    const getAddressComponents = async (latitude, longitude) => {
        try {
            const json = await Geocoder.from(latitude, longitude);
            const addressComponents = json.results[0].address_components;
            let street = "", number = "", city = "", state = "";
            //console.log(addressComponents);
            for (const component of addressComponents) {

                if (component.types.includes('plus_code')) {
                    if (component.long_name.includes("4RQX")) {
                        return "ITSUR";
                    } else {
                        return "UNV";
                    }
                } else {
                    if (component.types.includes('route')) {
                        street = `${component.short_name}`;
                    }
                    if (component.types.includes('street_number')) {
                        number = `${component.long_name}`;
                    }
                    if (component.types.includes('locality')) {
                        city = `${component.long_name}`;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        state = `${component.short_name}`;
                    }
                }
            }

            return `${street} ${number}, ${city}, ${state}`.trim();

        } catch (error) {
            console.warn(error);
            return "";
        }
    };
    const updateAddressInAutocomplete = async (latitude, longitude, ref, fieldName) => {
        //console.log(addressComponent);
        try {
            const addressComponent = await getAddressComponents(latitude, longitude);
            if (addressComponent === "UNV") {
                setAlertUbication(true);
                ref.current?.setAddressText("");
                formikk.setFieldValue(fieldName, "");
                setRoute(prev => ({ ...prev, [fieldName === 'directionOrigin' ? 'origin' : 'destination']: null }));
            } else {
                setAlertUbication(false);
                ref.current?.setAddressText(addressComponent);
                formikk.setFieldValue(fieldName, (addressComponent));
            }

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

            if (!formikk.values.origin) {
                //console.log('entro');
                setRoute((p) => ({ ...p, origin: { latitude: coords.latitude, longitude: coords.longitude } }));
                updateAddressInAutocomplete(coords.latitude, coords.longitude, originRef, 'directionOrigin');
                mapRef.current?.animateCamera({
                    center: {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    },
                    zoom: 15,
                    duration: 1,
                });
                const addressComponent = await getAddressComponents(coords.latitude, coords.longitude);
                setHomePlace({
                    description: 'Ubicación actual',
                    toAutoComplete: addressComponent,
                    geometry: { location: { lat: coords.latitude, lng: coords.longitude } },
                });
            } else {
                originRef.current?.setAddressText(formikk.values.directionOrigin);
            }


        } catch (error) {
            console.error('Error getting location permission:', error);
        }
    };


    //Formik
    React.useEffect(() => {
        if (route.origin !== null && route.destination !== null) {
            formikk.setFieldValue('origin', route.origin);
            formikk.setFieldValue('destination', route.destination);
            originRef.current?.setAddressText(formikk.values.directionOrigin);
            destinationRef.current?.setAddressText(formikk.values.directionDestination);
        }
    }, [route])
    React.useEffect(() => {
        if (formikk.values.origin !== null && formikk.values.destination !== null) {
            setRoute({
                origin: formikk.values.origin,
                destination: formikk.values.destination,
            })
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
                <View style={{
                    display: 'flex',
                    zIndex: 20,
                    width: '96%',
                    marginStart: '1%',
                    alignSelf: 'flex-center',
                    justifyContent: 'center',
                    position: 'absolute',
                    backgroundColor: colors.transparent,
                }}>
                    <GooglePlacesAutocomplete
                        styles={
                            {
                                textInput: {
                                    position: 'relative',
                                    backgroundColor: '#56565B',
                                    color: '#fff',
                                    fontSize: 16,
                                    height: 70,
                                    paddingHorizontal: 20,
                                    marginTop: 10,
                                    borderRadius: 10, // bordes redondeados
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    flexDirection: 'row', // Para alinear el ícono y el input horizontalmente
                                    alignItems: 'center', // Para centrar verticalmente el ícono y el texto
                                },
                                listView: {
                                    backgroundColor: colors.background3,
                                    borderRadius: 10,
                                    marginTop: 10,
                                },
                                row: {
                                    backgroundColor: colors.background3,
                                    borderRadius: 10,
                                    padding: 13,
                                    height: 50,
                                },
                            }
                        }
                        renderRightButton={() => (
                            originRef.current?.getAddressText() ? (
                                <Icon
                                    name="times-circle"
                                    size={20}
                                    color="#fff"
                                    style={{ width: 20, height: 20, position: 'absolute', right: 8, top: 32 }}
                                    onPress={() => {
                                        originRef.current?.setAddressText('');
                                        formikk.setFieldValue('directionOrigin', '');
                                        setRoute(p => ({ ...p, origin: null }));
                                    }}
                                />
                            ) : null
                        )}
                        textInputProps={{
                            placeholderTextColor: '#fff',
                            placeholder: '¿Dónde estás?',
                            multiline: true
                        }}
                        ref={originRef}
                        fetchDetails={true}
                        onPress={(data, details) => {
                            console.log(data);
                            setRoute(p => ({
                                ...p,
                                origin: {
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                }
                            }));
                            data.toAutoComplete ? formikk.setFieldValue('directionOrigin', data.toAutoComplete) : formikk.setFieldValue('directionOrigin', data.description);
                            originRef.current?.setAddressText(data.description);
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
                                    position: 'relative',
                                    backgroundColor: '#56565B',
                                    color: '#fff',
                                    fontSize: 16,
                                    height: 70,
                                    paddingHorizontal: 20,
                                    marginTop: 10,
                                    borderRadius: 10, // bordes redondeados
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    flexDirection: 'row', // Para alinear el ícono y el input horizontalmente
                                    alignItems: 'center', // Para centrar verticalmente el ícono y el texto
                                },
                                predefinedPlacesDescription: {
                                    color: colors.text,
                                },

                            }
                        }
                        textInputProps={{
                            placeholderTextColor: '#fff',
                            placeholder: '¿A dónde te diriges?',
                            //textAlignVertical: 'top',
                            multiline: true,
                        }}
                        ref={destinationRef}
                        autoFocus={false}
                        fetchDetails={true}
                        onPress={(data, details) => {
                            console.log(data);
                            setRoute(p => ({
                                ...p,
                                destination: {
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                }
                            }));
                            formikk.setFieldValue('directionDestination', data.description);
                            destinationRef.current?.setAddressText(data.description);
                        }}
                        query={{
                            key: GOOGLE_MAPS_API_KEY,
                            language: 'es',
                            location: '20.141825,-101.178825', // Coordenadas del centro
                            radius: '15000', // Radio en metros
                            strictbounds: true,
                        }}
                        renderRightButton={() => (
                            destinationRef.current?.getAddressText() ? (
                                <Icon
                                    name="times-circle"
                                    size={20}
                                    color="#fff"
                                    style={{ width: 20, height: 20, position: 'absolute', right: 8, top: 32 }}
                                    onPress={() => {
                                        destinationRef.current?.setAddressText('');
                                        formikk.setFieldValue('directionDestination', '');
                                        setRoute(p => ({ ...p, destination: null }));
                                    }}
                                />
                            ) : null
                        )}
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
                                title="Punto de encuentro"
                                id="origin"
                                coordinate={route.origin}
                                draggable={true}
                                onDragEnd={(e) => handleDragEnd('origin', e)}

                            />
                        }
                        {route.destination !== null &&
                            <Marker
                                title="Destino"
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
                                    mapRef.current?.fitToCoordinates(result.coordinates, {
                                        edgePadding: {
                                            right: 50,
                                            bottom: 50,
                                            left: 50,
                                            top: 60,
                                        },
                                    });
                                }}
                            />
                        }
                    </MapView>
                </TouchableWithoutFeedback>

                {/* Alerta de ubicacion */}
                <Portal>
                    <Modal visible={alertUbication} onDismiss={() => setAlertUbication(false)} contentContainerStyle={{ padding: 20, backgroundColor: colors.background3, width: '100%' }}>
                        <Text style={{ fontSize: 20, color: '#171717' }}>¡Alto ahí loca!</Text>
                        <Text style={{ marginTop: 10, color: '#171717' }}>Ajusta los marcadores para generar una ubicación válida.</Text>
                        <Button style={styles.button} textColor='white' mode="contained" onPress={() => { setAlertUbication(false) }}>Obligame prro</Button>
                    </Modal>
                </Portal>
            </View>
        </View>
    );
};

export default CargarRuta;