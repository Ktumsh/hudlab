import Plunk from "@plunk/node";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

import EmailTemplate from "@/app/auth/_components/email-template";
import { getUserByEmail } from "@/db/querys/user-querys";
import { siteUrl } from "@/lib";

const plunk = new Plunk(process.env.PLUNK_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);

    const username = user?.profile.username || "Usuario";

    try {
      const body = await render(
        EmailTemplate({
          username,
          verificationCode: "",
          type: "password-reset",
          actionUrl: `${siteUrl}/auth/reset-password?tk=${token}`,
          expirationTime: "15 minutos",
        }),
      );

      const result = await plunk.emails.send({
        to: email,
        subject: "Recuperar contraseña",
        body,
      });

      console.log("Correo enviado exitosamente:", result);
      return NextResponse.json({ success: "Email sent" });
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details:
            emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      );
    }
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
