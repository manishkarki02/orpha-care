import Environment from "@/config/env.config";
import transporter from "@/config/mail.config";

export const sendMail = async (email: string, childName: string) => {
	try {
		const info = await transporter.sendMail({
			from: Environment.get("SMTP_FROM"),
			to: email,
			subject: "Adoption of a child",
			html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Welcome from orphacare.</h2>
          <h4>You are officially In ✔</h4>
          <p style="margin-bottom: 30px;">We have received your adoption request of ${childName}. Please visit orphacare center.</p>

     </div>
      `,
		});
		return info;
	} catch (error) {
		console.log(error);
		return false;
	}
};

export const sendAdoptionRequestApprovedMail = async (email: string, childName: string) => {
	try {
		const info = await transporter.sendMail({
			from: Environment.get("SMTP_FROM"),
			to: email,
			subject: "Adoption request approved",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Adoption Request Approved</h2>
          <p style="color: #555; font-size: 16px;">
            Congratulations. Your adoption request for ${childName} has been approved.
          </p>
          <p style="color: #555; font-size: 16px;">
            Please visit the OrphaCare center for the next steps and required documentation.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Thank you for being part of OrphaCare.
          </p>
        </div>
      `,
		});
		return info;
	} catch {
		return false;
	}
};

export const sendAdoptionRequestRejectedMail = async (email: string, childName: string) => {
	try {
		const info = await transporter.sendMail({
			from: Environment.get("SMTP_FROM"),
			to: email,
			subject: "Adoption request update",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Adoption Request Update</h2>
          <p style="color: #555; font-size: 16px;">
            Thank you for your interest in adopting ${childName}.
          </p>
          <p style="color: #555; font-size: 16px;">
            After reviewing your request, we are unable to approve it at this time.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            You may contact the OrphaCare center if you need more information.
          </p>
        </div>
      `,
		});
		return info;
	} catch {
		return false;
	}
};

export const sendVerificationMail = async (email: string, token: string) => {
	try {
		const verificationLink = `${Environment.get("FRONTEND_URL")}/verify-email?token=${token}&email=${email}`;

		const info = await transporter.sendMail({
			from: Environment.get("SMTP_FROM"),
			to: email,
			subject: "Verify your email address",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Welcome to OrphaCare</h2>
          <p style="color: #555; font-size: 16px;">
            Thank you for registering with us. To complete your registration and verify your account, please click the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            If the button doesn't work, verify using this link: <br>
            <a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a>
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            This link will expire in 5 minutes.
          </p>
        </div>
      `,
		});
		return info;
	} catch (error) {
		console.error("Error sending verification email:", error);
		return false;
	}
};

export const sendResetPasswordMail = async (email: string, resetLink: string) => {
	try {
		const info = await transporter.sendMail({
			from: Environment.get("SMTP_FROM"),
			to: email,
			subject: "Reset Your Password",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px;">
            We received a request to reset your password. Click the button below to proceed:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            If the button doesn't work, verify using this link: <br>
            <a href="${resetLink}" style="color: #007bff;">${resetLink}</a>
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
		});
		return info;
	} catch (error) {
		console.error("Error sending reset password email:", error);
		return false;
	}
};
