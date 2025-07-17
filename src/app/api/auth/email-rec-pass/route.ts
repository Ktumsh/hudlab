import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import EmailTemplate from "@/app/auth/_components/email-template";
import { getUserByEmail } from "@/db/querys/user-querys";
import { siteUrl } from "@/lib";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, code, token } = await req.json();

    if (!email || !code || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);

    const username = user?.profile.username || "Usuario";

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@hudlab.com",
      to: email,
      subject: "Recuperar contraseña",
      react: EmailTemplate({
        username,
        verificationCode: code,
        type: "password-reset",
        companyLogo: `${siteUrl}/logo/HUDLab-logo.webp`,
        actionUrl: `${siteUrl}/auth/reset-password?email=${email}&token=${token}`,
      }),
    });

    return NextResponse.json({ success: "Email sent" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
