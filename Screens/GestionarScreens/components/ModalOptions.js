import * as React from "react";
import { useState } from 'react'
import { Modal, Portal, Text, Button, Checkbox } from 'react-native-paper';
import { View, FlatList } from "react-native";
import { sendCancelation } from "../others/Queries";
import { sendNotificationByReference } from "../../../hooks/Notifications";
import { useTheme } from "../../../hooks/ThemeContext";

const ModalOptions = ({ ride, rol, modalOptions, setModalOptions, setModalDialog, setModalPropsDialog }) => {
    const { colors } = useTheme();
    const [checkedItem, setCheckedItem] = useState({});

    const handleCheck = (itemValue) => {
        if (checkedItem === itemValue) {
            setCheckedItem(null);
        } else {
            setCheckedItem(itemValue);
        }
    }

    const checkboxData = rol === "conductor" ?
        [
            { label: 'Dificultades con el vehículo', value: 'el conductor tuvo dificultades con el vehículo' },
            { label: 'Ruta inaccesible ', value: 'la ruta es inaccesible para el conductor' },
            { label: 'El pasajero no llego a tiempo', value: 'el pasajero no llego a tiempo' },
        ] :
        [
            { label: 'El conductor no llego a tiempo', value: 'el conductor no llego a tiempo' },
            { label: 'Obtuve el ride por otro medio', value: 'el pasajero obtuvo el ride por otro medio' },
            { label: 'Ya no necesito el ride', value: 'el pasajero ya no necesita el ride' },
        ];

    return (
        <Portal>
            <Modal visible={modalOptions} onDismiss={setModalOptions} contentContainerStyle={{ backgroundColor: colors.grayModal, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center', }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', color: colors.textModal, fontSize: 18 }}>¿Por qué cancelaste tu ride?</Text>
                </View>

                <FlatList
                    data={checkboxData}
                    renderItem={({ item, index }) => (
                        <Checkbox.Item
                            key={index}
                            label={item.label}
                            color="green"
                            uncheckedColor="gray"
                            position="leading"
                            labelStyle={{ color: 'black', textAlign: 'left' }}
                            status={checkedItem === item.value ? 'checked' : 'unchecked'}
                            onPress={() => handleCheck(item.value)}
                        />
                    )}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                    <Button mode="contained" buttonColor='#B0B0B0' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: '90%' }}
                        onPress={() => {
                            sendCancelation(ride.id, checkedItem);
                            let referenceUser = null;
                            { rol === "pasajero" ? referenceUser = ride.conductorID.reference : referenceUser = ride.pasajeroID.reference }
                            sendNotificationByReference(
                                referenceUser,
                                'Ride Cancelado',
                                `El ride fue cancelado porque ${checkedItem}`,
                                'GestionarRides'
                            );
                            setModalPropsDialog({
                                icon: 'checkmark-circle-outline',
                                color: '#EE6464',
                                title: 'RIDE CANCELADO',
                            });
                            setModalDialog(true);
                            setModalOptions(false);
                        }}> Enviar </Button>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalOptions