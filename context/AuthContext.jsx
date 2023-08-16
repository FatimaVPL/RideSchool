import React, { createContext, useContext, useEffect, useState } from "react";
import { firebase } from '../config-firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../config-firebase'

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
        //checkUsage()
        const subscriber = onAuthStateChanged(auth, async (user) => {
            console.log(' Auth Changed in Context :')
            if (user) {
                console.log('true')
            } else {
                console.log('false')
            }
            setUser(user);
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

    const registerUser = async ({ email, password, role, firstName = "", lastName = "" }) => {
        try {
            // Create user with email and password
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);

            if (userCredential.user) {
                const user = userCredential.user;

                // Create a new user document in Firestore
                await db.collection('users').doc(email).set({
                    uid: user.uid,
                    email: user.email,
                    role,
                    firstName,
                    lastName,
                });

                console.log('User created and added to Firestore.');
            }

        } catch (err) {
            console.error(err.message);
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
            const value = await AsyncStorage.getItem('usage')
            if (value !== null) {
                setFirstTime(false)
                await AsyncStorage.setItem('usage', 'true');
            }
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
            setUsage,
            registerUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}