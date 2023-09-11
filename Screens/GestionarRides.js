import { Text } from "react-native";
import { View, StyleSheet } from "react-native"

const GestionarRides = ({ navigation }) => {

    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e66' }]}>
                <Text>GestionarRides</Text>
        </View>
    )
}

export default GestionarRides;

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