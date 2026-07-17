import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const date = new Date();
		const timestamp = date.getTime();
		const extension = path.extname(file.originalname);
		const imageName = `${timestamp}${extension}`;
		cb(null, imageName);
	},
});

export const upload = multer({ storage: storage });
