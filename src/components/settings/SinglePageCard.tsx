import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, IconButton, MD3Colors, Text } from 'react-native-paper';
import { getKey, setKey } from '../../api/StorageFetch';
import { SinglePage } from '../../enums/Enums.d';

const SinglePageCard = () => {
	const { data: singlePage, refetch } = useQuery({
		queryKey: ["singlePage"],
		queryFn: () => getKey("@singlePage"),
	});



	const mutation = useMutation({
		mutationKey: ["singlePage"],
		mutationFn: () => {
			return setKey("@singlePage", singlePage == SinglePage.Single ? SinglePage.Multi : SinglePage.Single);
		},
		onSuccess: () => {
			refetch();
		},
	});

	const handleChangeSettings = () => {
		mutation.mutate();
	};

	useEffect(() => {
		if (singlePage === null) {
			mutation.mutate();
		}
	}, [singlePage]);

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
							Should snap to single page
						</Text>
						<Text
							style={{
								color: MD3Colors.neutral70,
								fontSize: 14,
								width: "130%",
							}}
						>
							PDF Viewer{" "}
							{singlePage == SinglePage.Multi ? "shows no gap between pages." : "focuses one page at once."}
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
							icon={singlePage == SinglePage.Multi ? "cards-variant" : "card-outline"}
							size={40}
							mode="contained-tonal"
							style={{
								borderRadius: 10
							}}
							onPress={() => handleChangeSettings()}
						/>
					</View>
				</View>
			</Card.Content>
		</Card>
);
};

export default SinglePageCard;