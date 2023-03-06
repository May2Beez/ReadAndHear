import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { getLastBooksList } from "../../api/StorageFetch";
import LabelHeader from "../main/LabelHeader";
import BookCard from "./BookCard";

const LastBooks = () => {
	const { data: lastBooks, refetch: refetchLastBooks } = useQuery({
		queryKey: ["lastBooks"],
		queryFn: () => getLastBooksList(),
	});

	const refreshLastBooks = () => {
		refetchLastBooks();
	};

	useEffect(() => {
		refreshLastBooks();
	}, []);

	return (
		<View>
			<LabelHeader label="Last books" />
			<ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{
				marginHorizontal: 5,
			}}>
				{lastBooks && lastBooks.length > 0 ? (
					lastBooks.map((file) => {
						return <BookCard key={Math.random() * 120} file={file} minify={true} />;
					})
				) : (
					<View />
				)}
			</ScrollView>
		</View>
	);
};

export default LastBooks;
