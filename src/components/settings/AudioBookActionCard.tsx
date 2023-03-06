import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";
import {
	Button, Card, Divider, MD3Colors, Menu, Text
} from "react-native-paper";
import { getKey, setKey } from "../../api/StorageFetch";

export enum AudioBookAction {
	NOTHING = "Nothing",
	MOVE = "Move",
	COPY = "Copy",
}

const AudioBookActionCard = () => {
	const { data: audioBookAction, refetch } = useQuery({
		queryKey: ["audioBookAction"],
		queryFn: () => getKey("@audioBookAction"),
	});

	const mutation = useMutation({
		mutationKey: ["audioBookAction"],
		mutationFn: (action: AudioBookAction) => {
			return setKey("@audioBookAction", action);
		},
		onSuccess: () => {
			refetch();
		},
	});

	const [showConfigureDialog, setShowConfigureDialog] = React.useState(false);

	const handleChangeAction = (action: AudioBookAction) => {
		mutation.mutate(action);
		setShowConfigureDialog(false);
	};

	return (
		<>
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
								Action to perform on audiobooks
							</Text>
							<Text
								style={{
									color: MD3Colors.neutral70,
									fontSize: 14,
								}}
							>
								{audioBookAction === AudioBookAction.NOTHING || !audioBookAction && (
									<>Not configured yet.</>
								)}
								{audioBookAction === AudioBookAction.MOVE && (
									<>Will <Text style={{
										fontWeight: "bold",
									}}>move</Text> audiobooks to the selected folder.</>
								)}
								{audioBookAction === AudioBookAction.COPY && (
									<>Will <Text style={{
										fontWeight: "bold",
									}}>copy</Text> audiobooks to the selected folder.</>
								)}
							</Text>
						</View>
						<View
							style={{
								flex: 1,
								alignItems: "flex-end",
								justifyContent: "center",
							}}
						>
							<Menu
								visible={showConfigureDialog}
								anchorPosition={"bottom"}
								contentStyle={{
									borderRadius: 15,
								}}
								onDismiss={() => setShowConfigureDialog(false)}
								anchor={
									<Button
										mode="elevated"
										icon="cog"
										compact
										onPress={() => setShowConfigureDialog(true)}
									>
										<Text
											style={{
												fontSize: 16,
											}}
										>
											Configure
										</Text>
									</Button>
								}
							>
								<Menu.Item
									leadingIcon="content-copy"
									onPress={() => {
										handleChangeAction(AudioBookAction.COPY);
									}}
									title={AudioBookAction.COPY}
								/>
								<Divider />
								<Menu.Item
									leadingIcon="file-move"
									onPress={() => {
										handleChangeAction(AudioBookAction.MOVE);
									}}
									title={AudioBookAction.MOVE}
								/>
							</Menu>
						</View>
					</View>
				</Card.Content>
			</Card>
		</>
	);
};

export default AudioBookActionCard;
