import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, TouchableOpacity, FlatList, ImageBackground, Image } from 'react-native';
import { useTheme } from '../../hooks/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { formatDate } from '../GestionarScreens/others/Functions';
import { sendMessage } from '../GestionarScreens/others/Queries';

const ChatScreen = () => {

  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme()
  const { dataUser, getDataUser } = useAuth()
  const { dataMessages } = useChat()
  const scrollRef = React.useRef(null)
  const textAreaRef = React.useRef(null)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState(dataMessages)

  const handleSendMessage = () => {
    try {
      if (messageText !== '') {
        sendMessage(messageText, dataUser.chat, dataUser.uid, dataUser.role);
        setMessageText('');
      }

      textAreaRef.current.blur()
    } catch (e) {

    } finally {

    }
  }

  const scrollToBottom = () => {
    //console.log('padding', insets)
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <PaperProvider>
      {dataUser.chat !== undefined ? (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
          <KeyboardAvoidingView style={styles.full}>
            <ImageBackground
              source={isDark ? require('../../assets/fondo-black.png') : require('../../assets/fondo-white.png')}
              style={{ flex: 1, resizeMode: 'cover' }}
            >
              <View style={{ flex: 1 }}>
                {dataMessages !== null && (
                  <FlatList
                    ref={scrollRef}
                    data={dataMessages}
                    renderItem={({ item: m }) => {
                      return (
                        <View style={[styles.messageContainer, m.own ? styles.myMessageContainer : styles.yourMessageContainer]}>
                          <View style={[styles.message, m.own ? styles.myMessage : styles.yourMessage, m.own ? { backgroundColor: colors.myMessage } : {backgroundColor: colors.yourMessage}]}>
                            <Text style={{ fontSize: 17 }}>{m.text}</Text>
                            <Text style={{ fontSize: 10 }}>{formatDate(m.date, null)}</Text>
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', height: 58, justifyContent: 'flex-end', paddingBottom: 5 }}>
                {/* Text Area */}
                <View style={{ flex: 1, backgroundColor: colors.inputChat, borderRadius: 20, overflow: 'hidden', marginLeft: 5, marginRight: 5 }}>
                  <TextInput
                    ref={textAreaRef}
                    value={messageText}
                    onChangeText={(e) => setMessageText(e)}
                    placeholder='Escribe un mensaje'
                    onFocus={scrollToBottom}
                    underline={false}
                    selectionColor="#64748b"
                    backgroundColor={colors.inputChat}
                  />
                </View>
                {/* Send Button */}
                <View style={{ ...styles.totalCenter, width: 55, height: '100%' }}>
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    style={{ ...styles.totalCenter, backgroundColor: '#64748b', width: 52, height: 52, borderRadius: 25 }}>
                    <Ionicons name="paper-plane-outline" style={{ fontSize: 23, color: 'white' }}></Ionicons>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </KeyboardAvoidingView>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Image source={require('../../assets/bloqueado.png')} style={{ width: 150, height: 150 }}></Image>
          <Text style={{ marginTop: 15, fontSize: 18, textAlign: 'center' }}>Esta pantalla se habilitara cuando {'\n'}te encuentres en un ride</Text>
        </View>
      )}
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  textBox: {
    width: '100%',
    fontSize: 18,
    paddingHorizontal: 15,
    height: 50,
  },
  border: {
    borderWidth: 1,
    borderColor: 'gray',
  },
  totalCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    minHeight: 90,
    padding: 10,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  yourMessageContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  message: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 25
  },
  myMessage: {
    alignItems: 'flex-end',
    borderBottomRightRadius: 10,
  },
  yourMessage: {
    alignItems: 'flex-start',
    borderBottomLeftRadius: 5,
  }
});

export default ChatScreen;