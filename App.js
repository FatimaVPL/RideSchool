import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PerfilScreen from './Screens/PerfilScreen'
import { PaperProvider, Searchbar, Text } from 'react-native-paper';
import Navegacion from './Screens/ButtonTabScreen';


function InicioScreen() {
  return (
    <View style={styles.container}>
    <Text>Inicio</Text>
  </View>
  );
}

function RidesScreen() {
  return (
    <View>
      <Searchbar
      placeholder="Search"
    />
    </View>
  );
}

function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text>Chat</Text>
    </View>
  );
}



const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
    <Navegacion/>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
