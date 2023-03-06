import { StatusBar } from "react-native";
import { Title, useTheme } from "react-native-paper";

const Header = () => {
	const style = useTheme();

	return (
		<Title
			style={{
				backgroundColor: style.colors.background,
				margin: 0,
				marginVertical: 0,
				padding: 10,
				paddingTop: StatusBar.currentHeight + 10,
				fontWeight: "bold",
				fontSize: 26,
				fontFamily: "Exo 2",
			}}
		>
			Read & Hear
		</Title>
	);
};

export default Header;
