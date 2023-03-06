import AsyncStorage from "@react-native-async-storage/async-storage";

export async function changeMainFolder(value: any) {
	try {
		await AsyncStorage.setItem("@mainFolder", value);
	} catch (e) {
		console.log("Error setting mainFolder to storage", e);
	}
}

export async function getMainFolder() {
	try {
		const value = await AsyncStorage.getItem("@mainFolder");
		if (value !== null) {
			return value;
		}
	} catch (e) {
		console.log("Error getting mainFolder from storage", e);
	}
	return null;
}

export async function getBookCache(parentFolder: string) {
	try {
		const value = await AsyncStorage.getItem(parentFolder);
		if (value !== null) {
			return JSON.parse(value);
		}
	} catch (e) {
		console.log("Error getting book cache from storage", e);
	}
	return {};
}

export async function changeBookCache(value: any, parentFolder: string) {
	try {
		const currentBookCache = await getBookCache(parentFolder);
		const newBookCache = { ...currentBookCache, ...value };
		await AsyncStorage.setItem(parentFolder, JSON.stringify(newBookCache));
	} catch (e) {
		console.log("Error setting book cache to storage", e);
	}
}

export async function getLastBooksList() {
	try {
		const value = await AsyncStorage.getItem("@lastBooksList");
		if (value !== null) {
			return JSON.parse(value);
		}
	} catch (e) {
		console.log("Error getting last books list from storage", e);
	}
	return [];
}

export async function changeLastBooksList(value: any) {
	try {
		const currentLastBooksList = await getLastBooksList();
		// add new book to the beginning of the list, if the books already exists, remove it and add it to the beginning
		const newLastBooksList = [value, ...currentLastBooksList.filter((book: any) => book !== value)];
		await AsyncStorage.setItem("@lastBooksList", JSON.stringify(newLastBooksList));
	} catch (e) {
		console.log("Error setting last books list to storage", e);
	}
}

export async function getKey(key: string) {
	try {
		const value = await AsyncStorage.getItem(key);
		if (value !== null) {
			return value;
		}
	} catch (e) {
		console.log("Error getting key from storage", e);
	}
	return null;
}

export async function setKey(key: string, value: any) {
	try {
		console.log("Setting key to storage", key, value)
		await AsyncStorage.setItem(key, value);
	} catch (e) {
		console.log("Error setting key to storage", e);
	}
}

export async function getAllKeys() {
	try {
		const keys = await AsyncStorage.getAllKeys();
		if (keys !== null) {
			return keys;
		}
	} catch (e) {
		console.log("Error getting all keys from storage", e);
	}
	return [];
}