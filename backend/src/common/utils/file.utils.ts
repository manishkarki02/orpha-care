import fs from "node:fs/promises";
import type { Request } from "express";

/** Files multer wrote for this request, via `single()`, `array()`, or `fields()`. */
const uploadedFiles = (req: Request): Express.Multer.File[] => {
	if (Array.isArray(req.files)) {
		return req.files;
	}

	if (req.files) {
		return Object.values(req.files).flat();
	}

	return req.file ? [req.file] : [];
};

/**
 * Multer writes to disk before anything validates the request, so a failure after
 * it — validation, the service, the database — leaves the upload orphaned.
 * Fire-and-forget: a failed cleanup must not replace the original error.
 */
export const removeUploadedFiles = (req: Request) => {
	for (const file of uploadedFiles(req)) {
		if (file.path) {
			fs.unlink(file.path).catch(() => undefined);
		}
	}
};
