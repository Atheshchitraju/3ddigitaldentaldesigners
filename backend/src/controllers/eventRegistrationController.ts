
import type { Request, Response } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "social.digitaldental@gmail.com";
const FROM_EMAIL =
  "Digital Dental Designers <noreply@digitaldentaldesigners.in>";

const escapeHtml = (value: unknown): string => {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};

export const registerForDentistBrand = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      qualification,
      clinic,
      utr,
      utrNumber,
    } = req.body;

    const attendeeName = String(fullName || name || "").trim();
    const attendeeEmail = String(email || "").trim().toLowerCase();
    const attendeePhone = String(phone || "").trim();
    const attendeeQualification = String(
      qualification || clinic || ""
    ).trim();
    const attendeeUtr = String(utr || utrNumber || "").trim();

    if (
      !attendeeName ||
      !attendeeEmail ||
      !attendeePhone ||
      !attendeeUtr
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required registration fields.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(attendeeEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    const safeName = escapeHtml(attendeeName);
    const safeEmail = escapeHtml(attendeeEmail);
    const safePhone = escapeHtml(attendeePhone);
    const safeQualification = escapeHtml(attendeeQualification);
    const safeUtr = escapeHtml(attendeeUtr);

    // 1. Send registration details to the event team.
    const adminEmailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: attendeeEmail,
      subject: `New Registration - The Dentist as a Brand - ${attendeeName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#321708;line-height:1.7">
          <div style="background:#2b0b32;padding:24px;border-radius:10px;color:white">
            <h2 style="margin:0;color:#f4d16f">New Masterclass Registration</h2>
            <p style="margin-bottom:0">The Dentist as a Brand</p>
          </div>

          <div style="padding:24px;border:1px solid #ead8c5;border-radius:10px;margin-top:16px">
            <p><strong>Full Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Qualification / Clinic:</strong> ${safeQualification || "Not provided"}</p>
            <p><strong>UTR Number:</strong> ${safeUtr}</p>
            <p><strong>Registration Fee:</strong> ₹750</p>
            <p><strong>Payment Status:</strong> Pending verification</p>
          </div>

          <p style="font-size:13px;color:#666">
            Please verify the payment details before confirming the attendee's seat.
          </p>
        </div>
      `,
    });

    if (adminEmailResult.error) {
      console.error("Admin registration email error:", adminEmailResult.error);

      return res.status(502).json({
        success: false,
        message: "Unable to submit your registration. Please try again.",
      });
    }

    // 2. Send registration acknowledgement to the attendee.
    const attendeeEmailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [attendeeEmail],
      subject: "Registration Received - The Dentist as a Brand",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#321708;line-height:1.7">
          <div style="background:#2b0b32;padding:25px;border-radius:10px;color:white">
            <h1 style="margin:0;color:#f4d16f">Registration Received!</h1>
            <p style="margin-bottom:0">The Dentist as a Brand</p>
          </div>

          <div style="padding:24px">
            <p>Hi ${safeName},</p>

            <p>
              Thank you for registering for
              <strong>The Dentist as a Brand - From Invisible Expertise to Remarkable Identity</strong>.
            </p>

            <p>We have received your registration details.</p>

            <div style="background:#fff7ed;border:1px solid #ead8c5;border-radius:10px;padding:18px">
              <h3 style="margin-top:0">Event Details</h3>
              <p><strong>Date:</strong> Sunday, 15 November 2026</p>
              <p><strong>Time:</strong> 10:00 AM - 1:00 PM</p>
              <p><strong>Location:</strong> Bengaluru</p>
              <p><strong>Registration Fee:</strong> ₹750</p>
            </div>

            <p>
              Your payment details are pending verification.
              Our team will confirm your registration once your payment is verified.
            </p>

            <p>We look forward to seeing you at the masterclass!</p>

            <p>
              Regards,<br />
              <strong>Digital Dental Designers</strong>
            </p>
          </div>
        </div>
      `,
    });

    if (attendeeEmailResult.error) {
      console.error(
        "Attendee confirmation email error:",
        attendeeEmailResult.error
      );

      // The admin notification was already sent.
      return res.status(200).json({
        success: true,
        confirmationEmailSent: false,
        message:
          "Your registration was received, but we could not send the confirmation email. Please contact the event team.",
      });
    }

    return res.status(200).json({
      success: true,
      confirmationEmailSent: true,
      message:
        "Registration submitted successfully! A confirmation email has been sent to your email address.",
    });
  } catch (error) {
    console.error("Event registration error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while submitting your registration. Please try again.",
    });
  }
};
