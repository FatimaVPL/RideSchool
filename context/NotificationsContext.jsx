import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const NotificationContext = createContext();

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
      }),
    })
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [])

  const schedulePushNotification = async (title, body, targetExpoPushToken) => {
    //console.log("TOKEN QUE SE MANDA",targetExpoPushToken)
    await Notifications.scheduleNotificationAsync({
      to: targetExpoPushToken,
      content: {
        title: title,
        body: body,
      },
      trigger: { seconds: 2 },
    })
  }

  const sendPushNotification = async (title, body, targetExpoPushToken) => {
    const message = {
      to: targetExpoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: { someData: 'goes here' }, // Puedes incluir datos adicionales si es necesario
    };
  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId: '8cd231b6-a169-4145-8a05-44f8ddf5b7ab' })).data;
      console.log(token);
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  const contextValue = {
    expoPushToken,
    notification,
    schedulePushNotification,
    registerForPushNotificationsAsync,
    sendPushNotification,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}