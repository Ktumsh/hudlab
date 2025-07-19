import { genSaltSync, hashSync } from "bcrypt-ts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getExistingUsernamesStartingWith } from "@/db/querys/user-querys";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateUniqueUsername(email: string): Promise<string> {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
  const existingUsernames = await getExistingUsernamesStartingWith(base);
  const usernameSet = new Set(existingUsernames);

  if (!usernameSet.has(base)) return base;

  let counter = 1;
  let candidate = `${base}${counter}`;

  while (usernameSet.has(candidate)) {
    counter++;
    candidate = `${base}${counter}`;
  }

  return candidate;
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function getFirstName(fullName: string): string {
  if (!fullName) return "";

  const trimmed = fullName.trim();
  if (!trimmed) return "";

  const firstSpace = trimmed.indexOf(" ");
  return firstSpace > 0 ? trimmed.substring(0, firstSpace) : trimmed;
}
