import * as React from "react";
import { useState } from 'react'
import { Modal, Portal, Text, Button, Checkbox } from 'react-native-paper';
import { View, FlatList } from "react-native";
import { sendCancelation } from "../others/Queries";
import { sendNotification } from "../../../hooks/Notifications";

const ModalOptions = ({ ride, rol, modalOptions, setModalOptions, setModalDialog, setModalPropsDialog }) => {
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
            <Modal visible={modalOptions} onDismiss={() => setModalOptions(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                    <View style={{ margin: 15, backgroundColor: 'white', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320, padding: 15 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                            <Text style={{ marginBottom: 15, fontWeight: 'bold', color: 'black', fontSize: 18 }}>¿Por qué cancelaste tu ride?</Text>
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
                                    sendNotification(
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
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalOptions