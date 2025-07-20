import { siteUrl } from "@/lib";

type EmailBasePayload = {
  email: string;
  token: string;
};

type EmailChangePayload = {
  currentEmail: string;
  newEmail: string;
  code: string;
  token: string;
};

type EmailWithCodePayload = {
  email: string;
  code: string;
  token: string;
};

// Nuevo payload específico para reset de contraseña (sin código)
type EmailResetPasswordPayload = {
  email: string;
  token: string;
};

type Payload =
  | EmailWithCodePayload
  | EmailChangePayload
  | EmailBasePayload
  | EmailResetPasswordPayload;

type ActionType =
  | "email_verification"
  | "reset_password"
  | "email_change"
  | "account_deleted";

export async function sendEmailAction(
  actionType: ActionType,
  payload: Payload,
) {
  const BASE_URL = siteUrl;

  let endpoint = "";

  switch (actionType) {
    case "email_verification":
      endpoint = "/api/auth/email-verify";
      break;
    case "reset_password":
      endpoint = "/api/auth/reset-password";
      break;
    case "email_change":
      endpoint = "/api/auth/email-change";
      break;
    case "account_deleted":
      endpoint = "/api/auth/email-acc-del";
      break;
    default:
      throw new Error("Invalid action type");
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  console.log("Response from server:", responseText);

  try {
    const data = JSON.parse(responseText);
    if (!res.ok) {
      throw new Error(
        data.error || `Error en la acción ${actionType.replace("_", " ")}`,
      );
    }
    return data;
  } catch (error) {
    console.error("Error parsing response:", error);
    throw new Error("Failed to parse response as JSON.");
  }
}
