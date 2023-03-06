export default class GLOBAL {
	static bookInfo: {file: string, mp3Files: string[]} | null = null;
	static files: string[] | null = null;

}

export function getBookInfo() {
	return GLOBAL.bookInfo;
}

export async function setBookInfo(bookInfo: {file: string, mp3Files: string[]}) {
	GLOBAL.bookInfo = bookInfo;
}

export function getFiles() {
	return GLOBAL.files;
}

export async function setFiles(files: string[]) {
	GLOBAL.files = files;
}
