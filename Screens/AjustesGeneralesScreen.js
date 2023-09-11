import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const AjustesGeneralesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title1}>Titulo 1</Text>
      <Text style={styles.title2}>Titulo 2</Text>
      <Text style={styles.title3}>Titulo 3</Text>
      <Text style={styles.normalText1}>Soy texto normal</Text>
      <Text>Soy texto sin configuración</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#262626',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalText1: {
    textAlign: 'justify',
    fontSize: 20,
    color: 'white'
  },
  title1: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
  },
  title2: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
  },
  title3: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
  },
  button: {
    width: 200,
    marginTop: 10,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
});

export default AjustesGeneralesScreen;
