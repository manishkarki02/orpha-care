import {
	AuthorizationError,
	InternalServerError,
	NotFoundError,
} from "@/common/utils/errorClass.utils";
import Environment from "@/config/env.config";
import prisma from "@/db";
import type { CreateReportRequestSchema } from "@/features/report/report.schema";

export const createMissingReport = async (
	body: CreateReportRequestSchema["body"],
	file: CreateReportRequestSchema["file"],
	reporterId: string,
) => {
	const { lastSeenAddress, lastSeenTime, age, remarks, longitude, latitude, name } = body;
	const image = file.path;
	const user = await prisma.user.findUnique({ where: { id: reporterId } });
	if (!user) throw new NotFoundError("Reporter not found.");

	const finalImage = `${Environment.get("API_URL")}/uploads/${image}`;
	const missingReport = await prisma.missingReport.create({
		data: {
			lastSeenAddress,
			lastSeenTime,
			age,
			remarks,
			longitude,
			latitude,
			reporterId,
			name,
			image: finalImage,
		},
	});

	if (!missingReport) {
		throw new InternalServerError("Failed to create missing report.");
	}

	return missingReport;
};

export const getAllMissingReports = async (reporterId: string) => {
	const missingReports = await prisma.missingReport.findMany({
		where: {
			reporterId: { not: reporterId },
		},
		select: {
			id: true,
			name: true,
			lastSeenAddress: true,
			lastSeenTime: true,
			age: true,
			remarks: true,
			longitude: true,
			latitude: true,
			image: true,
			reporter: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return missingReports;
};

export const getMyMissingReports = async (reporterId: string) => {
	const getMyMissingReports = await prisma.missingReport.findMany({
		where: {
			reporterId,
		},
		select: {
			id: true,
			lastSeenAddress: true,
			lastSeenTime: true,
			age: true,
			remarks: true,
			longitude: true,
			latitude: true,
			image: true,
			reporter: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return getMyMissingReports;
};

export const getMissingReportDetails = async (id: string) => {
	const missingReport = await prisma.missingReport.findUnique({
		where: {
			id: id,
		},
		select: {
			id: true,
			lastSeenAddress: true,
			lastSeenTime: true,
			age: true,
			remarks: true,
			longitude: true,
			latitude: true,
			image: true,
			reporter: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	if (!missingReport) {
		throw new NotFoundError("Missing report not found.");
	}

	return missingReport;
};

export const updateMissingReport = async ({
	id,
	body,
	file,
	reporterId,
}: {
	id: string;
	body: CreateReportRequestSchema["body"];
	file: CreateReportRequestSchema["file"];
	reporterId: string;
}) => {
	const { lastSeenAddress, lastSeenTime, age, remarks, longitude, latitude } = body;
	const existingMissingReport = await prisma.missingReport.findUnique({
		where: {
			id: id,
		},
	});
	if (!existingMissingReport) {
		throw new NotFoundError("Missing report not found.");
	}

	if (existingMissingReport.reporterId !== reporterId) {
		throw new AuthorizationError("You are not authorized to update this missing report.");
	}

	const updatedMissingReport = await prisma.missingReport.update({
		where: {
			id: id,
		},
		data: {
			lastSeenAddress,
			lastSeenTime,
			age,
			remarks,
			longitude,
			latitude,
			image: file
				? `${Environment.get("API_URL")}/uploads/${file.path}`
				: existingMissingReport.image,
		},
	});

	if (!updatedMissingReport) {
		throw new InternalServerError("Failed to update missing report.");
	}

	return updatedMissingReport;
};

export const deleteMissingReport = async (id: string, reporterId: string) => {
	const existingMissingReport = await prisma.missingReport.findUnique({
		where: {
			id: id,
		},
	});
	if (!existingMissingReport) {
		throw new NotFoundError("Missing report not found.");
	}

	if (existingMissingReport.reporterId !== reporterId) {
		throw new AuthorizationError("You are not authorized to delete this missing report.");
	}
	await prisma.missingReport.delete({
		where: { id: id },
	});
};
