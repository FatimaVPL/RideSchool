import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { List, Switch, Button } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const AjustesGeneralesScreen = ({navigation}) => {
  const [preferencias, setPreferencias] = useState({
    recibirNotificaciones: false,
    mostrarUbicacion: true,
    compartirViajes: false,
  });
  const [numeroTelefono, setNumeroTelefono] = useState('');

  const togglePreferencia = (preferencia) => {
    setPreferencias({
      ...preferencias,
      [preferencia]: !preferencias[preferencia],
    });
  };

  const handleGuardarTelefono = () => {
    // Aquí puedes realizar la lógica para guardar el número de teléfono en tu aplicación
    console.log('Teléfono guardado:', numeroTelefono);
  };

  return (
    <View>
      <List.Section>
        <List.Subheader>Preferencias</List.Subheader>
        <List.Item
          title="Recibir notificaciones"
          right={() => (
            <Switch
              value={preferencias.recibirNotificaciones}
              onValueChange={() => togglePreferencia('recibirNotificaciones')}
            />
          )}
        />
        <List.Item
          title="Mostrar ubicación"
          right={() => (
            <Switch
              value={preferencias.mostrarUbicacion}
              onValueChange={() => togglePreferencia('mostrarUbicacion')}
            />
          )}
        />
        <List.Item
          title="Compartir viajes"
          right={() => (
            <Switch
              value={preferencias.compartirViajes}
              onValueChange={() => togglePreferencia('compartirViajes')}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Agregar número de teléfono</List.Subheader>
        <List.Item
          title="Número de teléfono"
          right={() => (
            <TextInput
              value={numeroTelefono}
              onChangeText={setNumeroTelefono}
              keyboardType="phone-pad"
            />
          )}
        />
        <Button mode="contained" onPress={handleGuardarTelefono} style={styles.button}>
          Guardar
        </Button>
      </List.Section>
    </View>
  );
};
const styles = StyleSheet.create({
    button:{
        width: 200,
        marginStart:100,
        marginTop:10,
        backgroundColor: 'green'
    },
  });
export default AjustesGeneralesScreen;
