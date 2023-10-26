import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { useTheme } from '../../hooks/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { db, firebase } from '../../config-firebase';

const CompletarInfoConductor = ({ navigation }) => {
    const { colors } = useTheme()
    const [selectedVehicle, setSelectedVehicle] = useState('automovil')
    const { dataUser } = useAuth()

    const handleVehicleChange = (value) => {
        setSelectedVehicle(value)
    }

    async function updateInfo(vehiculo) {
        const userRef = db.collection('users').doc(dataUser.email)
        try {
            const docSnapshot = await userRef.get()

            if (docSnapshot.exists) {
                userRef.update({
                    conductor: true,
                    tipoVehiculo: vehiculo
                });
            }
            Alert.alert("Inforación actualizada", "Ahora ya puedes cambiar tu rol a conductors")
            navigation.navigate("Home")
        } catch (error) {
            console.log('Error al actualizar', error)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.textInfo}>Seleccione el tipo de vehículo con el que cuentas</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>
                    <RadioButton
                        value="automovil"
                        status={selectedVehicle === 'automovil' ? 'checked' : 'unchecked'}
                        onPress={() => handleVehicleChange('automovil')}
                        color="green"
                    />
                </View>
                <Text style={styles.textOptions}>Automóvil</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>
                    <RadioButton
                        value="motocicleta"
                        status={selectedVehicle === 'motocicleta' ? 'checked' : 'unchecked'}
                        onPress={() => handleVehicleChange('motocicleta')}
                        color="green"
                    />
                </View>
                <Text style={styles.textOptions}>Motocicleta</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>
                    <RadioButton
                        value="ambos"
                        status={selectedVehicle === 'ambos' ? 'checked' : 'unchecked'}
                        onPress={() => handleVehicleChange('ambos')}
                        color="green"
                    />
                </View>
                <Text style={styles.textOptions}>Ambos</Text>
            </View>
            <View style={styles.container2}>
                <TouchableOpacity style={styles.button} onPress={() => updateInfo(selectedVehicle)}>
                    <Text style={[styles.buttonText, { color: colors.textButton }]}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    container2: { alignItems: 'center', paddingTop: 20 },
    textInfo: {
        textAlign: 'center',
        fontSize: 27,
        fontWeight: '900',
        marginBottom: '10%'
    },
    button: {
        width: '90%',
        height: 50,
        backgroundColor: 'green',
        padding: 10,
        marginTop: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textOptions: {
        fontSize: 20,
    }
});

export default CompletarInfoConductor;
