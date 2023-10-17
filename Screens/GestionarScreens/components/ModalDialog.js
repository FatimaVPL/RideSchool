import * as React from "react";
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const ModalDialog = ({icon, color, title, modalDialog, setModalDialog}) => {
    return (
        <Portal>
            <Modal visible={modalDialog} onDismiss={() => setModalDialog(false)} contentContainerStyle={{ flex: 1 }}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 25}}>
                    <View style={{ margin: 15, backgroundColor: 'white', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, width: 320, padding: 15 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name={icon} style={{ marginRight: 6, fontSize: 70, color: color }}></Ionicons>
                            <Text style={{ marginBottom: 15, fontWeight: 'bold', color: 'black', fontSize: 18 }}>{title}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                            <Button mode="contained" buttonColor='#B0B0B0' textColor='white' labelStyle={{ fontWeight: 'bold', fontSize: 15 }} style={{ width: '90%' }}
                                onPress={() => setModalDialog(false)}> OK </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default ModalDialog