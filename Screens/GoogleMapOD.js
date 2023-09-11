import * as React from "react";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE, Marker} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env"
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { View } from "react-native";
import Geocoder from 'react-native-geocoding';


const GoogleMapOD = () => {

    const [origin, setOrigin] = React.useState(null);
    const [destination, setDestination] = React.useState(null);

    const _originRef = React.useRef();
    const _destinationRef = React.useRef();
    const _mapView = React.useRef(null);
    
    const [region, setRegion] = React.useState({
        latitude: 20.14163291964132,
        longitude: -101.17878332502384,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
    });

    // Función para cambiar la región del mapa
    const changeRegion = (newRegion) => {
        setRegion(newRegion);
    };


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
        const location = await Location.getCurrentPositionAsync({});
        const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setOrigin(coords);

        Geocoder.from(coords.latitude, coords.longitude).then(json => {
            var addressComponent = json.results[0].formatted_address;
            _originRef.current?.setAddressText(addressComponent);
        }).catch(error => console.warn(error));

    }

    return (
        <View style={{ position: "relative", flex: 1 }}>
            <MapView
                ref={_mapView}
                provider={PROVIDER_GOOGLE}
                style={{ zIndex: 0, flex: 1 }}
                region={region}
            >
                {origin !== null && destination !== null &&
                    <MapViewDirections
                        origin={origin}
                        destination={destination}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={3}
                        strokeColor="green"
                        optimizeWaypoints={true}
                        onReady={(result) => {
                            console.log(`Distance: ${Math.ceil(result.distance)} km`);
                            console.log(`Duration: ${Math.ceil(result.duration)} min.`);
                        }}
                        onError={(errorMessage) => {
                            console.log("GOT AN ERROR", errorMessage);
                        }}
                    />
                }

                {
                    origin !== null && <Marker
                        title="origin"
                        id="origin"
                        coordinate={origin}
                        draggable={true}
                        onDragEnd={(e) => {
                            const newCoords = { latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude };
                            setOrigin(newCoords);
                            Geocoder.from(newCoords.latitude, newCoords.longitude).then(json => {
                                var addressComponent = json.results[0].formatted_address;
                                _originRef.current?.setAddressText(addressComponent);
                            }).catch(error => console.warn(error));
                        }}

                    />
                }
                {
                    destination !== null && <Marker
                        title="destination"
                        id="destination"
                        coordinate={destination}
                        draggable={true}
                        onDragEnd={(e) => {
                            const newCoords = { latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude };
                            setDestination(newCoords);
                            Geocoder.from(newCoords.latitude, newCoords.longitude).then(json => {
                                var addressComponent = json.results[0].formatted_address;
                                _destinationRef.current?.setAddressText(addressComponent);
                            }).catch(error => console.warn(error));
                        }}
                    />
                }
            </MapView>

            <View style={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                marginHorizontal: 10,
                marginVertical: 2
            }}>
                <View style={{ position: "relative", width: "95%", height: 50, display: "flex", zIndex: 1 }}>
                    <View style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
                        <GooglePlacesAutocomplete
                            ref={_originRef}
                            fetchDetails={true}
                            placeholder='Selecciona un punto de encuentro'
                            onPress={(data, details = null) => {
                                setOrigin({
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                });
                            }}
                            query={{
                                key: GOOGLE_MAPS_API_KEY,
                                language: 'es',
                                location: '20.14163291964132,-101.17878332502384',
                                radius: '500000'
                            }}
                            onFail={(error) => console.error(error)}
                        />
                    </View>
                </View>

                <View style={{ position: "relative", width: "95%", height: 50, display: "flex" }}>
                    <View style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 2 }}>
                        <GooglePlacesAutocomplete
                            ref={_destinationRef}
                            fetchDetails={true}
                            placeholder='¿A dónde te diriges?'
                            onPress={(data, details = null) => {
                                setDestination({
                                    latitude: details?.geometry?.location.lat,
                                    longitude: details?.geometry?.location.lng,
                                });
                            }}
                            query={{
                                key: GOOGLE_MAPS_API_KEY,
                                language: 'es',
                                location: '20.14163291964132,-101.17878332502384',
                                radius: '500000'
                            }}
                            onFail={(error) => console.error(error)}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default GoogleMapOD;