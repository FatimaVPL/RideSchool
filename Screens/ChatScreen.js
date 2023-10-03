import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from "../hooks/ThemeContext";


const ChatScreen = () => {
  const { colors} = useTheme()
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text>Chat</Text>
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

export default ChatScreen;
