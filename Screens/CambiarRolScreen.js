import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const CambiarRolScreen = () => {
  const [rolActual, setRolActual] = useState('Conductor');
  const [isLoading, setIsLoading] = useState(false);

  const cambiarRol = () => {
    setIsLoading(true);

    setTimeout(() => {
      const nuevoRol = rolActual === 'Conductor' ? 'Pasajero' : 'Conductor';
      setRolActual(nuevoRol);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
   
    setIsLoading(false);
  }, [rolActual]);

  return (
    <View style={styles.container}>
     
      <TouchableOpacity style={styles.button} onPress={cambiarRol} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>
             {rolActual === 'Conductor' ? 'Pasajero' : 'Conductor'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'green',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default CambiarRolScreen;
