import Environment from "@/config/env.config";
import app from "./app";
import redisService from "./common/services/redis.service";

// Give in-flight requests a chance to finish, but never let a hung socket
// keep the container alive past the orchestrator's kill timeout.
const SHUTDOWN_TIMEOUT = 10_000;

async function bootstrap() {
	try {
		await redisService.connect();
		const server = app.listen(Environment.get("PORT"), () => {
			console.log(`Server is running on http://localhost:${Environment.get("PORT")}`);
		});

		let shuttingDown = false;

		const shutdown = async (signal: NodeJS.Signals) => {
			if (shuttingDown) return;
			shuttingDown = true;
			console.log(`${signal} received, shutting down...`);

			const forceExit = setTimeout(() => {
				console.error("Shutdown timed out, forcing exit");
				process.exit(1);
			}, SHUTDOWN_TIMEOUT);
			forceExit.unref();

			try {
				// Stop accepting connections first so Redis stays up for
				// whatever is still being served.
				await new Promise<void>((resolve, reject) => {
					server.close((err) => (err ? reject(err) : resolve()));
				});
				await redisService.disconnect();
				process.exit(0);
			} catch (error) {
				console.error("Error during shutdown:", error);
				process.exit(1);
			}
		};

		process.on("SIGTERM", shutdown);
		process.on("SIGINT", shutdown);
	} catch (error) {
		console.error("Failed to connect to Redis:", error);
		process.exit(1);
	}
}

bootstrap();
