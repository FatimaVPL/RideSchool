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
            background: isDark ? '#17202A' : '#F2F2F2',
            background2: isDark ? '#313131' : '#e9e9e9',
            text: isDark ? '#F0F0F0' : '#171717',
            text2: isDark ? '#A8A8A8' : '#424242',
            primary: isDark ? '#0D9F45' : '#0D9F45',
            shadow: isDark ? 'green' : '#D4D4D4',
            input: isDark? '#283747' : '#ECF0F1',
            textButton: isDark? '#F3F3F3' : 'white'
        },
        image:{
            logo: isDark ? 'ride-school-dark.png' : 'ride-school.png',
        },
        setDark: (isDark) => setThemeState(isDark ? 'dark' : 'light'),
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    )
}
