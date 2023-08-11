import React, { useState, useRef, useCallback } from "react";
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
import { TextInput } from 'react-native-paper'
import Lottie from 'lottie-react-native';
import { useTheme } from "../../hooks/ThemeContext";
import { useAuth } from "../../context/AuthContext";

/**
 * Dumy Shit
 */
const dumyAlumnos = [
   { noControl: "s19120122", nombre: "Pepe" },
   { noControl: "s19120123", nombre: "Jorge" },
   { noControl: "s19120124", nombre: "Jose" },
   { noControl: "s19120125", nombre: "Maria" },
]
function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
 }

async function dumyBuscarAlumno(noControl) {
   await sleep(2000)
   if (!dumyAlumnos.some(almno => almno.noControl === noControl)) {
      throw new Error('No es un alumno')
   }
}
/************************************************************ */

const OnboardingScreen = ({ navigation }) => {

   const { setUsage, registerUser } = useAuth()
   const { colors } = useTheme()
   const { width } = useWindowDimensions()

   const [formData, setFormData] = useState({})
   const [selectedScreen, setSelectedScreen] = useState(0)
   const [loading, setLoading] = useState(false)
   
   const scrollX = useRef(new Animated.Value(0)).current
   const slidesRef = useRef(null)

   const slides = [
      {
         id: 1,
         title: 'Como planeas usar RideSchool ?',
         info: 'Con RideSchool, podrás ofrecer ride\'s a otros estudiantes o solicitarlos tu? Puedes cambiar tus preferencias más tarde desde tu perfil.',
         svg: <Lottie source={require('../../assets/LottieFiles/passagerOrCar.json')} />,
         options: [{ label: "Pasajero", value: "pasajero" }, { label: "Chofer", value: "chofer" }]
      },
      {
         id: 2,
         title: 'Ingresa tu número de control',
         info: 'Por motivos de seguridad, necesitamos verificar que eres un estudiante de la escuela.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         input: [{ atr: "noControl" }]
      },
      {
         id: 3,
         title: 'Crea una contraseña',
         info: 'Ingresa una contraseña segura para proteger tu cuenta.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         input: [{ atr: "password" }, { atr: "passwordConfirm" }]
      }
   ]

   const handleSelectRole = (role) => {
      setFormData(p => ({ ...p, role: role }))
   }
   const handleChangeText = (atr, text) => {
      setFormData(p => ({ ...p, [atr]: text }))
   }

   const onViewableItemsChanged = useRef(({ viewableItems }) => {
      setSelectedScreen(viewableItems[0].index)
   }).current

   /* Pasar a la siguiente pantalla */
   const scrollTo = async () => {
      try {
         setLoading(true)
         // No es la ultima pantalla
         if (selectedScreen < slides.length - 1) {
            if (selectedScreen === 2) {
               // TODO : Verificar que sea un alumno
               await dumyBuscarAlumno(formData.noControl.toLowerCase().trim())
            }
            slidesRef.current.scrollToIndex({ index: selectedScreen + 1 })
            setSelectedScreen(p => p + 1)
         }
         else {
            // Crear Un Registro
            console.log(formData)
            setUsage()
            registerUser({
               email: formData.noControl.toLowerCase().trim() + "@alumnos.itsur.edu.mx",
               password: formData.password,
               role: formData.role,
               firstName: dumyAlumnos.find(almno => almno.noControl === formData.noControl.toLowerCase().trim()).nombre
            })
         }
      } catch (err) {
         alert(err)
      } finally {
         setLoading(false)
      }
   }

   const Screen = ({ item }) => {
      const { title, info, svg, options, input } = item

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
                  <View style={[{ width }, { display: 'flex', height: '100%' }]}>
                     {svg}
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
                     {title}
                  </Text>

                  <Text
                     style={{
                        textAlign: 'center',
                        fontSize: 18,
                        marginBottom: 15,
                        color: colors.text2,
                        fontWeight: "500",
                     }}>
                     {info}
                  </Text>
                  {
                     options &&
                     <View style={{ display: 'flex' }}>
                        {options.map((option, indx) =>
                           <TouchableOpacity
                              key={`${option.value}-${indx}`}
                              style={formData?.role === option.value ? styles.selectedOption : styles.option}
                              onPress={() => handleSelectRole(option.value)}>
                              <Text>
                                 {option.label}
                              </Text>
                           </TouchableOpacity>)}
                     </View>
                  }
                  {
                     input &&
                     <View style={{}}>
                        {input.map((field, indx) =>
                           <TextInput
                              //ref={inputRefs.current[field.atr]}
                              key={`${field.atr}-${indx}`}
                              value={formData[field.atr]}
                              onChangeText={(text) => handleChangeText(field.atr, text)}
                           >
                           </TextInput>)}
                     </View>
                  }
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
                     //scrollEnabled={false}
                     onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false, })}
                     renderItem={Screen}
                     horizontal
                     showsHorizontalScrollIndicator={false}
                     pagingEnabled
                     scrollEventThrottle={100}
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
                     // TODO: Styles disabled
                     disabled={loading}
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
export default OnboardingScreen

const styles = StyleSheet.create({
   option: {
      width: '100%',
      height: 50,
      backgroundColor: "#F0F0F0",
      borderRadius: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 5,
   },
   selectedOption: {
      width: '100%',
      height: 50,
      backgroundColor: "#e6e6e6",
      borderRadius: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 5,
   }
})