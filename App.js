import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import Main from './Main';
import { ThemeProvider } from './hooks/ThemeContext';
import { PaperProvider } from 'react-native-paper';

const App = () => {
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

export default App