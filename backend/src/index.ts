import Environment from "@/config/env.config";
import app from "./app";
import redisService from "./common/services/redis.service";

async function bootstrap() {
	try {
		await redisService.connect();
		app.listen(Environment.get("PORT"), () => {
			console.log(`Server is running on http://localhost:${Environment.get("PORT")}`);
		});
	} catch (error) {
		console.error("Failed to connect to Redis:", error);
		process.exit(1);
	}
}

bootstrap();
