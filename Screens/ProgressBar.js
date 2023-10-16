import React from "react";
import {View, Text} from "react-native";
import Svg, {Rect} from "react-native-svg";
import { useTheme } from '../hooks/ThemeContext';



export default function ProgressBar({progress}){
    const { colors } = useTheme()
    const barWidth = 230
    const progressWidth = (progress /100) * barWidth
    return(
        <View style={{alignItems:'center', margin: 20}}>
            <Svg width={barWidth} height="7">
                <Rect width={barWidth} height={"100%"} fill={"#D0D0D0"} rx={3.5} ry={3.5}/>
                <Rect width={progressWidth} height={"100%"} fill={"#27A2B5"} rx={3.5} ry={3.5}/>
            </Svg>
            <Text style={{color: colors.text}}>Cargando</Text>
        </View>
    )
}