"use server";

import {
  type EmailSendsActionType,
  getVerificationCode,
  insertEmailSendsCode,
  updateEmailSends,
  verifyResetToken as verifyResetTokenDB,
} from "@/db/querys/email-querys";
import {
  createUser,
  getUserByEmail,
  getUserById,
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
      token,
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
    const isPasswordRecovery = actionType === "reset_password";
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

    // Para reset de contraseña, usar timing-safe comparison para evitar ataques de enumeración
    if (isPasswordRecovery) {
      // Simular delay para evitar timing attacks
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 100 + 50),
      );

      if (!user) {
        // Retornar éxito incluso si el usuario no existe para evitar enumeración de usuarios
        return {
          status: true,
          message: resultMessages.EMAIL_SENT,
        };
      }

      if (user.status === "disabled") {
        return {
          status: false,
          message: resultMessages.EMAIL_DISABLED,
        };
      }
    } else {
      if (!user) {
        return {
          status: false,
          message: resultMessages.EMAIL_INVALID,
        };
      }

      if (user.email === changePayload.newEmail) {
        return {
          status: false,
          message: resultMessages.EMAIL_SAME,
        };
      }
    }

    const userId = user.id;
    const code = isPasswordRecovery ? "" : generateVerificationCode();

    const token = await insertEmailSendsCode(
      userId,
      code || generateVerificationCode(),
      actionType,
    );

    const emailPayload = isPasswordRecovery
      ? {
          email: basePayload.email,
          token,
        }
      : {
          code,
          token,
          ...(actionType === "email_change"
            ? {
                currentEmail: changePayload.currentEmail,
                newEmail: changePayload.newEmail,
              }
            : { email: basePayload.email }),
        };

    const emailResult = await sendEmailAction(actionType, emailPayload);

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
  try {
    const record = await verifyResetTokenDB(token);

    if (!record) {
      return {
        type: "error",
        message: resultMessages.TOKEN_INVALID,
      };
    }

    const currentDate = new Date();
    if (currentDate > record.expiresAt) {
      return {
        type: "error",
        message: resultMessages.CODE_EXPIRED,
      };
    }

    if (record.verifiedAt) {
      return {
        type: "error",
        message: resultMessages.CODE_ALREADY_USED,
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

    await updateEmailSends(record.userId, "reset_password");

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

export async function verifyResetToken(token: string) {
  try {
    const record = await verifyResetTokenDB(token);

    if (!record) {
      return {
        success: false,
        message: resultMessages.TOKEN_INVALID,
      };
    }

    // Verificar que el token no haya expirado
    const currentDate = new Date();
    if (currentDate > record.expiresAt) {
      return {
        success: false,
        message: resultMessages.CODE_EXPIRED,
      };
    }

    // Verificar que el token no haya sido usado
    if (record.verifiedAt) {
      return {
        success: false,
        message: resultMessages.CODE_ALREADY_USED,
      };
    }

    // Obtener el email del usuario
    const user = await getUserById(record.userId);

    return {
      success: true,
      message: "Token válido",
      email: user?.email || "",
    };
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return {
      success: false,
      message: resultMessages.CODE_ERROR,
    };
  }
}
