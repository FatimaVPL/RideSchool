import registerNNPushToken from 'native-notify';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import Main from './Main';
import { ThemeProvider } from './hooks/ThemeContext';
import { PaperProvider } from 'react-native-paper';
import { ChatProvider } from './context/ChatContext';

export default function App() {
  //registerNNPushToken(13000, 'Dke2V9YbViRt26fTH2Mv7q');
  registerNNPushToken(14050, 'teVYjQw7P4lRK3FcQSIuzV');

  return (
    <NavigationContainer>
      <AuthProvider>
        <ThemeProvider>
          <ChatProvider>
            <PaperProvider>
              <Main />
            </PaperProvider>
          </ChatProvider>
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  )
}