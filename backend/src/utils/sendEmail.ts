import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
    console.log("📧 Starting password reset email...");
    console.log("📧 To:", email);

    const frontendUrl = process.env.FRONTEND_URL || "https://digitaldentaldesigners.in";

    const resetUrl = `${frontendUrl}/employee/reset-password?token=${resetToken}`;

    console.log("🔗 Reset URL:", resetUrl);

    try {
        const { data, error } = await resend.emails.send({
            from: "Digital Dental Designers <noreply@digitaldentaldesigners.in>",
            to: [email],
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
                        <a
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

                    <p>
                        This password reset link will expire in 1 hour.
                    </p>

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

        if (error) {
            console.error("❌ Resend error:", error);
            throw error;
        }

        console.log("✅ EMAIL SENT!");
        console.log("📨 Resend ID:", data?.id);

        return data;
    } catch (error) {
        console.error("❌ EMAIL SEND FAILED:");
        console.error(error);

        throw error;
    }
};

export const sendOrderConfirmationEmail = async (
    email: string,
    name: string,
    orderId: string,
    patientName: string,
    patientAge: number,
    clinic: string,
    product: string,
    shade: string | undefined,
    selectedTeeth: number[] | undefined,
    notes: string | undefined,
    amount: number,
    quantity: number,
    paymentMode: string | undefined,
    paymentStatus: string | undefined,
) => {
    // console.log("sendOrderConfirmationEmail FUNCTION ENTERED");
    console.log("📧 Starting order confirmation email...");
    console.log("📧 To:", email);
    console.log("📧 Order ID:", orderId);

    const frontendUrl =
        process.env.FRONTEND_URL || "https://digitaldentaldesigners.in";

    const trackingUrl =
        `${frontendUrl}/track-order/${encodeURIComponent(orderId)}`;

    console.log("🔗 Tracking URL:", trackingUrl);

    try {
        // console.log("CALLING RESEND");
        const { data, error } = await resend.emails.send({
            from: "Digital Dental Designers <noreply@digitaldentaldesigners.in>",
            to: [email],
            subject: `Order Confirmation - ${orderId}`,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 650px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f5f7f7;
                    color: #333;
                ">

                    <div style="
                        background: #1D5C5A;
                        color: white;
                        padding: 25px;
                        border-radius: 10px 10px 0 0;
                        text-align: center;
                    ">
                        <h2 style="margin: 0;">
                            3D Digital Dental Designers
                        </h2>

                        <p style="margin: 8px 0 0;">
                            Order Confirmation
                        </p>
                    </div>

                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    ">

                        <h3 style="color: #1D5C5A;">
                            Hello ${name},
                        </h3>

                        <p>
                            Your order has been successfully received.
                        </p>

                        <p>
                            Thank you for choosing
                            <strong>3D Digital Dental Designers</strong>.
                            Our team will process your order and keep you
                            updated as it progresses.
                        </p>

                        <div style="
                            margin: 25px 0;
                            padding: 20px;
                            background: #f1f7f6;
                            border-left: 4px solid #1D5C5A;
                        ">

                            <h3 style="color: #1D5C5A; margin-top: 0;">
                                Order Details
                            </h3>

                            <p>
                                <strong>Order ID:</strong> ${orderId}
                            </p>

                            <p>
                                <strong>Patient Name:</strong> ${patientName}
                            </p>

                            <p>
                                <strong>Patient Age:</strong> ${patientAge}
                            </p>

                            <p>
                                <strong>Clinic:</strong> ${clinic}
                            </p>

                            <p>
                                <strong>Product:</strong> ${product}
                            </p>

                            <p>
                                <strong>Shade:</strong>
                                ${shade || "Not Selected"}
                            </p>

                            <p>
                                <strong>Selected Teeth:</strong>
                                ${selectedTeeth?.length ? selectedTeeth.join(", ") : "Not Provided"}
                            </p>

                            <p>
                                <strong>Quantity:</strong> ${quantity}
                            </p>

                            <p>
                                <strong>Amount:</strong>
                                ₹${amount * quantity}
                            </p>

                            <p>
                                <strong>Payment Mode:</strong>
                                ${paymentMode || "Not Specified"}
                            </p>

                            <p>
                                <strong>Payment Status:</strong>
                                ${paymentStatus || "Pending"}
                            </p>

                            <p>
                                <strong>Notes:</strong>
                                ${notes || "No Notes"}
                            </p>

                        </div>

                        <p>
                            We will notify you when there are important
                            updates regarding your order.
                        </p>

                        <div style="
                            margin: 30px 0;
                            padding: 25px;
                            background: #f1f7f6;
                            border-radius: 10px;
                            text-align: center;
                            border: 1px solid #d8e9e7;
                        ">

                            <h3 style="
                                color: #1D5C5A;
                                margin-top: 0;
                                margin-bottom: 10px;
                            ">
                                Track Your Order
                            </h3>

                            <p style="
                                color: #555;
                                font-size: 14px;
                                margin-bottom: 20px;
                            ">
                                You can check your order progress anytime using the
                                tracking page.
                            </p>

                            <a
                                href="${trackingUrl}"
                                style="
                                    background: #1D5C5A;
                                    color: white;
                                    padding: 14px 28px;
                                    text-decoration: none;
                                    border-radius: 7px;
                                    display: inline-block;
                                    font-weight: bold;
                                    font-size: 14px;
                                "
                            >
                                Track Your Order
                            </a>

                            <p style="
                                margin-top: 18px;
                                margin-bottom: 0;
                                font-size: 12px;
                                color: #888;
                            ">
                                Order ID: ${orderId}
                            </p>

                        </div>

                        <hr style="
                            border: none;
                            border-top: 1px solid #ddd;
                            margin: 30px 0;
                        " />

                        <p style="
                            font-size: 12px;
                            color: #777;
                            text-align: center;
                        ">
                            3D Digital Dental Designers<br />
                            Digital Dental Designers
                        </p>

                    </div>
                </div>
            `,
        });

        console.log("RESEND RETURNED:", {
            hasData: Boolean(data),
            hasError: Boolean(error),
        });

        if (error) {
            console.error("❌ Resend order email error:", error);
            throw error;
        }

        console.log("✅ ORDER CONFIRMATION EMAIL SENT!");
        console.log("📨 Resend ID:", data?.id);

        return data;
    } catch (error) {
        console.error("❌ ORDER EMAIL SEND FAILED:");
        console.error(error);

        throw error;
    }
};
export const sendProductionReportEmail = async (
    to: string,
    order: any,
    pdfBuffer: Buffer,
) => {
    if (!to) {
        throw new Error("Clinic email is missing");
    }

    console.log("📧 Sending production report email...");

    const { data, error } = await resend.emails.send({
        from: "3D Digital Dental Designers <noreply@digitaldentaldesigners.in>",
        to: [to],

        subject: `Production & Delivery Report - Order ${order.orderId}`,

        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>3D Digital Dental Designers</h2>

        <p>Your order has been successfully delivered.</p>

        <p>
          Please find the complete production and delivery
          report attached to this email.
        </p>

        <p>
          <strong>Order ID:</strong> ${order.orderId}
        </p>

        <p>
          Thank you for choosing
          <strong>3D Digital Dental Designers</strong>.
        </p>
      </div>
    `,

        attachments: [
            {
                filename: `${order.orderId}-Production-Report.pdf`,
                content: pdfBuffer,
            },
        ],
    });

    if (error) {
        console.error("❌ Resend production report error:");
        console.error(error);

        throw error;
    }

    console.log("✅ Production report email sent successfully");
    console.log("📨 Resend ID:", data?.id);

    return data;
};