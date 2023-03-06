import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Util } from "react-native-file-access";
import {
	Button,
	Card,
	Dialog,
	IconButton,
	MD3Colors,
	Menu,
	Portal,
	ProgressBar,
	Text,
	TextInput,
	Title,
	TouchableRipple,
} from "react-native-paper";
import Pdf from "react-native-pdf";
import {
	changeBookCache,
	changeLastBooksList,
	getBookCache,
	getKey,
	setKey,
} from "../../api/StorageFetch";
import { getBookInfo, setBookInfo } from "../../global/global";
import DocumentPicker from "react-native-document-picker";
import { AudioBookAction } from "../settings/AudioBookActionCard";
import * as FileSystem from "expo-file-system";

interface Props {
	file: string;
	minify?: boolean;
}

const BookCard = ({ file, minify }: Props) => {
	const { data: bookInfo, refetch: refreshBookInfo } = useQuery(
		["bookCache", file],
		() => {
			return getBookCache(file);
		}
	);

	const { data: audiobookAction } = useQuery({
		queryKey: ["audioBookAction"],
		queryFn: () => getKey("@audioBookAction"),
	});

	const mp3Files: string[] = bookInfo?.mp3Files || [];
	const [epubUri, setEpubUri] = useState(null);

	const updateBookInfo = useMutation({
		mutationKey: ["bookCache", file],
		mutationFn: (newBookInfo) => changeBookCache(newBookInfo, file),
		onSuccess: () => {
			refreshBookInfo();
		},
	});

	const addToLastBooks = useMutation({
		mutationKey: ["lastBooks"],
		mutationFn: (newBook: string) => {
			return changeLastBooksList(newBook);
		},
	});

	const { refetch } = useQuery(["currentBook"], () => getBookInfo());

	const openBook = useMutation({
		mutationKey: ["currentBook"],
		mutationFn: (book: { file: string; mp3Files: string[] }) => {
			return setBookInfo(book);
		},
		onSuccess: () => {
			refetch();
		},
	});

	const [passwordProtected, setPasswordProtected] = useState(false);
	const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [password, setPassword] = useState("");

	const hideDialog = () => {
		setShowPassword(false);
		setPasswordDialogVisible(false);
		setPassword("");
	};

	const savePassword = () => {
		if (password === "") {
			return;
		}
		updateBookInfo.mutate({
			...bookInfo,
			password,
		});
		hideDialog();
	};

	useEffect(() => {
		if (bookInfo?.password) {
			console.log("password correct");
			setPasswordProtected((_oldValue) => false);
		}
	}, [bookInfo]);

	const [notSupported, setNotSupported] = useState(false);

	const handleCloseNotSupported = () => {
		setNotSupported(false);
	};

	const [noAudiobookAction, setNoAudiobookAction] = useState(false);

	const handleCloseNoAudiobookAction = () => {
		handleCloseNoAudiobookAction();
		setNoAudiobookAction(false);
	};

	const [showOptions, setShowOptions] = useState(false);

	const [showProgressBar, setShowProgressBar] = useState(false);

	const [progress, setProgress] = useState(0);
	const [total, setTotal] = useState(1);

	const handleCloseProgressBar = () => {
		setShowProgressBar(false);
		setProgress(0);
	};

	// useEffect(() => {
	// 	if (file.endsWith(".epub")) {
	// 		FileSystem.StorageAccessFramework.readAsStringAsync(file, {
	// 			encoding: FileSystem.EncodingType.Base64,
	// 		}).then((uri) => {
	// 			setEpubUri(uri);
	// 		});
	// 	}
	// }, [file]);

	useEffect(() => {
		FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then((res) => {
			res.forEach(async (file) => {
				const info = await FileSystem.getInfoAsync(
					`${FileSystem.documentDirectory}/${file}`
				);
				if (info.isDirectory) {
					FileSystem.readDirectoryAsync(
						`${FileSystem.documentDirectory}/${file}`
					).then(async (res) => {
						const info = await FileSystem.getInfoAsync(
							`${FileSystem.documentDirectory}/${file}/${res[0]}`
						);
						console.log(info);
					});
				}
			});
		});
	}, []);

	const handleAddAudioBooks = (file: string) => {
		DocumentPicker.pickMultiple({
			type: [DocumentPicker.types.audio],
		})
			.then(async (res) => {
				setProgress(0);
				setShowProgressBar(true);
				// Copy files to app directory inside a folder with the book name
				const bookName = decodeURIComponent(file)
					.split("/")
					.pop()
					.split(".")[0];
				const bookDir = `${FileSystem.documentDirectory}/${bookName}`;
				const bookDirExists = await FileSystem.getInfoAsync(bookDir);
				setTotal(res.length);
				if (!bookDirExists.exists) {
					await FileSystem.makeDirectoryAsync(bookDir, { intermediates: true });
				}
				const audioFiles = [];
				await Promise.all(
					res.map(async (file) => {
						return new Promise<void>((resolve, reject) => {
							return FileSystem.copyAsync({
								from: file.uri,
								to: `${bookDir}/`,
							})
								.then(() => {
									audioFiles.push(`${bookDir}/${file.name}`);
									setProgress((oldValue) => oldValue + 1);
									resolve();
								})
								.catch((err) => {
									console.log(err);
									reject(err);
								});
						});
					})
				)
					.then(() => {
						console.log(audioFiles);
						// unique mp3 files
						const uniqueMp3Files = Array.from(
							new Set([...mp3Files, ...audioFiles])
						);
						updateBookInfo.mutate({
							...bookInfo,
							mp3Files: uniqueMp3Files,
						});
						console.log(uniqueMp3Files);
						setShowProgressBar(false);
					})
					.catch((err) => {
						console.log(err);
						setShowProgressBar(false);
					});
			})
			.catch((err) => {
				if (DocumentPicker.isCancel(err)) {
					// User cancelled the picker, exit any dialogs or menus and move on
				} else {
					setShowProgressBar(false);
					throw err;
				}
			});
		setShowOptions(false);
	};

	useEffect(() => {
		console.log("bookInfo", bookInfo);
	}, [bookInfo]);

	return (
		<>
			<Portal>
				<Dialog visible={passwordDialogVisible} onDismiss={hideDialog}>
					<Dialog.Title>Password required!</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">Enter password:</Text>
						<TextInput
							secureTextEntry={!showPassword}
							mode="outlined"
							right={
								<TextInput.Icon
									forceTextInputFocus={false}
									icon={showPassword ? "eye-off" : "eye"}
									onPress={() => setShowPassword(!showPassword)}
								/>
							}
							style={{
								marginTop: 10,
							}}
							value={password}
							onChangeText={(text) => setPassword(text)}
							label="Password"
						/>
					</Dialog.Content>
					<Dialog.Actions
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<Button
							onPress={hideDialog}
							labelStyle={{
								fontWeight: "bold",
								color: MD3Colors.secondary70,
							}}
						>
							Cancel
						</Button>
						<Button
							onPress={savePassword}
							mode="contained-tonal"
							labelStyle={{
								fontWeight: "bold",
								color: MD3Colors.primary70,
								fontSize: 18,
							}}
						>
							Submit
						</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog visible={notSupported} onDismiss={handleCloseNotSupported}>
					<Dialog.Title
						style={{
							color: MD3Colors.error50,
							fontWeight: "bold",
						}}
					>
						Not supported!
					</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">
							Currently only PDF files are supported.
						</Text>
					</Dialog.Content>
					<Dialog.Actions
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
						}}
					>
						<Button
							onPress={handleCloseNotSupported}
							labelStyle={{
								fontWeight: "bold",
								color: MD3Colors.secondary70,
								fontSize: 18,
							}}
						>
							Ok
						</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog
					visible={noAudiobookAction}
					onDismiss={handleCloseNoAudiobookAction}
				>
					<Dialog.Title
						style={{
							color: MD3Colors.error50,
							fontWeight: "bold",
						}}
					>
						Missing action!
					</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">
							You have not set any audiobook action. Go to settings and set one.
						</Text>
					</Dialog.Content>
					<Dialog.Actions
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
						}}
					>
						<Button
							onPress={handleCloseNoAudiobookAction}
							labelStyle={{
								fontWeight: "bold",
								color: MD3Colors.secondary70,
								fontSize: 18,
							}}
						>
							Ok
						</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog
					visible={showProgressBar}
					onDismiss={handleCloseProgressBar}
					dismissable={false}
				>
					<Dialog.Title
						style={{
							color: MD3Colors.neutral60,
							fontWeight: "bold",
						}}
					>
						Please wait...
					</Dialog.Title>
					<Dialog.Content>
						<Title>Copying/Moving audio files...</Title>
						<Text
							variant="bodyMedium"
							style={{
								marginTop: 10,
							}}
						>
							{progress}/{total} files processed
						</Text>
						<ProgressBar
							style={{
								marginTop: 10,
								borderRadius: 10,
							}}
							progress={progress / total}
							color={MD3Colors.primary70}
						/>
					</Dialog.Content>
				</Dialog>
			</Portal>
			<TouchableRipple
				onPress={() => {
					if (passwordProtected) {
						setPasswordDialogVisible(true);
						return;
					}
					if (file.endsWith(".epub")) {
						setNotSupported(true);
						return;
					}
					openBook.mutate({
						file,
						mp3Files,
					});
					addToLastBooks.mutate(file);
					refetch();
				}}
				style={{
					margin: minify ? 0 : 10,
					marginHorizontal: minify ? 10 : 15,
					zIndex: 9999,
					borderRadius: 10,
				}}
				borderless
			>
				<Card>
					<Card.Content
						style={{
							flex: 1,
							flexDirection: "row",
							alignItems: "center",
						}}
					>
						<View
							style={{
								width: 70,
								height: 100,
								marginRight: minify ? 0 : 10,
								alignItems: "center",
								backgroundColor: "#00000000",
								justifyContent: "center",
							}}
						>
							{bookInfo &&
								(passwordProtected ? (
									<IconButton icon="lock" size={30} />
								) : file.endsWith(".pdf") ? (
									<Pdf
										source={{ uri: bookInfo?.thumbnail || file, cache: true }}
										singlePage
										style={{
											width: "100%",
											height: 100,
											alignSelf: "center",
											backgroundColor: "#00000000",
										}}
										password={bookInfo?.password}
										onError={(error) => {
											if (
												error?.toString() ==
												"Error: Password required or incorrect password."
											) {
												setPasswordProtected(true);
												console.log("password protected");
											} else {
												console.log(error);
											}
										}}
										onLoadComplete={(numberOfPages, filePath, size) => {
											console.log(`number of pages: ${numberOfPages}`);
											updateBookInfo.mutate({
												...bookInfo,
												thumbnail: filePath,
											});
											refreshBookInfo();
										}}
									/>
								) : (
									file.endsWith(".epub") && (
										<IconButton icon="sim-off-outline" size={45} />
										// <ReaderProvider>
										// 	{/* @ts-ignore */}
										// 	<Epub
										// 		enableSelection={false}
										// 		enableSwipe={false}
										// 		renderOpeningBookComponent={() => (
										// 			null)
										// 		}

										// 		fileSystem={useFileSystem}
										// 		src={epubUri}
										// 		width={70}
										// 		onDisplayError={(error) => {
										// 			console.log(error);
										// 		}}
										// 	/>
										// </ReaderProvider>
									)
								))}
						</View>
						{!minify && (
							<>
								<View
									style={{
										flex: 1,
										flexDirection: "column",
										justifyContent: "center",
									}}
								>
									<Title numberOfLines={1} ellipsizeMode="tail">
										{Util.basename(decodeURIComponent(file))}
									</Title>
									<View
										style={{
											flex: 1,
											flexDirection: "column",
										}}
									>
										<Text>
											Pages:{" "}
											<Text style={{ fontWeight: "bold" }}>
												{bookInfo?.currentPage || 0} /{" "}
												{bookInfo?.allPages || "?"}
											</Text>
										</Text>
										<Text>
											Has audiobook:{" "}
											<Text style={{ fontWeight: "bold" }}>
												{mp3Files.length > 0 ? "Yes" : "No"}
											</Text>
										</Text>
										{mp3Files.length > 0 && (
											<Text>
												Number of audio files:{" "}
												<Text style={{ fontWeight: "bold" }}>
													{mp3Files.length}
												</Text>
											</Text>
										)}
									</View>
								</View>
								<View>
									<Menu
										anchor={
											<IconButton
												style={{
													marginRight: -10,
												}}
												icon="cog"
												onPress={() => {
													setShowOptions(true);
												}}
											/>
										}
										anchorPosition="bottom"
										contentStyle={{
											borderRadius: 10,
										}}
										onDismiss={() => {
											setShowOptions(false);
										}}
										visible={showOptions}
									>
										<Menu.Item
											onPress={() => {
												if (!audiobookAction) {
													setNoAudiobookAction(true);
													return;
												}
												handleAddAudioBooks(file);
											}}
											title="Add audiobook"
											leadingIcon="music-note-plus"
										/>
									</Menu>
								</View>
							</>
						)}
					</Card.Content>
				</Card>
			</TouchableRipple>
		</>
	);
};

export default BookCard;
