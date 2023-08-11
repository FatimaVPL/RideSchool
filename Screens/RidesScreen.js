import { Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { View, StyleSheet } from "react-native"

const RidesScreen = ({ navigation }) => {

    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e66' }]}>
            <TouchableOpacity
                onPress={() => navigation.navigate('SolicitarRide')}
            >
                <Text>Solicitar Ride</Text>
            </TouchableOpacity>
        </View>
    )
}

export default RidesScreen;

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