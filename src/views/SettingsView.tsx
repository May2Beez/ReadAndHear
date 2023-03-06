import { ScrollView, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import DarkModeCard from "../components/settings/DarkModeCard";
import MainFolderCard from "../components/settings/MainFolderCard";
import PageSlidingCard from "../components/settings/PageSlidingCard";
import SinglePageCard from "../components/settings/SinglePageCard";
import AudioBookFolderCard from "../components/settings/AudioBookFolderCard";
import AudioBookActionCard from "../components/settings/AudioBookActionCard";
import LabelHeader from "../components/main/LabelHeader";

const SettingsView = () => {
	return (
		<View style={{
			flex: 1,
			justifyContent: "flex-start",
			paddingBottom: 10,
		}}>
			<Text
				style={{
					fontSize: 24,
					fontWeight: "bold",
					fontFamily: "Exo 2",
					padding: 10,
				}}
			>
				Settings
			</Text>
			<ScrollView style={{
				paddingTop: 10,
			}}>
				<LabelHeader label="Appearance" />
				<DarkModeCard />
				<LabelHeader label="Main Settings" />
				<MainFolderCard />
				<AudioBookFolderCard />
				<AudioBookActionCard />
				<LabelHeader label="Reader settings" />
				<PageSlidingCard />
				<Divider horizontalInset />
				<SinglePageCard />
			</ScrollView>
		</View>
	);
};

export default SettingsView;