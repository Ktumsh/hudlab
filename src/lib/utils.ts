import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getFirstName(fullName: string): string {
  if (!fullName) return "";

  const trimmed = fullName.trim();
  if (!trimmed) return "";

  const firstSpace = trimmed.indexOf(" ");
  return firstSpace > 0 ? trimmed.substring(0, firstSpace) : trimmed;
}
