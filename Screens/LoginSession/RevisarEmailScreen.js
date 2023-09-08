import { View } from "react-native";
import { useTheme } from "../../hooks/ThemeContext";
import { useWindowDimensions } from "react-native";
import { Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import Lottie from 'lottie-react-native';

const RevisarEmailScreen = ({ navigation }) => {

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
                            fontSize: 18,
                            marginBottom: 15,
                            color: colors.text2,
                            fontWeight: "500",
                        }}>
                       Revisa tu correo electronico para poder loguearte!
                    </Text>
                </View>
            </View>
        </View>
    )
}
export default RevisarEmailScreen;

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
        backgroundColor: '#E1A43B', //por definir en dark
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