import React, { createContext, useContext, useState } from 'react';
import { db } from '../config-firebase'

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([])

    // obtener Id de la oferta actual 

    const ofertaId = ""; 

    useEffect(() => {
        const unsubscribe = db.collection("ofertas").doc(ofertaId).collection("messages")
            .orderBy("timestamp")
            .onSnapshot(snapshot => {
                const messagesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
            });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, [ofertaId]);

    return (
        <ChatContext.Provider
            value={{
                messages
            }}>
            {children}
        </ChatContext.Provider>
    );
};
