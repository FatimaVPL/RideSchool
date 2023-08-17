import React, { useState, useRef, useCallback, useEffect } from "react";
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
   Animated,
   Keyboard,

} from "react-native"
import { TextInput } from 'react-native-paper'
import Lottie from 'lottie-react-native';
import { useTheme } from "../../hooks/ThemeContext";
import { useAuth } from "../../context/AuthContext";


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

   const [keyboardVisible, setKeyboardVisible] = useState(false)

   const [passwordsMatchError, setPasswordsMatchError] = useState(false);
   const [passwordVisible, setPasswordVisible] = useState(true);

   const [showLastSlide, setShowLastSlide] = useState(false);

   
   /*************************************************** */
   useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
         setKeyboardVisible(true);
      });
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
         setKeyboardVisible(false);
      });

      return () => {
         keyboardDidShowListener.remove();
         keyboardDidHideListener.remove();
      };
   }, []);


   const slides = [
      {
         id: 1,
         title: 'Ingresa tu correo institucional',
         info: 'Por motivos de seguridad, necesitamos verificar que eres un estudiante vigente mediante tu correo.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         input: [{ atr: "email" }]
      },
      {
         id: 2,
         title: 'Completa tu perfil',
         info: 'Cuentanos más de ti, para identificarte mejor.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         inputName: [{ atr: "name" }, { atr: "lastName" }]
      },
      {
         id: 3,
         title: 'Haz más segura tu cuenta',
         info: 'Recuerda que una buena contraseña hace más segura tu cuenta.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         inputPassword: [{ atr: "password" }, { atr: "passwordConfirm" }]
      },
      {
         id: 4,
         title: 'Elije uno de los roles, para comenzar',
         info: 'Con RideSchool, podrás ofrecer rides a otros estudiantes o solicitarlos tú. Puedes cambiar tu rol tarde desde tu perfil.',
         svg: <Lottie source={require('../../assets/LottieFiles/passagerOrCar.json')} />,
         options: [{ label: "Pasajero", value: "pasajero" }, { label: "Conductor", value: "conductor" }]
      },
      {
         id: 5,
         title: 'Completa el perfil de conductor',
         info: 'Para ser conductor, debes de completar los siguientes datos.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         input: [{ atr: "tipoAutomovil" }, { atr: "licencia" }]
      },
   ].filter(item => item.id !== 5 || (showLastSlide && formData.role === "conductor"))

   const handleSelectRole = (role) => {
      setFormData(p => ({ ...p, role: role }))
      if(role=== "conductor"){
         setShowLastSlide(true)
      }else{
         setShowLastSlide(false)
      }
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
            slidesRef.current.scrollToIndex({ index: selectedScreen + 1 })
            setSelectedScreen(p => p + 1)
         }
         else {
            // Validar que las contraseñas sean iguales

            if (formData.password !== formData.passwordConfirm) {
               setPasswordsMatchError(true); // Actualiza el estado para mostrar el mensaje de error
               return; // Detén la ejecución si las contraseñas no coinciden
            }


            // Crear Un Registro
            // console.log(formData)
            setUsage()

            registerUser({
               email: formData.email,
               name: formData.name,
               lastName: formData.lastName,
               password: formData.password,
               role: formData.role
            })

         }
      } catch (err) {
         alert(err)
      } finally {
         setLoading(false)
      }
   }

   const Screen = ({ item }) => {
      const { title, info, svg, options, input, inputPassword, inputName} = item

      return (
         <>
            <View style={[{ width }, { display: 'flex' }]}>
               <StatusBar
                  animated={true}
                  barStyle={'light'}
               />
               <View style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  color: colors.text,
                  position: 'relative',
                  paddingBottom: keyboardVisible ? 300 : 0, // Ajusta este valor según sea necesario
               }}>

                  <View style={{
                     display: 'flex',
                     flex: 0.4,
                     justifyContent: 'center',
                     alignItems: 'center',
                     marginTop: 20,
                  }}>
                     <View style={[
                        { width }, { display: 'flex', height: '100%' }]}>
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
                                 <Text style={{ color: 'white', fontWeight: 'bold', }}>{/* Updated color to white */}
                                    {option.label}
                                 </Text>
                              </TouchableOpacity>)}
                        </View>
                     }
                     {
                        inputPassword &&
                        <View style={{ display: 'flex' }}>
                           {inputPassword.map((field, indx) =>
                              <TextInput
                                 // ref={inputRefs.current[field.atr]}
                                 style={{
                                    width: 300,
                                    height: 50,
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    shadowColor: '#000',
                                    shadowOffset: {
                                       width: 0,
                                       height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    paddingHorizontal: 16,
                                    marginTop: 10,
                                 }}
                                 key={`${field.atr}-${indx}`}
                                 value={formData[field.atr]}
                                 onChangeText={(text) => handleChangeText(field.atr, text)}
                                 placeholder={`${indx}` == 0 ? "Ingresa tu contraseña": "Repite tu contraseña"}
                                 placeholderTextColor="#888"
                                 secureTextEntry={passwordVisible}
                                 right={<TextInput.Icon icon={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}
                              autoFocus={false}
                              />
                           )}
                        </View>
                     }
                              {
                        inputName &&
                        <View style={{}}>
                           {inputName.map((field, indx) =>
                              <TextInput
                                 // ref={inputRefs.current[field.atr]}
                                 style={{
                                    width: 300,
                                    height: 50,
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    shadowColor: '#000',
                                    shadowOffset: {
                                       width: 0,
                                       height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    paddingHorizontal: 16,
                                    marginTop: 10,
                                 }}
                                 key={`${field.atr}-${indx}`}
                                 value={formData[field.atr]}
                                 onChangeText={(text) => handleChangeText(field.atr, text)}
                                 placeholder={`${indx}` == 0 ? "Ingresa tus nombre(s)": "Ingresa tu apellido"}
                                 placeholderTextColor="#888"
                                 autoCapitalize="none"
                              />

                           )}
                        </View>
                     }
                     {
                        input &&
                        <View style={{}}>
                           {input.map((field, indx) =>
                              <TextInput
                                 // ref={inputRefs.current[field.atr]}
                                 style={{
                                    width: 300,
                                    height: 50,
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    shadowColor: '#000',
                                    shadowOffset: {
                                       width: 0,
                                       height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    paddingHorizontal: 16,
                                    marginTop: 10,
                                 }}
                                 key={`${field.atr}-${indx}`}
                                 value={formData[field.atr]}
                                 onChangeText={(text) => handleChangeText(field.atr, text)}
                                 placeholder= "Ingresa tu correo"
                                 placeholderTextColor="#888"
                                 autoCapitalize="none"
                              />

                           )}
                        </View>
                     }

                     {passwordsMatchError && (
                        <Text style={{ color: '#EC5B57', marginBottom: 10, marginTop: 10, textAlign: 'center' }}>
                           Las contraseñas no coinciden. Por favor, inténtalo nuevamente.
                        </Text>
                     )
                     }
                  </View>
               </View>
            </View>
         </>
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
            <KeyboardAvoidingView style={{ width: '100%', height: '85%' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
               <View style={{ flex: 1 }}>
                  <FlatList
                     ref={slidesRef}
                     data={slides}
                     //scrollEnabled={true}
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
               height: '15%',
               flexDirection: 'column',
               position: 'relative',
            }}>
               {/* Indicador de Pagina */}
               <View style={{
                  width: '100%',
                  height: 20,
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
                  paddingHorizontal: 35,
                  paddingBottom: 10,
                  display: 'flex',

               }}>
                  <TouchableOpacity
                     // TODO: Styles disabled
                     disabled={loading}
                     onPress={scrollTo}
                     style={{
                        width: '100%',
                        height: 60,
                        backgroundColor: 'green', //por definir en dark
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
                     }}>
                     <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',

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
      width: 150,
      alignItems: 'center',
   },
   selectedOption: {
      marginTop: 10,
      backgroundColor: '#A3772A', //por definir en dark
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
      width: 150,
      alignItems: 'center',
   }
})