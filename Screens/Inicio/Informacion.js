import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from "../../hooks/ThemeContext";

const Informacion = ({ titulo, texto, imagen, lugar, link }) => {
    const { colors, isDark } = useTheme();
    const imageAlignment = lugar === 'izquierda' ? 'left' : 'right';
    
    return (
        <View style={[styles.card, { backgroundColor: colors.cardInfo }]}>
            <View style={[styles.imageContainer, { [imageAlignment]: 0 }]}>
                <Image source={imagen} style={styles.image} />
            </View>
            <Text style={[styles.title]}>{titulo}</Text>
            <View style={styles.container}>
                <Text style={styles.textN}>{texto}</Text>
            </View>
            <Text style={styles.link}>{link}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingHorizontal: 16,
        margin: 20,
        marginTop: 50,
        padding: 15,
        position: 'relative', 
        overflow: 'visible', 
    },
    imageContainer: {
        position: 'absolute',
        top: -50, 
        width: 100, 
        height: 100, 
    },
    image: {
        width: '100%',
        height: '100%',
    },
    container: {
        alignItems: 'center',
        marginLeft: 10,
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
        color: 'green',
        textAlign: 'center',
    },
    textN: {
        fontSize: 20,
        textAlign: 'center'
    },
    link:{
        color: '#12A8B4',
        fontSize: 20,
        fontWeight:'bold'
    },
});

export default Informacion;
