import React, { useEffect, useState } from 'react'
import { Appearance } from "react-native";

const ThemeContext = React.createContext()

export function useTheme(){return React.useContext(ThemeContext) }

export function ThemeProvider({children}){
    const [themeState, setThemeState] = useState( Appearance.getColorScheme());

    console.log( Appearance.getColorScheme() )

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
            background: isDark ? '#171717' : '#fff',
            background2: isDark ? '#313131' : '#e9e9e9',
            text: isDark ? '#fff' : '#171717',
            text2: isDark ? '#A8A8A8' : '#424242',
            primary: isDark ? '#0D9F45' : '#0D9F45',
        },
        setDark: (isDark) => setThemeState(isDark ? 'dark' : 'light'),
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    )
}
