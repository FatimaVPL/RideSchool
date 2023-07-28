import React, { createContext, useContext, useEffect, useState } from "react";
import { firebase } from '../config-firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [firstTime, setFirstTime] = useState(true)
    const [initializing, setInitializing] = useState(true);



    async function checkUsage() {
        try {
            const value = await AsyncStorage.getItem('usage')
            if (value !== null) {
                setFirstTime(false)
            }
        } catch (e) {
            console.log('Error al obtener datos de uso: ', e)
        }
    }

    useEffect(() => {
        const subscriber = firebase.auth().onAuthStateChanged(async (user) => {
            setUser(user);
            await checkUsage()
            setInitializing(false);
        });
        return subscriber
    }, []);

    const logoutUser = async () => {
        try {
            await firebase.auth().signOut();
            setUser(null)
        } catch (error) {
            console.log('Error al cerrar sesión: ', error);
        }
    }

    const clearUsage = async () => {
        try {
            await AsyncStorage.removeItem('usage');
        } catch (e) {
            // saving error
        }
    }
    const setUsage = async () => {
        try {
            await AsyncStorage.setItem('usage','true');
            setFirstTime(false)
        } catch (e) {
            // saving error
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            initializing,
            logoutUser,
            clearUsage,
            firstTime,
            setUsage
        }}>
            {children}
        </AuthContext.Provider>
    )
}