import type { PixelCrop } from "react-image-crop";

export function enforceAspectOnPixelCrop(
  px: PixelCrop,
  ar: number,
  imgW: number,
  imgH: number,
): PixelCrop {
  const cx = px.x + px.width / 2;
  const cy = px.y + px.height / 2;
  let width = px.width;
  let height = px.height;
  const currentAr = width / height;
  if (Math.abs(currentAr - ar) > 0.001) {
    if (currentAr > ar) {
      width = height * ar;
    } else {
      height = width / ar;
    }
  }
  let x = cx - width / 2;
  let y = cy - height / 2;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + width > imgW) x = imgW - width;
  if (y + height > imgH) y = imgH - height;
  width = Math.max(1, Math.min(width, imgW));
  height = Math.max(1, Math.min(height, imgH));
  return { x, y, width, height, unit: "px" } as PixelCrop;
}

export function fitMaxAspectCropAtCenter(
  cx: number,
  cy: number,
  ar: number,
  imgW: number,
  imgH: number,
): PixelCrop {
  // máximos semianchos/semialtos respetando bordes
  const maxHW = Math.min(cx, imgW - cx);
  const maxHH = Math.min(cy, imgH - cy);
  // ajustar por relación: hw = ar * hh
  let hh = Math.min(maxHH, maxHW / ar);
  let hw = ar * hh;
  // asegurar mínimos
  if (!isFinite(hh) || hh < 0.5) hh = 0.5;
  if (!isFinite(hw) || hw < 0.5) hw = 0.5;
  // construir rect centrado
  let width = hw * 2;
  let height = hh * 2;
  let x = cx - hw;
  let y = cy - hh;
  // clamp a límites
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + width > imgW) x = imgW - width;
  if (y + height > imgH) y = imgH - height;
  width = Math.max(1, Math.min(width, imgW));
  height = Math.max(1, Math.min(height, imgH));
  return { x, y, width, height, unit: "px" } as PixelCrop;
}

// Utils genéricos de edición
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const approximatelyEqual = (a: number, b: number, eps = 0.001) =>
  Math.abs(a - b) <= eps;

// Efecto "chicle": comprime el overshoot manteniendo respuesta natural
export function applyOvershootResistance(
  raw: number,
  min: number,
  max: number,
  limit = 30,
): number {
  const clamped = clamp(raw, min, max);
  const overflow = raw - clamped;
  if (overflow === 0) return clamped;
  const sign = Math.sign(overflow);
  const abs = Math.min(Math.abs(overflow), 100);
  const compressed = limit * (1 - 1 / (abs / limit + 1));
  return clamped + sign * compressed;
}
