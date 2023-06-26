import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import Navegacion from './Screens/ButtonTabScreen';


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
