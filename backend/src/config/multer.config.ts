import path from "node:path";
import multer from "multer";

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, "uploads/");
	},
	filename: (_req, file, cb) => {
		const date = new Date();
		const timestamp = date.getTime();
		const extension = path.extname(file.originalname);
		const imageName = `${timestamp}${extension}`;
		cb(null, imageName);
	},
});

export const upload = multer({ storage: storage });
