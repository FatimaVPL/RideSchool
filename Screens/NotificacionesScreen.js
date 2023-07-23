import React, { useState } from 'react';
import { View, Switch } from 'react-native';
import { List } from 'react-native-paper';

const NotificacionesScreen = ({ navigation }) => {
  const [notificacionesActivadas, setNotificacionesActivadas] = useState(false);

  const toggleNotificaciones = () => {
    setNotificacionesActivadas(!notificacionesActivadas);
  };

  return (
    <View>
      <List.Section>
        <List.Item
          title="Activar notificaciones"
          right={() => (
            <Switch
              value={notificacionesActivadas}
              onValueChange={toggleNotificaciones}
            />
          )}
        />
      </List.Section>
    </View>
  );
};

export default NotificacionesScreen;
