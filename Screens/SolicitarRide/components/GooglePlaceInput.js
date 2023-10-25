import * as React from "react";
import { GOOGLE_MAPS_API_KEY } from "@env"
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useTheme } from "../../../hooks/ThemeContext";

const GooglePlaceInput =React.forwardRef (({ placeholder, onPress, predefinedPlaces, query },ref) => {
    const { colors } = useTheme();

    return (
        <GooglePlacesAutocomplete
            styles={{
                textInput: {
                    position: 'relative',
                    backgroundColor: '#56565B',
                    color: '#fff',
                    fontSize: 16,
                    height: 50,
                    fontWeight: 'normal',
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    paddingHorizontal: 16,
                    marginTop: 10,
                },
                predefinedPlacesDescription: {
                    color: colors.text,
                },
                listView: {},
                row: {
                    backgroundColor: colors.input,
                    padding: 13,
                    height: 44,
                    flexDirection: 'row',
                },
            }}
            placeholder={placeholder}
            fetchDetails={true}
            onPress={onPress}
            query={query}
            onFail={(error) => console.error(error)}
            predefinedPlaces={predefinedPlaces}
            ref={ref}
            placeholderTextColor={colors.text}
        />
    );
});

export default GooglePlaceInput;