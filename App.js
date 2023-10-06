import registerNNPushToken from 'native-notify';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import Main from './Main';
import { ThemeProvider } from './hooks/ThemeContext';
import { PaperProvider } from 'react-native-paper';

export default function App() {
  registerNNPushToken(13000, 'Dke2V9YbViRt26fTH2Mv7q');

  return (
    <NavigationContainer>
      <AuthProvider>
        <ThemeProvider>
          <PaperProvider>
            <Main />
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  )
}