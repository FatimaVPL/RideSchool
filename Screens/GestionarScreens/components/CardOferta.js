import * as React from "react";
import { Card, Text } from 'react-native-paper';
import { View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cut } from "../others/Functions";

const CardOferta = ({ parentIndex, item, index, setIndexOferta, setIndexRide, setModalUser }) => {
    return (
        <Card
            key={parentIndex + 0.1}
            style={{ width: 290, borderRadius: 18, margin: 6, backgroundColor: '#EDEDED', borderWidth: 1, borderColor: "green", height: 70, marginLeft: 20 }}
            onPress={() => { setIndexOferta(index); setIndexRide(parentIndex); setModalUser(true); }}
        >
            <Card.Content>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="person" style={{ fontSize: 21, paddingTop: 6, marginRight: 6 }} />
                        <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 15, color: 'black' }}>{cut(null,`${item.conductor.firstName} ${item.conductor.lastName}`)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 80 }}>
                        <Text style={{ color: 'black', marginRight: 5, fontSize: 22, fontWeight: 'bold' }}>$</Text>
                        <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 16, color: 'black' }}>{item.oferta.cooperacion}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>

    )
}

export default CardOferta