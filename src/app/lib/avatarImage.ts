// Turns a photo the learner picked into a small square data URL, entirely in the browser.
// The server re-validates the result; this step exists so a 6 MB phone photo becomes ~20 KB.

export const AVATAR_SIZE = 256;
const MAX_PICK_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export function avatarFileError(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Please choose a JPG, PNG or WebP image';
  if (file.size > MAX_PICK_BYTES) return 'That image is over 8 MB. Please choose a smaller one';
  return null;
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as an image')); };
    img.src = url;
  });
}

/** A square region of the source image, in source pixels. */
export interface CropRect { sx: number; sy: number; side: number }

/** Clamps a crop so it stays inside the image (side can't exceed the shorter edge). */
export function clampCrop(img: { naturalWidth: number; naturalHeight: number }, c: CropRect): CropRect {
  const side = Math.min(c.side, img.naturalWidth, img.naturalHeight);
  return {
    side,
    sx: Math.min(Math.max(c.sx, 0), img.naturalWidth - side),
    sy: Math.min(Math.max(c.sy, 0), img.naturalHeight - side),
  };
}

/** The largest centred square, i.e. zoom 1 with no panning. */
export function centredCrop(img: { naturalWidth: number; naturalHeight: number }): CropRect {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  return { side, sx: (img.naturalWidth - side) / 2, sy: (img.naturalHeight - side) / 2 };
}

/** Scales the chosen square to AVATAR_SIZE, as JPEG so the payload stays small. */
export function renderAvatar(img: HTMLImageElement, crop: CropRect): string {
  const { sx, sy, side } = clampCrop(img, crop);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser cannot process images');
  ctx.fillStyle = '#ffffff'; // PNGs with transparency would otherwise turn black in JPEG
  ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  return canvas.toDataURL('image/jpeg', 0.85);
}
