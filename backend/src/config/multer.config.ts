import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { BadRequestError } from "@/common/utils/errorClass.utils";

const UPLOAD_DIRECTORY = path.resolve("uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

const allowedMimeTypes = new Set(["image/jpeg", "image/png"]);

// Multer requires you to create the directory when destination is a callback.
fs.mkdirSync(UPLOAD_DIRECTORY, {
	recursive: true,
});

const storage = multer.diskStorage({
	destination: (_req, _file, callback) => {
		callback(null, UPLOAD_DIRECTORY);
	},

	filename: (_req, file, callback) => {
		const extensionByMimeType: Record<string, string> = {
			"image/jpeg": ".jpg",
			"image/png": ".png",
		};

		const extension = extensionByMimeType[file.mimetype];
		const filename = `${crypto.randomUUID()}${extension}`;

		callback(null, filename);
	},
});

export const upload = multer({
	storage,

	limits: {
		fileSize: MAX_FILE_SIZE,
		files: MAX_FILES,
	},

	fileFilter: (_req, file, callback) => {
		if (!allowedMimeTypes.has(file.mimetype)) {
			callback(new BadRequestError("Invalid file type. Only JPEG and PNG images are allowed."));
			return;
		}

		callback(null, true);
	},
});
