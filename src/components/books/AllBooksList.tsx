import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import { getFiles } from "../../global/global";
import LabelHeader from "../main/LabelHeader";
import BookCard from "./BookCard";

const AllBooksList = () => {
	const { data: files } = useQuery({
		queryKey: ["files"],
		queryFn: () => getFiles(),
	});

	return (
		<View style={{
			flex: 1,
		}}>
			<LabelHeader label="All books" />
			<ScrollView>
				{files && files.length > 0 ?
					files.sort().map((file) => {
						return <BookCard key={Math.random() * 120} file={file} />;
					}) : (
						<View style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							marginTop: 20,
						}}>
							<Text style={{
								fontSize: 20,
								fontWeight: "bold",
							}}>No books found</Text>
						</View>
					)}
			</ScrollView>
		</View>
	);
};

export default AllBooksList;
