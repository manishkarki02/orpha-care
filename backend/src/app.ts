// Importing external modules

import cors from "cors";
import express, { type Application } from "express";
import HttpStatus from "http-status";
import path from "path";

const app: Application = express();

import swaggerUi from "swagger-ui-express";
import router from "@/common/routes";
import swaggerSpec from "@/config/swagger.config";
import globalErrorHandler from "./common/middlewares/error.middleware";
import ApiResponse from "./common/utils/response.utils";
// Importing custom modules
import Environment from "./config/env.config";

// Built-in / Imported Middlewares
app.use(
	cors({
		origin: (origin: unknown, callback: (err: Error | null, allow?: boolean) => void) => {
			if (!origin || Environment.get("CORS_ORIGIN").includes(origin as string)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		optionsSuccessStatus: 200,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// Routing
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((_req, res) => {
	ApiResponse.error(res, {
		statusCode: HttpStatus.NOT_FOUND,
		message: "API endpoint not found",
	});
});
app.use(globalErrorHandler);

export default app;
