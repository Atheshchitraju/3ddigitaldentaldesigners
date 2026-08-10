import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
    "EMAIL_PASS exists:",
    !!process.env.EMAIL_PASS
);
console.log(
    "EMAIL_PASS length:",
    process.env.EMAIL_PASS?.length
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
});

export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetToken: string
) => {
    console.log("📧 Starting password reset email...");
    console.log("📧 From:", process.env.EMAIL_USER);
    console.log("📧 To:", email);

    const frontendUrl =
        process.env.FRONTEND_URL || "https://digitaldentaldesigners.in";

    const resetUrl =
        `${frontendUrl}/employee/reset-password?token=${resetToken}`;

    console.log("🔗 Reset URL:", resetUrl);

    try {
        console.log("📤 Calling Gmail SMTP...");

        const info = await transporter.sendMail({
            from: `"Digital Dental Designers" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Digital Dental Designers Password",

            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #1D5C5A;">
                        Digital Dental Designers
                    </h2>

                    <p>Hello ${name},</p>

                    <p>
                        We received a request to reset your employee account password.
                    </p>

                    <p>
                        Click the button below to create a new password:
                    </p>

                    <div style="margin: 30px 0;">
                        
                            href="${resetUrl}"
                            style="
                                background:#1D5C5A;
                                color:white;
                                padding:14px 24px;
                                text-decoration:none;
                                border-radius:6px;
                                display:inline-block;
                                font-weight:bold;
                            "
                        >
                            Reset Password
                        </a>
                    </div>

                    <p>This password reset link will expire in 1 hour.</p>

                    <p>
                        If you did not request this password reset,
                        you can safely ignore this email.
                    </p>

                    <hr />

                    <p style="font-size:12px;color:#777;">
                        Digital Dental Designers
                    </p>
                </div>
            `,
        });

        console.log("✅ EMAIL SENT!");
        console.log("📨 Message ID:", info.messageId);

        return info;
    } catch (error) {
        console.error("❌ EMAIL SEND FAILED:");
        console.error(error);

        throw error;
    }
};