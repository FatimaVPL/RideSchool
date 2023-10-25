import * as React from "react";
import { Card, Text } from 'react-native-paper';
import { View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cut } from "../others/Functions";
import { useTheme } from "../../../hooks/ThemeContext";

const CardOferta = ({ item, index, setModalUser, setselectedOferta, setIndexOferta }) => {
    const { colors } = useTheme();
    return (
        <Card
            key={item.id}
            style={{ width: 290, borderRadius: 18, margin: 6, backgroundColor: colors.input, borderWidth: 1, borderColor: "green", height: 70, marginLeft: 20 }}
            onPress={() => { setselectedOferta(item); setModalUser(true); setIndexOferta(index);}}
        >
            <Card.Content>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="person" style={{ fontSize: 21, paddingTop: 6, marginRight: 6 }} />
                        <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 15, color: colors.text }}>{cut(`${item.conductor.firstName} ${item.conductor.lastName}`)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 80 }}>
                        <Text style={{ color: colors.text, marginRight: 5, fontSize: 22, fontWeight: 'bold' }}>$</Text>
                        <Text style={{ marginBottom: 10, paddingTop: 6, fontSize: 16, color: colors.text }}>{item.oferta.cooperacion}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>

    )
}

export default CardOferta