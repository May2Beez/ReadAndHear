import BottomSheet from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { createRef, useEffect, useRef, useState } from "react";
import { BackHandler, View } from "react-native";
import {
	IconButton,
	MD3DarkTheme,
	MD3LightTheme,
	Surface,
	Text,
} from "react-native-paper";
import Pdf from "react-native-pdf";
import { changeBookCache, getBookCache, getKey } from "../api/StorageFetch";
import AudioBookPlayer from "../components/reader/AudioBookPlayer";
import { PageSliding, SinglePage } from "../enums/Enums.d";
import { getBookInfo, setBookInfo } from "../global/global";

interface Props {
	uri: string;
	mp3Files: string[];
}

const Reader = ({ uri, mp3Files }: Props) => {
	const { refetch } = useQuery({
		queryKey: ["currentBook"],
		queryFn: getBookInfo,
	});

	const removeCurrentBook = useMutation({
		mutationKey: ["currentBook"],
		mutationFn: () => setBookInfo(null),
		onSuccess: () => {
			refetch();
		},
	});

	const { data: darkMode } = useQuery({
		queryKey: ["darkMode"],
		queryFn: () => getKey("@darkMode"),
	});

	const { data: pageSliding } = useQuery({
		queryKey: ["pageSliding"],
		queryFn: () => getKey("@pageSliding"),
	});

	const { data: singlePage } = useQuery({
		queryKey: ["singlePage"],
		queryFn: () => getKey("@singlePage"),
	});

	const { data: bookInfo, refetch: refreshBookInfo } = useQuery(
		["bookCache", uri],
		() => {
			return getBookCache(uri);
		}
	);

	const updateBookInfo = useMutation({
		mutationKey: ["bookCache", uri],
		mutationFn: (newBookInfo) => changeBookCache(newBookInfo, uri),
		onSuccess: () => {
			refreshBookInfo();
		},
	});

	const style = darkMode ? MD3DarkTheme : MD3LightTheme;

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [maxPages, setMaxPages] = useState<number>(1);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [epubUri, setEpubUri] = useState<string | null>(null);

	const hasMp3 = mp3Files && mp3Files?.length > 0;

	const audioRef = createRef<typeof AudioBookPlayer>();

	const backAction = () => {
		// @ts-ignore
		const additionalBookInfo = audioRef.current?.unloadAll() || {};
		console.log("additionalBookInfo", additionalBookInfo);

		updateBookInfo.mutate({
			...bookInfo,
			...additionalBookInfo,
			currentPage: currentPage,
			allPages: maxPages,
		});
		removeCurrentBook.mutate();

		return true;
	};

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);
		return () => backHandler.remove();
	}, []);

	// useEffect(() => {
	// 	FileSystem.StorageAccessFramework.readAsStringAsync(uri, {
	// 		encoding: FileSystem.EncodingType.Base64,
	// 	}).then((uri) => {
	// 		setEpubUri(uri);
	// 	});
	// }, [uri]);

	return (
		<View>
			{uri && (
				<View>
					<Surface
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							zIndex: 1,
						}}
					>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 10,
								paddingTop: 35,
								backgroundColor: style.colors.surface,
							}}
						>
							<IconButton
								icon="arrow-left"
								onPress={() => {
									backAction();
								}}
								size={30}
								mode="contained"
								style={{
									borderRadius: 10,
								}}
							/>
							<Text
								style={{
									color: "white",
									fontSize: 22,
									fontFamily: "Exo 2 SemiBold",
									alignSelf: "center",
								}}
							>
								Page{" "}
								<Text
									style={{
										color: "white",
										fontSize: 24,
										fontWeight: "900",
										fontFamily: "arial",
									}}
								>
									{currentPage}
								</Text>{" "}
								of{" "}
								<Text
									style={{
										color: "white",
										fontSize: 24,
										fontWeight: "900",
										fontFamily: "arial",
									}}
								>
									{maxPages}
								</Text>
							</Text>
							<IconButton
								icon="arrow-left"
								onPress={() => {
									backAction();
								}}
								size={30}
								mode="contained"
								style={{
									borderRadius: 10,
									opacity: 0,
								}}
							/>
						</View>
					</Surface>
					<View style={{ width: "100%", height: "100%" }}>
						{uri.endsWith(".pdf") ? (
							<Pdf
								horizontal={pageSliding === PageSliding.LeftRight}
								enablePaging={singlePage == SinglePage.Single}
								page={bookInfo?.currentPage || 0}
								enableAntialiasing={true}
								onError={(error) => {
									console.log(error);
								}}
								onLoadComplete={(numberOfPages, filePath, size) => {
									console.log(`number of pages: ${numberOfPages}`);
									setMaxPages(numberOfPages);
								}}
								onPageChanged={(page, numberOfPages) => {
									console.log(`current page: ${page}`);
									setCurrentPage(page);
								}}
								onScaleChanged={(scale) => {
									console.log(`scale: ${scale}`);
								}}
								onPressLink={(uri) => {
									console.log(`Link pressed: ${uri}`);
								}}
								onLoadProgress={(progressData) => {
									console.log(progressData);
								}}
								source={{
									uri: uri,
									cache: true,
								}}
								password={bookInfo?.password}
								style={[
									{
										flex: 1,
										width: "100%",
										height: "100%",
										backgroundColor: style.colors.background,
									},
								]}
							/>
						) : uri.endsWith("epub") && epubUri ? (
							<></>
						) : // <ReaderProvider>
						// 	<Epub
						// 		fileSystem={useFileSystem}
						// 		src={epubUri}
						// 		width={Dimensions.get("screen").width}
						// 		height={Dimensions.get("window").height}
						// 		onDisplayError={(error) => {
						// 			console.log(error);
						// 		}}
						// 		renderOpeningBookComponent={() => {
						// 			return null;
						// 		}}
						// 		renderLoadingFileComponent={() => {
						// 			return null;
						// 		}}
						// 		defaultTheme={{
						// 			"html": {
						// 				"margin-top": "100px",
						// 				"margin-bottom": "100px",
						// 			},
						// 		}}
						// 	/>
						// </ReaderProvider>
						null}
					</View>
					<BottomSheet
						ref={bottomSheetRef}
						index={0}
						snapPoints={["17%", "28%"]}
						backgroundStyle={{
							backgroundColor: style.colors.backdrop,
						}}
					>
						{hasMp3 && (
							<AudioBookPlayer ref={audioRef} mp3Files={mp3Files} file={uri} />
						)}
					</BottomSheet>
				</View>
			)}
		</View>
	);
};

export default Reader;
