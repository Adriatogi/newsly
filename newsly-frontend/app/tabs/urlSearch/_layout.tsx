import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function urlSearchLayout() {
    
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                /> 
            </Stack>
        </GestureHandlerRootView>
    )
    
}