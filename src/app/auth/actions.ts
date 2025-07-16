"use server";

import { AuthError } from "next-auth";

import {
  type EmailSendsActionType,
  getVerificationCode,
  insertEmailSendsCode,
  updateEmailSends,
  verifyResetToken,
} from "@/db/querys/email-querys";
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPassword,
  verifySamePassword,
} from "@/db/querys/user-querys";
import { resultMessages } from "@/lib/result";
import { generateVerificationCode } from "@/lib/utils";

import { sendEmailAction } from "./_lib/email-action";
import { auth, signIn } from "./auth";

import type { User } from "@/db/schema";
import type { LoginFormData, SignupFormData } from "@/lib/form-schemas";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const user = await getUserById(userId);
  return user ?? null;
}

interface Result {
  type: "success" | "error";
  message: string;
  redirectUrl?: string;
}

export async function signup(data: SignupFormData): Promise<Result> {
  const { email, password, username, displayName, bio } = data;

  try {
    const user = await createUser({
      email,
      password,
      username,
      displayName,
      bio,
    });

    if (!user) {
      return {
        type: "error",
        message: resultMessages.UNKNOWN_ERROR,
      };
    }

    await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return {
      type: "success",
      message: resultMessages.USER_CREATED,
      redirectUrl: "/",
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return {
        type: "error",
        message: resultMessages.INVALID_CREDENTIALS,
      };
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
    ) {
      const msg = (error as any).message;
      if (msg.includes("duplicate key") && msg.includes("users_email_key")) {
        return {
          type: "error",
          message: resultMessages.EMAIL_ALREADY_EXISTS,
        };
      }
    }

    return {
      type: "error",
      message: resultMessages.UNKNOWN_ERROR,
    };
  }
}

export async function login(data: LoginFormData): Promise<Result> {
  try {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      return {
        type: "error",
        message: resultMessages.INVALID_CREDENTIALS,
      };
    }

    return {
      type: "success",
      message: resultMessages.LOGIN_SUCCESS,
      redirectUrl: "/",
    };
  } catch (err) {
    console.error("Error en login:", err);
    return {
      type: "error",
      message: resultMessages.UNKNOWN_ERROR,
    };
  }
}

export async function verifyCode(
  code: string,
  actionType: EmailSendsActionType,
): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const [verification] = await getVerificationCode(code, actionType);

    if (!verification) {
      return {
        success: false,
        message: resultMessages.CODE_NOT_FOUND,
      };
    }

    const { expiresAt, userId, token } = verification;
    const currentDate = new Date();

    if (currentDate > expiresAt) {
      return {
        success: false,
        message: resultMessages.CODE_EXPIRED,
      };
    }

    const verificationUpdate = await updateEmailSends(userId, actionType);

    if (!verificationUpdate) {
      return {
        success: false,
        message: resultMessages.CODE_ALREADY_USED,
      };
    }

    const message =
      actionType === "email_verification"
        ? "¡Tu correo ha sido verificado!"
        : resultMessages.CODE_VERIFIED;

    return {
      success: true,
      message,
      token, // <-- 🔥 ahora sí
    };
  } catch (error) {
    console.error("Error al verificar el código:", error);
    return {
      success: false,
      message: resultMessages.CODE_ERROR,
    };
  }
}

type EmailBasePayload = {
  email: string;
};

type EmailChangePayload = {
  currentEmail: string;
  newEmail: string;
};

type Payload = EmailChangePayload | EmailBasePayload;

export async function onSendEmail(
  actionType: EmailSendsActionType,
  payload: Payload,
): Promise<{ status: boolean; message: string }> {
  try {
    const isPasswordRecovery = actionType === "password_recovery";
    const basePayload = payload as EmailBasePayload;
    const changePayload = payload as EmailChangePayload;

    const emailToCheck = isPasswordRecovery
      ? basePayload.email
      : changePayload.currentEmail;

    if (!emailToCheck) {
      return {
        status: false,
        message: resultMessages.EMAIL_INVALID,
      };
    }

    const user = await getUserByEmail(emailToCheck);

    if (!user) {
      return {
        status: false,
        message: resultMessages.EMAIL_INVALID,
      };
    }

    if (isPasswordRecovery && user.status === "disabled") {
      return {
        status: false,
        message: resultMessages.EMAIL_DISABLED,
      };
    }

    if (!isPasswordRecovery && user.email === changePayload.newEmail) {
      return {
        status: false,
        message: resultMessages.EMAIL_SAME,
      };
    }

    const userId = user.id;
    const code = generateVerificationCode();

    const token = await insertEmailSendsCode(userId, code, actionType);

    const emailResult = await sendEmailAction(actionType, {
      code,
      token,
      ...(actionType === "password_recovery"
        ? { email: basePayload.email }
        : {
            currentEmail: changePayload.currentEmail,
            newEmail: changePayload.newEmail,
          }),
    });

    if (!emailResult) {
      return {
        status: false,
        message: resultMessages.EMAIL_SEND_ERROR,
      };
    }

    return {
      status: true,
      message: resultMessages.EMAIL_SENT,
    };
  } catch (error) {
    console.error(`Error al enviar el correo (${actionType}):`, error);
    return {
      status: false,
      message: resultMessages.EMAIL_SEND_ERROR,
    };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  console.log("Token:", token);
  try {
    const record = await verifyResetToken(token);

    if (!record) {
      return {
        type: "error",
        message: resultMessages.TOKEN_INVALID,
      };
    }

    const isSame = await verifySamePassword(record.userId, newPassword);

    if (isSame) {
      return {
        type: "error",
        message: resultMessages.SAME_PASSWORD,
      };
    }

    await updateUserPassword(record.userId, newPassword);

    return {
      type: "success",
      message: resultMessages.PASSWORD_UPDATED,
    };
  } catch (error) {
    console.error("Error al resetear la contraseña:", error);
    return {
      type: "error",
      message: resultMessages.PASSWORD_RESET_ERROR,
    };
  }
}
