import React, {useState} from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, Text, Modal } from 'react-native';
import { firebase } from '../config-firebase';

const RegistroScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    //Modal
    const [showModal, setShowModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')

    
  const validateEmail = () => {
    const emailParts = email.split('@');
    if (emailParts.length === 2 && emailParts[1] === 'alumnos.itsur.edu.mx') {
      return true;
    } else {
      return false;
    }
  }

    registerUser = async (email, password, firstName, lastName) => {
        if(validateEmail()){
            await firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(()=>{
                firebase.auth().currentUser.sendEmailVerification({
                    handleCodeInApp: true,
                    url:'https://rideschool-2f902.firebaseapp.com',
                })
                .then(()=>{
                    setShowModal(true);
                    setModalMessage('Se mandó un link de verificación a tu correo');
                }).catch(
                    (error)=>{
                        setShowModal(true);
                        setModalMessage(error.message);
                    }
                )
                .then(()=>{
                    firebase.firestore().collection('users')
                    .doc(firebase.auth().currentUser.uid)
                    .set({
                        firstName,
                        lastName,
                        email,
                    })
                })
                .catch((error)=>{
                    setShowModal(true);
                    setModalMessage(error.message)
                })
            })
            .catch((error)=>{
                setShowModal(true);
                setModalMessage(error.message)
            }
            )

        }else{
            setShowModal(true);
            setModalMessage('El correo debe ser matricula@alumnos.itsur.edu.mx');
        }
    }
    return (
        <View style={styles.container}>
          <Text style={styles.bienvenida}>Comienza esta nueva experiencia</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre(s)"
            onChangeText={(text) => setFirstName(text)}
          />
           <TextInput
            style={styles.input}
            placeholder="Apellidos"
            onChangeText={(text) => setLastName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo Institucional"
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            placeholder="Contraseña"
            secureTextEntry={true}
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} 
            onPress={()=> registerUser(email,password,firstName, lastName)}>Crear Cuenta</Text>
          </TouchableOpacity>
          <Modal visible={showModal} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      bienvenida: {
        fontSize: 30,
        marginBottom: 20,
        textAlign: 'center',
        color: '#DCB103',
      },
      input: {
        width: '100%',
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
        fontSize: 20
      },
      button: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
      },
      buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 15
      },
      bottomLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
      },
      linkText: {
        marginHorizontal: 5,
        color: '#645518'
      },
      logo: {
        width: 350,
        height: 200,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
      },
      modalMessage: {
        fontSize: 16,
        marginBottom: 10,
      },
      modalButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
      },
      modalButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 15,
      },
    });
    
    export default RegistroScreen;
    