import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from "../../../hooks/ThemeContext";

// 1 = Ride Cancelado
// 2 = Completar info
const ModalDialog = ({ icon, color, title, type, modalDialog, setModalDialog }) => {
    const { colors } = useTheme();
    return (
        <Portal>
            <Modal visible={modalDialog} onDismiss={setModalDialog} contentContainerStyle={{ backgroundColor: colors.background, padding: 20, borderRadius: 15, width: '80%', alignSelf: 'center', justifyContent: 'center' }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name={icon} style={{ fontSize: 70, color: colors.text }}></Ionicons>
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', color: colors.text, fontSize: 18, textAlign:'center' }}>{title}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <Button mode="contained" buttonColor={type === 2 ? '#A9CA6D' : '#B0B0B0'} textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 16 }} style={{ width: '95%' }}
                        onPress={() => {type === 2 ? console.log("Pantallas para completar registro") : setModalDialog(false)}}
                        > {type === 2 && "Completar"} OK</Button>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalDialog