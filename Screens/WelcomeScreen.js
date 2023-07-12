import { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, FlatList, useWindowDimensions, StyleSheet } from "react-native"
import { Button } from 'react-native-paper'
import { useTheme } from "../hooks/ThemeContext";
import PassagerOrCarSvg from "../assets/Svg/PassagerOrCarSvg"
import CredentialsSvg from "../assets/Svg/CredentialsSvg";


const slides = [
   {
      id: 1,
      title: 'Bienvenido a RideSchool !',
      info: 'Hacemos posibles los ride\'s más rapidos y seguros para estudiantes.',
      svg: <PassagerOrCarSvg />,
      controls: <></>
   },
   {
      id: 2,
      title: 'Como planeas usar RideSchool ?',
      info: 'Quieres ofrecer ride\'s a otros estudiantes o solicitarlos tu? Puedes cambiar tus preferencias más tarde desde tu perfil.',
      svg: <PassagerOrCarSvg />,
      controls: <>
      
      </>
   },
   {
      id: 3,
      title: 'Ingresa tu número de control',
      info: 'Por motivos de seguridad, necesitamos verificar que eres un estudiante de la escuela.',
      svg: <CredentialsSvg />,
      controls: <></>
   }
]

const WelcomeScreen = () => {

   const [selectedScreen, setSelectedScreen] = useState(0)
   const { colors } = useTheme()

   const Screen = ({ item, children }) => {
      const { title, info, svg } = item
      const { width } = useWindowDimensions()
      return (
         <View style={[{ width }]}>
            <View style={{
               flex: 1,
               paddingHorizontal: 25,
               flexDirection: 'column',
            }}>

               <View style={{
                  display: 'flex',
                  width: '100%',
                  height: '60%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  
               }}>
                  {svg}
               </View>

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
               {children}
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
            flexDirection: 'column',
            backgroundColor: colors.background,
            color: colors.text,
         }}>

            <View style={{ width:'100%', height:'82%' }}>
               <FlatList
                  data={slides}
                  renderItem={({ item }) => <Screen item={item} />}
                  horizontal
                  showHorizontalScrollIndicator
                  pagingEnabled
               />

            </View>
            <View style={{
               flex: 1,
               flexDirection: 'column'
            }}>
               <View style={{
                  width: '100%',
                  height: 50,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}>
                  {
                     slides.map((item, i) =>
                        <View key={'T' + i} style={{
                           width: 10,
                           height: 10,
                           backgroundColor: `${i == selectedScreen ? colors.primary : colors.text2}`,
                           borderRadius: 5,
                           marginHorizontal: 5,
                        }}>
                           <Text>

                           </Text>
                        </View>)
                  }
               </View>
               <View style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  paddingHorizontal: 30,
                  paddingTop: 10,
                  paddingBottom: 25,
                  display: 'flex',
               }}>
                  {selectedScreen > 0 &&
                     <TouchableOpacity
                        onPress={() => { setSelectedScreen(p => p - 1) }}
                        style={{
                           flex: 1,
                           backgroundColor: colors.background2,

                           alignItems: "center",
                           justifyContent: 'center',
                           marginRight: 15,
                           borderRadius: 10,

                        }}>
                        <Text style={{
                           color: 'black',
                           fontSize: 20,
                           fontWeight: 'bold',
                        }}>
                           Atras
                        </Text>
                     </TouchableOpacity>
                  }

                  <TouchableOpacity
                     onPress={() => { setSelectedScreen(p => p + 1) }}
                     style={{
                        flex: 1,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: 'center',
                        marginLeft: selectedScreen > 0 ? 15 : 0,
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

            {/*<View style={{
               flex: 1,
               }}>
               {
                  screens[selectedScreen].component
               }
            </View>

            <View style={{
               width: '100%',
               height: 140,

            }}>
               
                     </View>*/}
         </View>
      </>
   )
}
export default WelcomeScreen
