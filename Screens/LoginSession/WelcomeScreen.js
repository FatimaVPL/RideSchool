import { View } from "react-native";
import { useTheme } from "../../hooks/ThemeContext";
import { useWindowDimensions } from "react-native";
import { Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import Lottie from 'lottie-react-native';

const WelcomeScreen = ({ navigation }) => {

    const { colors } = useTheme()
    const { width } = useWindowDimensions()

    return (
        <View style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
            <View style={{
                flex: 1,
                flexDirection: 'column',
            }}>

                <View style={{
                    display: 'flex',
                    flex: 0.4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                }}>
                    <View style={[{ width }, { display: 'flex', height: '100%' }]}>
                        <Lottie source={require('../../assets/LottieFiles/RideSchool.json')} />
                    </View>
                </View>
                <View
                    style={{
                        flex: 0.6,
                        paddingHorizontal: 25,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginTop: 60,
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 27,
                            fontWeight: '900',
                            marginBottom: 15,
                            color: colors.primary
                        }}>
                        Bienvenido a RideSchool !
                    </Text>

                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 18,
                            marginBottom: 15,
                            color: colors.text2,
                            fontWeight: "500",
                        }}>
                        Hacemos posibles los rides más rapidos y seguros para estudiantes.
                    </Text>

                </View>
            </View>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Onboarding')}
                    style={[styles.button]}>
                    <Text style={styles.text}>Comenzar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('LoginEmail')}
                    style={[styles.button]}>
                    <Text style={styles.text}>Ya tengo Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    text: {
        textAlign: 'center',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    button: {
        width: '80%',
        height: 70,
        marginTop: 10,
        backgroundColor: '#FCD85E', //por definir en dark
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000", //por definir en dark
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    }
})