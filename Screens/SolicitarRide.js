import * as React from "react";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env"
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { View } from "react-native";
import { StyleSheet } from "react-native";


const carImage = require("../assets/car.png");

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

const SolicitarRide = () => {


    React.useEffect(() => { getLocationPermission(); }, []);
    const [origin, setOrigin] = React.useState({
        latitude: 20.140368,
        longitude: -101.150601,
    });
    const [destination, setDestination] = React.useState({
        latitude: 20.140368,
        longitude: -101.150601,
    });

    async function getLocationPermission() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied");
            return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setOrigin({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    }


    return (
        <View style={styles.container}>
            <View style={{ zIndex: 1, flex: 0.5 }}>
                <GooglePlacesAutocomplete
                    fetchDetails={true}
                    placeholder='A donde te diriges?'
                    onPress={(data, details = null) => {
                        // 'details' is provided when fetchDetails = true
                        console.log(JSON.stringify(details?.geometry?.location));
                        console.log(JSON.stringify(data));
                        setDestination({
                            latitude: details?.geometry?.location.lat,
                            longitude: details?.geometry?.location.lng,
                        });
                    }}
                    query={{
                        key: GOOGLE_MAPS_API_KEY ,
                        language: 'es',
                    }}
                    onFail={(error) => console.error(error)}
                />
            </View>

            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: origin.latitude,
                    longitude: origin.longitude,
                    latitudeDelta: 0.09,
                    longitudeDelta: 0.04,
                }}
            >
                <Marker
                    title="origin"
                    id="origin"
                    coordinate={origin}
                    draggable={true}
                    onDragEnd={(e) => setOrigin(e.nativeEvent.coordinate)}

                />
                <Marker
                    title="destination"
                    id="destination"
                    coordinate={destination}
                    draggable={true}
                    onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
                />
                <MapViewDirections
                    origin={origin}
                    destination={destination}
                    apikey={GOOGLE_MAPS_API_KEY}
                    mode="DRIVING"
                    strokeWidth={3}
                    strokeColor="green"
                />

            </MapView>
        </View>
    );
};

export default SolicitarRide;