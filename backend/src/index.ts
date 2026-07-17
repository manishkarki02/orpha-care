import Environment from "@/config/env.config";
import app from "./app";

app.listen(Environment.get("PORT"), () => {
	console.log(`Server is running on http://localhost:${Environment.get("PORT")}`);
});
