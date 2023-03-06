import { useMutation, useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Searchbar } from "react-native-paper";
import { changeMainFolder, getMainFolder } from "../api/StorageFetch";
import AllBooksList from "../components/books/AllBooksList";
import LastBooks from "../components/books/LastBook";
import { getFiles, setFiles } from "../global/global";

const BooksView = () => {
	const [searchValue, setSearchValue] = useState<string>("");
	const [allFiles, setAllFiles] = useState<string[]>([]);

	const { data: mainFolder } = useQuery({
		queryKey: ["mainFolder"],
		queryFn: getMainFolder,
	});

	const { refetch } = useQuery({
		queryKey: ["files"],
		queryFn: () => getFiles(),
	});

	const changeFiles = useMutation({
		mutationKey: ["files"],
		mutationFn: (newFiles: string[]) => {
			return setFiles(newFiles);
		},
		onSuccess: () => {
			refetch();
		},
	});

	const resetMainFolder = useMutation({
		mutationKey: ["mainFolder"],
		mutationFn: () => {
			return changeMainFolder("");
		},
	});

	const hasExtension = (file: string) => {
		const ext: string = file.split(".").pop();
		return ext.length > 0 && ext.length < 5 && file.endsWith(ext);
	};

	const isBook = (file: string) => {
		const ext: string = file.split(".").pop();
		return ext === "epub" || ext === "pdf";
	};

	const isDirectory = (file: string) => {
		return !hasExtension(file);
	};

	async function findFiles(
		path: string,
		processedFolders = new Set(),
		results: string[] = []
	) {
		const parentFolder = decodeURIComponent(path);
		if (processedFolders.has(parentFolder)) {
			return results;
		}
		processedFolders.add(parentFolder);
		let files: string[] = [];
		try {
			files = await FileSystem.StorageAccessFramework.readDirectoryAsync(path);
		} catch (err) {
			console.log("Err");
			resetMainFolder.mutate();
			return;
		}
		for (let file of files) {
			if (isDirectory(file)) {
				results = results.concat(await findFiles(file, processedFolders, []));
			} else {
				if (results.includes(file) || !isBook(file)) {
					continue;
				}
				results.push(file);
			}
		}
		return results;
	}

	const refreshFiles = () => {
		if (!mainFolder) {
			return;
		}

		findFiles(mainFolder).then((folders: string[]) => {
			console.log("Loaded " + folders?.length + " folders");
			setAllFiles(folders);
			changeFiles.mutate(folders);
		});
	};

	useEffect(() => {
		refreshFiles();
	}, [mainFolder]);

	useEffect(() => {
		if (searchValue.length > 0) {
			const filteredFiles = allFiles.filter((file) => {
				return file.toLowerCase().includes(searchValue.toLowerCase());
			});
			changeFiles.mutate(filteredFiles);
		} else {
			changeFiles.mutate(allFiles);
		}
	}, [searchValue, allFiles]);

	return (
		<ScrollView
			refreshControl={
				<RefreshControl refreshing={false} onRefresh={refreshFiles} />
			}
		>
			<Searchbar
				value={searchValue}
				placeholder="Search for any title..."
				onChangeText={(text) => setSearchValue(text)}
				placeholderTextColor="gray"
				style={{
					marginHorizontal: 15,
					marginTop: 15,
					borderRadius: 15,
				}}
			/>
			<LastBooks />
			<AllBooksList />
		</ScrollView>
	);
};

export default BooksView;
