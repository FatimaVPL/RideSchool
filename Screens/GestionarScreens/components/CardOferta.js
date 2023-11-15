import * as React from "react";
import { Card, Text } from 'react-native-paper';
import { View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cut } from "../others/Functions";
import { useTheme } from "../../../hooks/ThemeContext";

const CardOferta = ({ item, index, parentItem, setselectedRide, setModalUser, setselectedOferta, setIndexOferta }) => {
    const { colors } = useTheme();

    return (
        <Card
            key={item.id}
            style={{ width: '94%', borderRadius: 18, margin: 5, backgroundColor: colors.cardOferta, height: 65, marginLeft: 20 }}
            onPress={() => { setselectedRide(parentItem); setselectedOferta(item); setModalUser(true); setIndexOferta(index);}}
        >
            <Card.Content>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="person" style={{ fontSize: 21, paddingTop: 4, marginRight: 6 }} />
                        <Text style={{ marginBottom: 10, paddingTop: 4, fontSize: 15, color: 'black' }}>{cut(item.conductor.firstName, item.conductor.lastName)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 80 }}>
                        <Text style={{ color: 'black', marginRight: 5, fontSize: 20, fontWeight: 'bold' }}>$</Text>
                        <Text style={{ marginBottom: 10, paddingTop: 4, fontSize: 16, color: 'black' }}>{item.oferta.cooperacion}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>

    )
}

export default CardOferta