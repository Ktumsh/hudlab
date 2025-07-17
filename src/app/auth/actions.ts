"use server";

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
  getLastSession,
  updateUserPassword,
  verifySamePassword,
} from "@/db/querys/user-querys";
import { resultMessages } from "@/lib/result";
import { generateUniqueUsername, generateVerificationCode } from "@/lib/utils";

import { AuthErrorHandler } from "./_lib/auth-error-handler";
import { sendEmailAction } from "./_lib/email-action";
import { auth, signIn } from "./auth";

import type { LoginFormData, SignupFormData } from "@/lib/form-schemas";
import type { UserWithProfile } from "@/lib/types";

export async function getCurrentUser(): Promise<UserWithProfile | null> {
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
  const { email, password, displayName } = data;
  const username = await generateUniqueUsername(email);
  const errorHandler = AuthErrorHandler.getInstance();

  try {
    const user = await createUser({
      email,
      password,
      username,
      displayName,
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
      redirectUrl: "/feed",
    };
  } catch (error: unknown) {
    const errorResult = errorHandler.handleSignupError(error);

    return {
      type: "error",
      message: errorResult.message,
    };
  }
}

export async function login(data: LoginFormData): Promise<Result> {
  const { email, password } = data;
  const errorHandler = AuthErrorHandler.getInstance();

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (errorHandler.isCredentialsSignInError(result.error)) {
        return {
          type: "error",
          message: resultMessages.INVALID_CREDENTIALS,
        };
      }

      return {
        type: "error",
        message: resultMessages.UNKNOWN_ERROR,
      };
    }

    return {
      type: "success",
      message: resultMessages.LOGIN_SUCCESS,
      redirectUrl: "/feed",
    };
  } catch (err) {
    console.error("Error en login:", err);

    const error = errorHandler.handleLoginError(err);

    return {
      type: "error",
      message: error.message,
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

export async function getLastSessionAction(fingerprint: string) {
  try {
    const lastSession = await getLastSession(fingerprint);
    return lastSession;
  } catch (error) {
    console.error("Error getting last session:", error);
    return null;
  }
}
