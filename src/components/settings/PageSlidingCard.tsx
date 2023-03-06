import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { View } from "react-native";
import { Card, IconButton, MD3Colors, Text } from "react-native-paper";
import { getKey, setKey } from "../../api/StorageFetch";
import { PageSliding } from "../../enums/Enums.d";

const PageSlidingCard = () => {
	const { data: pageSliding, refetch } = useQuery({
		queryKey: ["pageSliding"],
		queryFn: () => getKey("@pageSliding"),
	});

	const mutation = useMutation({
		mutationKey: ["pageSliding"],
		mutationFn: () => {
			return setKey(
				"@pageSliding",
				pageSliding === PageSliding.LeftRight
					? PageSliding.UpDown
					: PageSliding.LeftRight
			);
		},
		onSuccess: () => {
			refetch();
		},
	});

	const handleChangeSettings = () => {
		mutation.mutate();
		// setPageSlidingState(newValue);
	};

	useEffect(() => {
		console.log("pageSliding", pageSliding);
		if (pageSliding === null) {
			mutation.mutate();
		}
	}, [pageSliding]);

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
								width: "150%",
							}}
						>
							Page slide direction
						</Text>
						<Text
							style={{
								color: MD3Colors.neutral70,
								fontSize: 14,
								width: "150%",
							}}
						>
							Pages are sliding from{" "}
							{pageSliding == PageSliding.UpDown
								? "top to bottom"
								: "left to right"}
							.
						</Text>
					</View>
					<View
						style={{
							flex: 1,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<IconButton
							icon={
								pageSliding == PageSliding.UpDown
									? "swap-vertical"
									: "swap-horizontal"
							}
							size={40}
							mode="contained-tonal"
							style={{
								borderRadius: 10,
							}}
							onPress={() => handleChangeSettings()}
						/>
					</View>
				</View>
			</Card.Content>
		</Card>
	);
};

export default PageSlidingCard;
