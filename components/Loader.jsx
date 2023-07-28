import { useEffect, useRef } from "react";
import { View, Image, Text, Animated, Easing } from "react-native";
import LottieView from 'lottie-react-native'


export default function Loader() {

    const scaleAnim = useRef(new Animated.Value(0.8)).current
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(
            scaleAnim,
            {
                toValue: 1,
                duration: 3000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }
        ).start();
        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                duration: 750,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }
        ).start();


    }, [])

    return (
        <Animated.View                 // Special Animated View
            style={{
                display: 'flex',
                width: '100%',
                position: 'relative',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: fadeAnim,         // Bind opacity to animated value
                transform: [{ scale: scaleAnim }]

            }}
        >
            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', position: 'absolute', }}>
                {/*<BackArt />*/}
                <LottieView
                    source={require('../assets/LottieFiles/RLoading.json')}
                    autoPlay>
                </LottieView>
            </View>
        </Animated.View>
    )
}