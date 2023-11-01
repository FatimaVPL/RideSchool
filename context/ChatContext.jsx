import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config-firebase';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {

    const { dataUser, user } = useAuth()
    const [dataMessages, setDataMessages] = useState([])

    const rideID = user !== null ? dataUser?.chat : undefined;

    useEffect(() => {
        if (rideID === undefined) return

        const unsubscribe = db.collection("rides").doc(rideID).collection("messages")
            .orderBy("date")
            .onSnapshot((querySnapshot) => {
                const messagesData = [];
                querySnapshot.forEach((doc) => {
                    let own = user.uid === doc.data().userID ? true : false;
                    const message = {
                        rideID, 
                        own,
                        ...doc.data()
                    };
                    messagesData.push(message);
                });
                setDataMessages(messagesData);
            });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, [rideID]);

    return (
        <ChatContext.Provider
            value={{
                dataMessages
            }}>
            {children}
        </ChatContext.Provider>
    );
};