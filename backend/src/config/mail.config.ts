import nodemailer from "nodemailer";
import Environment from "./env.config";

const MAIL_SETTINGS = {
	host: Environment.get("SMTP_HOST"),
	port: Environment.get("SMTP_PORT"),
	auth: {
		user: Environment.get("SMTP_USER"),
		pass: Environment.get("SMTP_PASS"),
	},
};

const transporter = nodemailer.createTransport(MAIL_SETTINGS);

export default transporter;
