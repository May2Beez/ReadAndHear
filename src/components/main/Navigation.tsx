import { useState } from "react";
import { Easing } from "react-native";
import { BottomNavigation } from "react-native-paper";
import BooksView from "../../views/BooksView";
import SettingsView from "../../views/SettingsView";

const Navigation = () => {
	const [index, setIndex] = useState(0);
	const [routes] = useState([
		{
			key: "books",
			title: "Books",
			focusedIcon: "book-open-page-variant",
			unfocusedIcon: "book-open-page-variant-outline",
		},
		{
			key: "settings",
			title: "Settings",
			focusedIcon: "cog",
			unfocusedIcon: "cog-outline",
		},
	]);

	const renderScene = BottomNavigation.SceneMap({
		books: BooksView,
		settings: SettingsView,
	});

	return (
		<BottomNavigation
			navigationState={{ index, routes }}
			onIndexChange={setIndex}
			renderScene={renderScene}
			sceneAnimationEnabled={true}
			sceneAnimationType="shifting"
			shifting={true}
			sceneAnimationEasing={Easing.elastic(1)}
		></BottomNavigation>
	);
};

export default Navigation;
