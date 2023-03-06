import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { loadAsync } from "expo-font";
import App from "./src/App";
import { useEffect, useState } from "react";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import {
	GestureHandlerRootView,
} from "react-native-gesture-handler";

preventAutoHideAsync();

async function loadApplication() {
	await loadAsync({
		"Exo 2": require("./assets/fonts/Exo2-Regular.ttf"),
		"Exo 2 Bold": require("./assets/fonts/Exo2-Bold.ttf"),
		"Exo 2 Light": require("./assets/fonts/Exo2-Light.ttf"),
		"Exo 2 Medium": require("./assets/fonts/Exo2-Medium.ttf"),
		"Exo 2 SemiBold": require("./assets/fonts/Exo2-SemiBold.ttf"),
		"Exo 2 Thin": require("./assets/fonts/Exo2-Thin.ttf"),
	});
}

export default function Main() {
	const client = new QueryClient();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		async function prepare() {
			try {
				await loadApplication();
			} catch (e) {
				console.warn(e);
			} finally {
				setIsReady(true);
				hideAsync();
			}
		}

		prepare();
	}, []);

	if (!isReady) {
		return null;
	}

	return (
		<QueryClientProvider client={client}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<App />
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
