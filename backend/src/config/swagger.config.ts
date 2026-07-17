import swaggerJSDoc from "swagger-jsdoc";
import Environment from "./env.config";

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "OrphaCare API",
			version: "1.0.0",
			description: "API documentation for OrphaCare application",
		},
		servers: [
			{
				url: `http://localhost:${Environment.get("PORT")}/api`,
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ["./src/common/routes/*.ts", "./src/features/**/*.route.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
