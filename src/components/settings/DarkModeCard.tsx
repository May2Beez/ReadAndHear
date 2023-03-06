import { useMutation, useQuery } from "@tanstack/react-query";
import Switch from "expo-dark-mode-switch";
import { View } from "react-native";
import { Card, MD3Colors, Text } from "react-native-paper";
import { getKey, setKey } from "../../api/StorageFetch";
import { DarkMode } from "../../enums/Enums.d";

const DarkModeCard = () => {
	const { data: darkMode, refetch } = useQuery({
		queryKey: ["darkMode"],
		queryFn: () => getKey("@darkMode"),
	});

	const mutation = useMutation({
		mutationKey: ["darkMode"],
		mutationFn: (newValue: string) => setKey("@darkMode", newValue),
		onSuccess: () => {
			refetch();
		},
	});

	console.log(darkMode);

	return (
		<Card
			mode="contained"
			style={{
				backgroundColor: "none",
				margin: 0,
			}}
		>
			<Card.Content>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						justifyContent: "center",
					}}
				>
					<View
						style={{
							flex: 1,
							flexDirection: "column",
							justifyContent: "center",
						}}
					>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							Dark Mode
						</Text>
						<Text
							style={{
								color: MD3Colors.neutral70,
								fontSize: 14,
							}}
						>
							Enable dark mode
						</Text>
					</View>
					<View
						style={{
							flex: 1,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<Switch
							value={darkMode === DarkMode.Dark}
							onChange={() => {
								mutation.mutate(darkMode === DarkMode.Dark ? DarkMode.Light : DarkMode.Dark);
							}}
						/>
					</View>
				</View>
			</Card.Content>
		</Card>
	);
};

export default DarkModeCard;
