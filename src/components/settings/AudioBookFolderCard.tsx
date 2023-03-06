import { useMutation, useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { View } from "react-native";
import { Button, Card, MD3Colors, Text } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { getKey, setKey } from "../../api/StorageFetch";

const AudioBookFolderCard = () => {
	const toast = useToast();

	const { data: audioBookFolder, refetch } = useQuery({
		queryKey: ["audioBookFolder"],
		queryFn: () => getKey("@audioBookFolder"),
	});

	const mutation = useMutation({
		mutationKey: ["audioBookFolder"],
		mutationFn: (path: string) => {
			return setKey("@audioBookFolder", path);
		},
		onSuccess: () => {
			refetch();
		},
	});

	const handleChangeDirectory = () => {
		FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync().then(
			(res) => {
				if (!res.granted) {
					console.log("Permission not granted");
					toast.show({
						message: "Permission not granted or request cancelled",
						type: "warning",
					});
					return;
				}
				console.log(res);
				mutation.mutate(res.directoryUri);
			}
		);
	};

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
							Audiobooks' Main Folder
						</Text>
						<Text
							style={{
								color: MD3Colors.neutral70,
								fontSize: 14,
							}}
						>
							{audioBookFolder
								? decodeURIComponent(
										audioBookFolder
											.replace(
												"content://com.android.externalstorage.documents/tree/primary",
												""
											)
											.replace("%3A", "/")
								  )
								: "Choose main folder of your audiobooks"}
						</Text>
					</View>
					<View
						style={{
							flex: 1,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<Button
							icon="folder"
							mode="elevated"
							compact
							onPress={handleChangeDirectory}
						>
							<Text
								style={{
									fontSize: 16,
								}}
							>
								Select folder
							</Text>
						</Button>
					</View>
				</View>
			</Card.Content>
		</Card>
	);
};

export default AudioBookFolderCard;
