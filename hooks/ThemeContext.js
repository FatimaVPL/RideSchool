import React, { useEffect, useState } from 'react'
import { Appearance } from "react-native";

const ThemeContext = React.createContext()

export function useTheme(){return React.useContext(ThemeContext) }

export function ThemeProvider({children}){
    const [themeState, setThemeState] = useState( Appearance.getColorScheme());

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setThemeState(colorScheme);
        });
        return () => {
            subscription.remove();
        };
    }, []);

    const isDark = themeState === 'dark';

    const theme = {
        isDark,
        colors: {
            transparent: isDark? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            background: isDark ? '#121212' : '#F2F2F2',
            background2: isDark ? '#283747' : '#f1f5f9',
            background3: isDark ? '#f3f4f6' : '#F8F7F6',
            background4: isDark ? '#F0F0F0' : '#F8F7F6',
            backgroundCard: isDark ? '#EDEDED' : '#F8F7F6',
            text: isDark ? '#E7E7E7' : '#171717',
            primary: isDark ? '#0D9F45' : '#0D9F45',
            shadow: isDark ? 'green' : '#D4D4D4',
            input: isDark? '#3E3D3D' : '#ECF0F1',
            textButton: isDark? '#F3F3F3' : 'white',
            iconTab: isDark? '#F0F0F0' : '#707B7C',
            colorSelect: isDark? '#2E973A' : '#445D47',
            cardAceptada: isDark? '#528045' : '#BEE27B',
            cardFinalizada: isDark? '#D65656'  : '#EE6464',
            icon: isDark? '#DFDFDF': 'black',
            textRide: isDark? '#22c55e' : 'green',
            cardInfo: isDark? '#878787'  : '#D2CECE',
            cardText: isDark? '#79D17B' : '#0D920F',
            linkText: isDark? '#7DDEDB' : '#2EA7A4',
            grayModal: isDark? '#334155' : '#F2F2F2',
            textModal: isDark ? '#e5e7eb' : '#171717',
            textModal2: isDark ? '#d1d5db' : '#171717',
            divider: isDark ? 'white' : 'black',
            cardOferta: isDark ? '#d1d5db' : '#e5e7eb',
            infoPerfil: isDark ? 'gray' : '#D2CECE',
            inputChat: isDark ? '#4b444c' : '#cbd5e1',
            myMessage: isDark ? '#94a3b8' : '#cbd5e1',
            yourMessage: isDark ? '#cbd5e1' : '#e2e8f0'
        },
        setDark: (isDark) => setThemeState(isDark ? 'dark' : 'light'),
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    )
}
