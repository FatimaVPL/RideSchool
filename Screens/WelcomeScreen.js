import { useState, useRef } from "react";
import {
   View,
   Text,
   TouchableOpacity,
   StatusBar,
   FlatList,
   useWindowDimensions,
   StyleSheet,
   KeyboardAvoidingView,
   Platform,
   Animated
} from "react-native"
import { useTheme } from "../hooks/ThemeContext";
import PassagerOrCarSvg from "../assets/Svg/PassagerOrCarSvg"
import CredentialsSvg from "../assets/Svg/CredentialsSvg";
import { Button, TextInput } from 'react-native-paper'
import Lottie from 'lottie-react-native';
import { useAuth } from "../context/AuthContext";

const WelcomeScreen = ({ navigation }) => {

   const {setUsage} = useAuth()
   const { colors } = useTheme()
   const { width } = useWindowDimensions()

   const [roleSelected, setRoleSelected] = useState(0)
   const roles = [
      { id: 0, name: 'Pasajero' },
      { id: 1, name: 'Chofer' },
      { id: 2, name: 'Ambos' }
   ]

   const [selectedScreen, setSelectedScreen] = useState(0)
   const scrollX = useRef(new Animated.Value(0)).current
   const slidesRef = useRef(null)


   const onViewableItemsChanged = useRef( ({ viewableItems }) =>{
      setSelectedScreen( viewableItems[0].index )
   }).current

   const slides = [
      {
         id: 1,
         title: 'Bienvenido a RideSchool !',
         info: 'Hacemos posibles los ride\'s más rapidos y seguros para estudiantes.',
         svg: <Lottie source={require('../assets/LottieFiles/RideSchool.json')} />,
         controls: <></>
      },
      {
         id: 2,
         title: 'Como planeas usar RideSchool ?',
         info: 'Con RideSchool, podrás ofrecer ride\'s a otros estudiantes o solicitarlos tu? Puedes cambiar tus preferencias más tarde desde tu perfil.',
         svg: <Lottie source={require('../assets/LottieFiles/passagerOrCar.json')} />,
         /*controls: (
            <View style={{ display: 'flex', flexDirection: 'row', paddingVertical: 20 }}>
               {
                  roles.map((role, index) =>
                     <Button
                        key={'role' + role.id}
                        style={{
                           flex: 1,
                           height: 45,
                           justifyContent: 'center',
                           marginHorizontal: 5,
                           backgroundColor: roleSelected === index ? colors.primary : colors.background2,
                        }}
                        onPress={() => setRoleSelected(index)}
                     >
                        <Text style={{
                           color: roleSelected === index ? 'white' : colors.text2,
                           fontWeight: 'bold',
                           fontSize: 16,
                        }}>
                           {role.name}
                        </Text>
                     </Button>)
               }
            </View >
         )*/
      },
      {
         id: 3,
         title: 'Ingresa tu número de control',
         info: 'Por motivos de seguridad, necesitamos verificar que eres un estudiante de la escuela.',
         svg: <Lottie source={require('../assets/LottieFiles/Credentials.json')} />,
         /*controls: (
            <TextInput
               style={{ width: '100%' }}
               mode="outlined"
               label="Número de control"
               selectionColor={colors.primary}
               outlineColor={colors.text2}
               activeOutlineColor={colors.primary}
               contentStyle={{ backgroundColor: 'transparent' }}
            />
         ),*/
      }
   ]
   
   const scrollTo = () =>{
      if( selectedScreen < slides.length - 1 ){
         slidesRef.current.scrollToIndex( {index:selectedScreen + 1} )
      }else{
         setUsage()
         navigation.navigate('Registro')
      }
   }

   const Screen = ({ item }) => {
      const { title, info, svg } = item

      return (
         <View style={[{ width }, { display: 'flex' }]}>
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
                  <View style={[{width},{ display: 'flex', height: '100%' }]}>
                     {svg}
                  </View>
               </View>
               <View style={{
                  flex: 0.6,
                  paddingHorizontal: 25,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: 60,
               }}
               >
                  <Text style={{
                     textAlign: 'center',
                     fontSize: 27,
                     fontWeight: '900',
                     marginBottom: 15,
                     color: colors.primary
                  }}>
                     {title}
                  </Text>

                  <Text style={{
                     textAlign: 'center',
                     fontSize: 18,
                     marginBottom: 15,
                     color: colors.text2,
                     fontWeight: "500",
                  }}>
                     {info}
                  </Text>
               </View>
            </View>
         </View>
      )
   }

   return (
      <>
         <StatusBar
            animated={true}
            barStyle={'ligth'}
         />
         <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            color: colors.text,
            position: 'relative',
         }}>

            {/*  Slides  */}
            <KeyboardAvoidingView style={{ width: '100%', height: '80%' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
               <View style={{ flex: 1 }}>
                  <FlatList
                     ref={slidesRef}
                     data={slides}
                     onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                     })}
                     renderItem={({ item }) => <Screen item={item} />}
                     horizontal
                     showsHorizontalScrollIndicator={false}
                     pagingEnabled
                     scrollEventThrottle={32}
                     onViewableItemsChanged={onViewableItemsChanged}
                  />
               </View>
            </KeyboardAvoidingView>


            {/*  Controles  */}
            <View style={{
               width: '100%',
               height: '20%',
               flexDirection: 'column',
               position: 'relative',
            }}>
               {/* Indicador de Pagina */}
               <View style={{
                  width: '100%',
                  height: 50,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}>
                  {
                     slides.map((item, i) => {

                        let inputRange = [(i - 1) * width, i * width, (i + 1) * width]

                        let opacity = scrollX.interpolate({
                           inputRange,
                           outputRange: [0.3, 1, 0.3],
                           extrapolate: 'clamp'
                        })

                        return <Animated.View
                           key={'T' + i}
                           style={{
                              width: 10,
                              height: 10,
                              backgroundColor: colors.primary,
                              opacity: opacity,
                              borderRadius: 5,
                              marginHorizontal: 5,
                           }}>
                        </Animated.View>
                     })
                  }
               </View>

               {/* Boton de Continuar */}
               <View style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  paddingHorizontal: 30,
                  paddingTop: 10,
                  paddingBottom: 25,
                  display: 'flex',
               }}>
                  <TouchableOpacity
                     onPress={scrollTo}
                     style={{
                        width: '100%',
                        height: 60,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: 'center',
                        borderRadius: 10,

                     }}>
                     <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                     }}>
                        Continuar
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </>
   )
}
export default WelcomeScreen
