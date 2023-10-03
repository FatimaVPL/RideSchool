import React, { useState, useRef, useEffect} from "react";
import { View, Text, TouchableOpacity, StatusBar, FlatList, useWindowDimensions, StyleSheet, KeyboardAvoidingView, Platform, Animated, Image, Alert } from "react-native"
import { TextInput, RadioButton, ActivityIndicator, MD2Colors, Checkbox } from 'react-native-paper'
import Lottie from 'lottie-react-native';
import { useTheme } from "../../hooks/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { object, string, ref } from 'yup';
import { Formik } from 'formik';
import CorreosActivos from "./CorreosActivos";
import areIntervalsOverlappingWithOptions from "date-fns/esm/fp/areIntervalsOverlappingWithOptions/index";

const OnboardingScreen = ({ navigation }) => {
   const { setUsage, registerUser, firstTime } = useAuth()
   const { colors } = useTheme()
   const { width } = useWindowDimensions()

   const [formData, setFormData] = useState({
      email: "",
      name: "",
      lastName: "",
      password: "",
      passwordConfirm: "",
      role: "",
      tipoVehiculo: "motocicleta",
      licencia: "motocicleta",
      conductor: false
   })

   const [selectedScreen, setSelectedScreen] = useState(0)
   const [loading, setLoading] = useState(false)

   const scrollX = useRef(new Animated.Value(0)).current
   const slidesRef = useRef(null)


   const [passwordVisible, setPasswordVisible] = useState(true)

   const [showLastSlide, setShowLastSlide] = useState(false)

   const [spiner, setSpiner] = useState(false)


   //Variables de control de estado de error
   let isEmailInvalid = true;
   let isNameInvalid = true;
   let isPasswordInvalid = true;

   //Esquema de validación
   const validationSchema = object().shape({
      email: string()
         .required("Campo obligatorio")
         .email('Dirección de correo electrónico no válida')
         .max(31, "Deben ser 31 caracteres")
         .test('domain', 'El dominio debe ser alumnos.itsur.edu.mx', value => {
            if (!value) return false;
            const domain = value.split('@')[1];
            return domain === 'alumnos.itsur.edu.mx';
         }),
      name: string()
         .required("Campo obligatorio")
         .min(4, "Debe ser un nombre válido")
         .max(20, "Debe ser menor a 20")
         .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ]+(?:\s[A-Za-záéíóúÁÉÍÓÚñÑ]+)?$/, "Debe contener solo letras"),
      lastName: string()
         .required("Campo obligatorio")
         .min(4, "Debe ser un apellido válido")
         .max(20, "Debe ser menor a 20")
         .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ]+(?:\s[A-Za-záéíóúÁÉÍÓÚñÑ]+)?$/, "Debe contener solo letras"),
      password: string()
         .required("Campo obligatorio")
         .min(8, "Debe ser mayor o igual a 8")
         .max(16, "Debe ser menor a 17"),
      passwordConfirm:
         string()
            .required("Campo obligatorio")
            .oneOf([ref('password'), null], 'Deben coincidir ambas contraseñas')
            .min(8, "Debe ser mayor o igual a 8")
            .max(16, "Debe ser menor a 17")
   })

   /**********************************  Slides *******************************************/
   const slides = [
      {
         id: 1,
         title: 'Ingresa tu correo institucional',
         info: 'Necesitamos verificar que eres un estudiante vigente.',
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
         title: 'Da clic a uno de los roles, para comenzar',
         info: 'Podrás ofrecer rides a otros estudiantes o solicitarlos tú. Puedes cambiar tu rol más tarde desde tu perfil.',
         svg: <Lottie source={require('../../assets/LottieFiles/passagerOrCar.json')} />,
         options: [{ label: "Pasajero", value: "Pasajero" }, { label: "Conductor", value: "Conductor" }]
      },
      {
         id: 5,
         title: 'Completa el perfil de conductor',
         //info: 'Para ser conductor, debes de completar los siguientes datos.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         text1: [{ value: "Elije el tipo de vehículo con el que cuentas:" }],
         optionsConductor: [{ label: "Motocicleta", value: "motocicleta" }, { label: "Automóvil", value: "automovil" }, { label: "Ambos", value: "ambos" }],
      },
      {
         id: 6,
         title: 'Completa el perfil de conductor',
         // info: 'Para ser conductor, debes de completar los siguientes datos.',
         svg: <Lottie source={require('../../assets/LottieFiles/Credentials.json')} />,
         text2: [{ value: "¿Tienes licencia de motocicleta, automóvil o ambas?" }],
         optionsLicencia: [{ label: "Motocicleta", value: "motocicleta" }, { label: "Automóvil", value: "automovil" }, { label: "Ambos", value: "ambas" }, { label: "Ninguna", value: "ninguna" }]
      }
   ].filter(item => item.id !== 5 && item.id !== 6 || (showLastSlide && formData.role === "Conductor"))

   const handleSelectRole = (role) => {
      setFormData(p => ({ ...p, role: role }))
      //Si se elige conductor aparecen otros slides
      if (role === "Conductor") {
         setShowLastSlide(true)
      } else {
         setShowLastSlide(false)
      }
   }
   const handleChangeText = (atr, text) => {
      setFormData(p => ({ ...p, [atr]: text }))
   }

   const handleTipoAuto = (value) => {
      setFormData(p => ({ ...p, tipoVehiculo: value }))
   }

   const handleLicencia = (value) => {
      setFormData(p => ({ ...p, licencia: value }))
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
            switch (selectedScreen) {
               case 0:
                  if (!isEmailInvalid && formData.email.trim() !== "") {
                     slidesRef.current.scrollToIndex({ index: selectedScreen + 1 });
                     setSelectedScreen(selectedScreen + 1);
                  }
                  break;
               case 1:
                  if (!isNameInvalid && formData.name.trim() !== "" && formData.lastName.trim() !== "") {
                     slidesRef.current.scrollToIndex({ index: selectedScreen + 1 });
                     setSelectedScreen(selectedScreen + 1);
                  }
                  break;
               case 2:
                  if (!isPasswordInvalid && formData.password.trim() !== "" && formData.passwordConfirm.trim() !== "") {
                     slidesRef.current.scrollToIndex({ index: selectedScreen + 1 });
                     setSelectedScreen(selectedScreen + 1);
                  }
                  break;
               case 3:
                  slidesRef.current.scrollToIndex({ index: selectedScreen + 1 })
                  setSelectedScreen(selectedScreen + 1)
                  break;
               case 4:
                  slidesRef.current.scrollToIndex({ index: selectedScreen + 1 });
                  setSelectedScreen(selectedScreen + 1);
                  break;
            }
         }
         else {
            if (formData.role === "Conductor") {
               switch (selectedScreen) {
                  case 4:
                     slidesRef.current.scrollToIndex({ index: selectedScreen + 1 });
                     setSelectedScreen(selectedScreen + 1);
                     break;
                  case 5:
                     // Crear Un Registro
                     setSpiner(true);
                     if (formData.role !== "") {
                        CorreosActivos({ correo: formData.email })
                           .then((result) => {
                              if (result) {
                                 crearUsuario()
                              } else {
                                 Alert.alert("Correo no vigente","Tu correo no está en nuestros registros")
                                 navigation.navigate('Welcome')
                              }
                           }).catch((error) => {
                              Alert.alert("Error de verificación","Ocurrio un error al verificar tu email")
                              navigation.navigate('Welcome')
                           })
                     } 
                     setSpiner(false)
                     break;
               }
            } else {
               // Crear registro
               setSpiner(true)
               if (formData.role !== "") {
                  CorreosActivos({ correo: formData.email })
                     .then((result) => {
                        if (result) {
                           // Hacer algo si el correo existe en la base de datos
                           crearUsuario()
                        } else {
                           Alert.alert("Correo no vigente","Tu correo no está en nuestros registros")
                           navigation.navigate('Welcome')
                        }
                     }).catch((error) => {
                        Alert.alert("Error de verificación","Ocurrio un error al verificar tu email")
                        navigation.navigate('Welcome')
                     })
               }
               setSpiner(false)
            }
         }
      } catch (err) {
         Alert.alert("Error",err)
      } finally {
         setLoading(false)
      }
   }

   const crearUsuario = async () => {
      if (formData.role !== "Conductor") {
         formData.tipoVehiculo = "";
         formData.licencia = "";
      }else{
         formData.conductor = true
      }

      try {
         // Registro de usuario
         await registerUser({
            email: formData.email,
            password: formData.password,
            role: formData.role,
            firstName: formData.name,
            lastName: formData.lastName,
            tipoVehiculo: formData.tipoVehiculo,
            licencia: formData.licencia,
            conductor: formData.conductor
         })
         setUsage()
         navigation.navigate('Welcome')
      } catch (error) {
       areIntervalsOverlappingWithOptions("Error al registrar el usuario", error)
      }
   }

   /* Regresa los slides */
   const regresar = () => {
      if (selectedScreen > 0) {
         slidesRef.current.scrollToIndex({ index: selectedScreen - 1 });
         setSelectedScreen(selectedScreen - 1);
      }
   }


   /* Componente condicional */
   const Screen = ({ item }) => {
      const { title, info, svg, options, input, inputPassword, inputName, optionsConductor, optionsLicencia, text1, text2 } = item
      return (
         <>
            <Formik
               enableReinitialize={true}
               initialValues={{ email: formData.email, name: formData.name, lastName: formData.lastName, password: formData.password, passwordConfirm: formData.passwordConfirm }}
               validationSchema={validationSchema}
               validateOnMount={true}
            >
               {({ handleBlur, handleChange, touched, errors, values }) => (
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
                        paddingBottom: 100
                     }}>

                        <View style={{
                           flex: 0.4,
                           justifyContent: 'center',
                           alignItems: 'center',
                        }}>
                           <View style={[
                              { width },
                              { display: 'flex', height: '80%' }]}>
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
                              marginTop: 30,
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
                              text1 &&
                              <View style={{ display: 'flex' }}>
                                 {text1.map((option, indx) =>
                                    <Text style={{ fontWeight: 'bold', marginTop: 10, color: '#DCA934', fontSize: 16 }}>
                                       {option.value}
                                    </Text>
                                 )}
                              </View>
                           }
                              {
                              options &&
                              <View style={{ display: 'flex' }}>
                              {options.map((option, indx) => (
                                <Checkbox.Item
                                  key={`${option.value}-${indx}`}
                                  label={option.label}
                                  status={formData?.role === option.value ? 'checked' : 'unchecked'}
                                  onPress={() => {
                                    handleSelectRole(option.value)
                                  }}
                                  labelStyle={{ color: colors.text, fontWeight: 'bold', fontSize:20 }}
                                  uncheckedColor="#E1A43B" 
                                  color="#E1A43B" 
                                />
                              ))}
                            </View>
                           }
                           {
                              inputPassword &&
                              <View style={{ display: 'flex' }}>
                                 {inputPassword.map((field, indx) =>
                                    <View key={`${field.atr}-${indx}`}>
                                       <TextInput
                                          style={{
                                             width: 300,
                                             height: 50,
                                             borderRadius: 8,
                                             backgroundColor: colors.input,
                                             color:colors.text,
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
                                          value={values[field.atr]}
                                          onChangeText={(text) => {
                                             handleChangeText(field.atr, text); // Llama a handleChangeText
                                             handleChange(field.atr); // Llama a handleChange
                                          }}
                                          placeholder={`${indx}` == 0 ? "Ingresa tu contraseña" : "Repite tu contraseña"}
                                          placeholderTextColor="#888"
                                          secureTextEntry={passwordVisible}
                                          right={<TextInput.Icon icon={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}
                                          onBlur={handleBlur(field.atr)}
                                          theme={{ colors: { text: 'green', primary: 'green' } }}
                                       />
                                       {touched[field.atr] && errors[field.atr] && <Text style={{ color: "#F4574B" }}>{errors[field.atr]}</Text>}
                                       {
                                          touched[field.atr] && errors[field.atr] ? isPasswordInvalid = true : isPasswordInvalid = false
                                       }
                                    </View>
                                 )}
                              </View>
                           }
                           {
                              inputName &&
                              <View  >
                                 {inputName.map((field, indx) =>
                                    <View key={`${field.atr}-${indx}`}>
                                       <TextInput
                                          style={{
                                             width: 300,
                                             height: 50,
                                             borderRadius: 8,
                                             backgroundColor: colors.input,
                                             color:colors.text,
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
                                          // value={formData[field.atr]}
                                          // onChangeText={(text) => handleChangeText(field.atr, text)}
                                          defaultValue={values[field.atr]}
                                          onChangeText={(text) => {
                                             handleChangeText(field.atr, text);
                                             handleChange(field.atr);
                                          }}
                                          placeholder={`${indx}` == 0 ? "Ingresa tus nombre(s)" : "Ingresa tu apellido"}
                                          placeholderTextColor="#888"
                                          onBlur={handleBlur(field.atr)}
                                          theme={{ colors: { text: 'green', primary: 'green' } }}
                                       />
                                       {touched[field.atr] && errors[field.atr] && <Text style={{ color: "#F4574B" }}>{errors[field.atr]}</Text>}
                                       {
                                          touched[field.atr] && errors[field.atr] ? isNameInvalid = true : isNameInvalid = false
                                       }
                                    </View>
                                 )}
                              </View>
                           }
                           {
                              optionsConductor &&
                              <View  >
                                 <RadioButton.Group
                                    onValueChange={newValue => handleTipoAuto(newValue)} value={formData.tipoVehiculo}>
                                    <View style={{ flexDirection: 'column' }}>
                                       {optionsConductor.map((option, index) => (
                                          (index % 2 === 0) && (
                                             <View key={`${option.value}-${index}`} style={{ flexDirection: 'row', marginBottom: 10 }}>
                                                <RadioButton.Item
                                                   color="green"
                                                   labelStyle={{ color: colors.text }}
                                                   label={optionsConductor[index].label}
                                                   value={optionsConductor[index].value}
                                                />
                                                {index + 1 < optionsConductor.length && (
                                                   <RadioButton.Item
                                                      color="green"
                                                      labelStyle={{ color: colors.text }}
                                                      label={optionsConductor[index + 1].label}
                                                      value={optionsConductor[index + 1].value}
                                                   />
                                                )}
                                             </View>
                                          )
                                       ))}
                                    </View>
                                 </RadioButton.Group>
                              </View>
                           }
                           {
                              text2 &&
                              <View style={{ display: 'flex' }}>
                                 {text2.map((option, indx) =>
                                    <Text style={{ fontWeight: 'bold', marginTop: 10, color: '#DCA934', fontSize: 16 }}>
                                       {option.value}
                                    </Text>
                                 )}
                              </View>
                           }
                           {
                              optionsLicencia &&
                              <View  >
                                 <RadioButton.Group onValueChange={newValue => handleLicencia(newValue)} value={formData.licencia}>
                                    <View style={{ flexDirection: 'column' }}>
                                       {optionsLicencia.map((option, index) => (
                                          (index % 2 === 0) && (
                                             <View key={`${index.value}-${index}`} style={{ flexDirection: 'row', marginBottom: 10 }}>
                                                <RadioButton.Item
                                                   color="green"
                                                   labelStyle={{ color: colors.text}}
                                                   label={optionsLicencia[index].label}
                                                   value={optionsLicencia[index].value}
                                                />
                                                {index + 1 < optionsLicencia.length && (
                                                   <RadioButton.Item
                                                      color="green"
                                                      labelStyle={{ color: colors.text }}
                                                      label={optionsLicencia[index + 1].label}
                                                      value={optionsLicencia[index + 1].value}
                                                   />
                                                )}
                                             </View>
                                          )
                                       ))}
                                    </View>
                                 </RadioButton.Group>
                              </View>
                           }
                           {
                              input &&
                              <View  >
                                 {input.map((field, indx) =>
                                    <View key={`${field.atr}-${indx}`}>
                                       <TextInput
                                          style={{
                                             color: 'black',
                                             width: 350,
                                             height: 50,
                                             borderRadius: 8,
                                             backgroundColor: colors.input,
                                             color:colors.text,
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
                                          value={values[field.atr]}
                                          onChangeText={(text) => {
                                            handleChangeText(field.atr, text); 
                                            handleChange(field.atr); 
                                          }}
                                          placeholder="Ingresa tu correo"
                                          placeholderTextColor="#888"
                                          autoCapitalize="none"
                                          onBlur={handleBlur(field.atr)}
                                          autoComplete='email'
                                          theme={{ colors: { text: 'green', primary: 'green' } }}
                                       />
                                       {
                                          touched[field.atr] && errors[field.atr] && <Text style={{ color: "#F4574B" }}>{errors[field.atr]}</Text>}
                                       {
                                          touched[field.atr] && errors[field.atr] ? isEmailInvalid = true : isEmailInvalid = false
                                       }
                                    </View>
                                 )}
                              </View>
                           }
                        </View>
                     </View>
                  </View>)}
            </Formik>
         </>
      )
   }

   return (
      <>
         <StatusBar
            animated={true}
            barStyle={'ligth'}
         />
               {spiner ? (
       <View style={{
         flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22
      }}>
       <ActivityIndicator animating={true} size="large" color={MD2Colors.red800} style={{ transform: [{ scale: 1.5 }] }} />
       <Text style={{ color: colors.text, marginTop: 40 }}>Cargando...</Text>
   </View>
      ) : (
         <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            color: colors.text,
            position: 'relative',
            paddingTop: 50,
            backgroundColor: colors.background
         }}>
            <View style={{
               width: 70,
               height: 65,
               marginLeft: 15,
               marginTop: 15,
               position: 'absolute',
            }}>
               <Image
                  source={require('../../assets/rideSchoolS.png')}
                  style={{
                     width: '90%',
                     height: '90%',
                  }}
               />
            </View>
            {/*  Slides  */}
            <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
               <View style={{ flex: 1 }}>
                  <FlatList
                     ref={slidesRef}
                     data={slides}
                     scrollEnabled={false}
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

               {/* Boton de contiuar y regresar */}
               <View style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  paddingHorizontal: 35,
                  paddingBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
               }}>
                  <TouchableOpacity
                     // TODO: Styles disabled
                     disabled={loading}
                     onPress={regresar}
                     style={{
                        width: '40%',
                        height: 60,
                        backgroundColor: '#A0A0A0', //por definir en dark
                        marginEnd: 10,
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
                        justifyContent: 'center',
                     }}>
                     <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',

                     }}>
                        Regresar
                     </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     // TODO: Styles disabled
                     disabled={loading}
                     onPress={scrollTo}
                     style={{
                        width: '40%',
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
                        justifyContent: 'center',
                     }}>
                     <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        shadowColor: colors.shadow
                     }}>
                        Continuar
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>)}
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
      justifyContent: 'center',
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
      justifyContent: 'center',
   }
})