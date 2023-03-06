import { StyleSheet, View } from "react-native";
import {
    Provider as PaperProvider,
    MD3DarkTheme,
    MD3LightTheme,
    useTheme,
} from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { getAllKeys, getKey } from "./api/StorageFetch";
import { StatusBar } from "expo-status-bar";
import Header from "./components/main/Header";
import Navigation from "./components/main/Navigation";
import { getBookInfo } from "./global/global";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-paper-toast";
import Reader from "./views/Reader";
import { DarkMode } from "./enums/Enums.d";

export default function App(): JSX.Element {
    const { data: darkMode } = useQuery({
        queryKey: ["darkMode"],
        queryFn: () => getKey("@darkMode"),
    });

    const { data: currentBook } = useQuery({
        queryKey: ["currentBook"],
        queryFn: getBookInfo,
    });

    const style = darkMode === DarkMode.Dark ? MD3DarkTheme : MD3LightTheme;

    return (
        <SafeAreaProvider>
            <PaperProvider theme={style}>
                {/* @ts-ignore False detect */}
                <ToastProvider>
                    <StatusBar
                        style={DarkMode.Dark ? "light" : "dark"}
                        translucent
                    />

                    {currentBook ? (
                        <Reader
                            uri={currentBook?.file}
                            mp3Files={currentBook?.mp3Files}
                        />
                    ) : (
                        <View style={styles.container}>
                            <Header />
                            <Navigation />
                        </View>
                    )}
                </ToastProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        fontFamily: "Exo 2",
        margin: 0,
        padding: 0,
    },
});
