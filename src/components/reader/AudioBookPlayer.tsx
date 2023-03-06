import Slider from "@react-native-community/slider";
import { useQuery } from "@tanstack/react-query";
import { Audio } from "expo-av";
import { SoundObject } from "expo-av/build/Audio";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { View } from "react-native";
import * as FileSystem from "expo-file-system";
import { IconButton, MD3Colors, Text } from "react-native-paper";
import { getBookCache } from "../../api/StorageFetch";

interface Props {
	mp3Files: string[];
	file: string;
}

const AudioBookPlayer = ({ mp3Files, file }: Props, ref) => {
	const { data: bookInfo } = useQuery(["bookCache", file], () => {
		return getBookCache(file);
	});

	const [isPlaying, setIsPlaying] = React.useState(false);
	const [speed, setSpeed] = React.useState(bookInfo?.speed || 1);
	const [currentTime, setCurrentTime] = React.useState(
		bookInfo?.currentAudioTime || 1
	);
	const [currentMp3File, setCurrentMp3File] = React.useState(
		bookInfo?.currentAudioFile || 0
	);
	const [duration, setDuration] = React.useState(1);

	const [playbackObject, setPlaybackObject] =
		React.useState<SoundObject | null>();

	const [listOfPlaybackObjects, setListOfPlaybackObjects] = React.useState<
		SoundObject[]
	>([]);

	const formattedCurrentTime = React.useMemo(() => {
		const minutes = Math.floor(currentTime / 60);
		const seconds = Math.floor(currentTime % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	}, [currentTime]);

	const formattedDuration = React.useMemo(() => {
		const minutes = Math.floor(duration / 60);
		const seconds = Math.floor(duration % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	}, [duration]);

	const progress = React.useMemo(() => {
		return currentTime / duration;
	}, [currentTime, duration]);

	const unloadAll = () => {
		if (rewindInterval) clearInterval(rewindInterval);
		listOfPlaybackObjects.forEach(element => {
			element?.sound?.unloadAsync();
		});
		setPlaybackObject(null);
		return {
			currentAudioTime: currentTime,
			currentAudioFile: currentMp3File,
			speed: speed,
		};
	};

	useImperativeHandle(ref, () => ({
		unloadAll: () => unloadAll(),
	}));

	const skipToPrevious = () => {
		if (currentMp3File == 0) return;
		playbackObject.sound.setOnPlaybackStatusUpdate(null);
		setCurrentMp3File(currentMp3File - 1);
		listOfPlaybackObjects[currentMp3File - 1].sound.playAsync();
		listOfPlaybackObjects[currentMp3File - 1].sound.setRateAsync(speed, true);
		setPlaybackObject((oldValue) => {
			oldValue.sound.stopAsync();
			return listOfPlaybackObjects[currentMp3File - 1];
		});
	};

	const skipToNext = () => {
		if (currentMp3File == listOfPlaybackObjects.length - 1) return;
		playbackObject.sound.setOnPlaybackStatusUpdate(null);
		setCurrentMp3File(currentMp3File + 1);
		listOfPlaybackObjects[currentMp3File + 1].sound.playAsync();
		listOfPlaybackObjects[currentMp3File + 1].sound.setRateAsync(speed, true);
		setPlaybackObject((oldValue) => {
			oldValue.sound.stopAsync();
			return listOfPlaybackObjects[currentMp3File + 1];
		});
	};

	const [rewindInterval, setRewindInterval] = React.useState<NodeJS.Timeout>();
	const [rewindTimeout, setRewindTimeout] = React.useState<NodeJS.Timeout>();

	const [forwardInterval, setForwardInterval] =
		React.useState<NodeJS.Timeout>();
	const [forwardTimeout, setForwardTimeout] = React.useState<NodeJS.Timeout>();

	useEffect(() => {
		if (playbackObject) return;
		if (!mp3Files || mp3Files?.length == 0) return;

		(async () => {
			let tempArray: SoundObject[] = [];
			await Promise.all(
				mp3Files.map(async (mp3File) => {
					return Audio.Sound.createAsync(
						{ uri: mp3File },
						{
							shouldPlay: false,
							positionMillis: 0,
							rate: speed,
							shouldCorrectPitch: true,
							pitchCorrectionQuality: Audio.PitchCorrectionQuality.Medium,
						}
					).then((playbackObject) => {
						console.log("created playback object");
						tempArray.push(playbackObject);
					});
				})
			);
			setListOfPlaybackObjects(tempArray);
			setPlaybackObject(tempArray[currentMp3File]);
			tempArray[currentMp3File].sound.setPositionAsync(currentTime * 1000);
		})();
	}, []);

	useEffect(() => {
		if (!playbackObject) return;

		playbackObject.sound.setOnPlaybackStatusUpdate((status) => {
			if (status && status.isLoaded) {
				setCurrentTime(status.positionMillis / 1000);
				setIsPlaying(status.isPlaying);
				setDuration(status.durationMillis / 1000);
			}
			if (status && status.isLoaded && status.didJustFinish) {
				if (currentMp3File < listOfPlaybackObjects.length - 1) {
					skipToNext();
				}
			}
		});
	}, [playbackObject]);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				marginTop: 10,
			}}
		>
			<View
				style={{
					width: "100%",
					height: "100%",
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					flexDirection: "column",
				}}
			>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
					}}
				>
					<IconButton
						mode="contained-tonal"
						style={{
							borderRadius: 10,
						}}
						icon="skip-previous"
						size={30}
						onPress={skipToPrevious}
					/>
					<Text
						style={{
							color: "#FFFFFF",
							fontSize: 20,
							fontFamily: "Roboto",
							fontWeight: "bold",
						}}
					>
						File {currentMp3File + 1} of {mp3Files.length}
					</Text>
					<IconButton
						mode="contained-tonal"
						style={{
							borderRadius: 10,
						}}
						icon="skip-next"
						size={30}
						onPress={skipToNext}
					/>
				</View>
				<Text
					style={{
						color: "#FFFFFF",
						fontSize: 14,
						fontFamily: "Roboto",
						fontWeight: "bold",
					}}
				>
					{formattedCurrentTime} / {formattedDuration} (
					{Math.floor(speed * 10) / 10}x)
				</Text>
				<Slider
					style={{
						width: "100%",
						height: 40,
						zIndex: 100,
					}}
					minimumValue={0}
					maximumValue={1}
					thumbTintColor={MD3Colors.primary50}
					minimumTrackTintColor={MD3Colors.primary60}
					maximumTrackTintColor={MD3Colors.primary30}
					value={progress || 0}
					onSlidingStart={() => {
						if (playbackObject && playbackObject.status.isLoaded) {
							playbackObject.sound.pauseAsync();
						}
					}}
					onSlidingComplete={(value) => {
						if (playbackObject && playbackObject.status.isLoaded) {
							playbackObject.sound.setPositionAsync(value * duration * 1000);
							playbackObject.sound.playAsync();
						}
					}}
				/>
			</View>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					flexDirection: "row",
				}}
			>
				<IconButton
					icon="rewind-10"
					size={36}
					mode="contained-tonal"
					style={{
						borderRadius: 10,
					}}
					onPress={() => {
						if (playbackObject) {
							playbackObject?.sound?.setPositionAsync(
								(currentTime - 10) * 1000
							);
						}
					}}
					onPressIn={() => {
						if (playbackObject && !rewindInterval && !rewindTimeout) {
							setRewindInterval(
								setTimeout(() => {
									setRewindInterval(
										setInterval(() => {
											playbackObject?.sound?.getStatusAsync().then((status) => {
												if (status && status.isLoaded) {
													playbackObject?.sound?.setPositionAsync(
														status.positionMillis - 10000
													);
												}
											});
										}, 150)
									);
								}, 750)
							);
						}
					}}
					onPressOut={() => {
						if (rewindTimeout) {
							clearTimeout(rewindTimeout);
							setRewindTimeout(null);
						}
						if (rewindInterval) {
							clearInterval(rewindInterval);
							setRewindInterval(null);
						}
					}}
				/>
				<IconButton
					icon="rewind"
					size={36}
					mode="contained-tonal"
					style={{
						borderRadius: 10,
					}}
					onPress={() => {
						// slow down audio by 0.1
						if (playbackObject && speed > 0.2) {
							playbackObject?.sound?.setRateAsync(speed - 0.1, true);
							setSpeed(speed - 0.1);
						}
					}}
				/>
				<IconButton
					icon={isPlaying ? "pause" : "play"}
					size={36}
					mode="contained-tonal"
					style={{
						borderRadius: 10,
					}}
					onPress={() => {
						if (playbackObject) {
							if (isPlaying) {
								playbackObject?.sound?.pauseAsync();
							} else {
								playbackObject?.sound?.playAsync();
							}
							setIsPlaying(!isPlaying);
						}
					}}
				/>
				<IconButton
					icon="fast-forward"
					size={36}
					mode="contained-tonal"
					style={{
						borderRadius: 10,
					}}
					onPress={() => {
						// speed up audio by 0.1
						if (playbackObject && speed < 3.0) {
							playbackObject?.sound?.setRateAsync(speed + 0.1, true);
							setSpeed(speed + 0.1);
						}
					}}
				/>
				<IconButton
					icon="fast-forward-10"
					size={36}
					mode="contained-tonal"
					style={{
						borderRadius: 10,
					}}
					onPress={() => {
						if (playbackObject) {
							playbackObject?.sound?.setPositionAsync(
								(currentTime + 10) * 1000
							);
						}
					}}
					onPressIn={() => {
						if (playbackObject && !forwardInterval && !forwardTimeout) {
							setForwardInterval(
								setTimeout(() => {
									setForwardInterval(
										setInterval(() => {
											playbackObject?.sound?.getStatusAsync().then((status) => {
												if (status && status.isLoaded) {
													playbackObject?.sound?.setPositionAsync(
														status.positionMillis + 10000
													);
												}
											});
										}, 150)
									);
								}, 750)
							);
						}
					}}
					onPressOut={() => {
						if (forwardTimeout) {
							clearTimeout(forwardTimeout);
							setForwardTimeout(null);
						}
						if (forwardInterval) {
							clearInterval(forwardInterval);
							setForwardInterval(null);
						}
					}}
				/>
			</View>
		</View>
	);
};

export default forwardRef(AudioBookPlayer);
