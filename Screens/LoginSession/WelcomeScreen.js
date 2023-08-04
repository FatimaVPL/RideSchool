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
                        Hacemos posibles los ride\'s más rapidos y seguros para estudiantes.
                    </Text>

                </View>
            </View>
            <View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Onboarding')}
                    style={[styles.button]}>
                    <Text>Comenzar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('LoginEmail')}
                    style={[styles.button]}>
                    <Text>Ya tengo Cuenta</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default WelcomeScreen;

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    }
})