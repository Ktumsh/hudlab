import {
  format,
  formatDistanceToNow,
  type FormatDistanceToNowOptions,
} from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export function formatToCapitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatDate(
  input: Date,
  formatStr: string = "dd/MM/yyyy",
): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) throw new Error("Fecha inválida proporcionada.");
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zonedDate = toZonedTime(date, timeZone);
  const formattedDate = format(zonedDate, formatStr, { locale: es });
  return formattedDate;
}

export function formatDateInTimezone(date: Date, formatStr: string) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(date, userTimeZone, formatStr, { locale: es });
}

export function formatDateToNow(
  date: Date,
  options: FormatDistanceToNowOptions = {},
): string {
  const { addSuffix = false, locale = es } = options;
  return formatDistanceToNow(date, {
    addSuffix,
    locale,
  });
}

export function formatRating(rating: number | null | undefined): string | null {
  if (!rating || rating <= 0) return null;

  const scaledRating = rating / 10;

  return scaledRating % 1 === 0
    ? scaledRating.toString()
    : scaledRating.toFixed(1);
}
