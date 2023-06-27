import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InicioScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Inicio</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InicioScreen;
