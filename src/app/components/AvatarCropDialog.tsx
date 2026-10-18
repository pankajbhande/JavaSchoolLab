import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { CropRect, centredCrop, clampCrop, loadImage, renderAvatar } from '../lib/avatarImage';

const VIEW = 260; // on-screen size of the square crop window, in px
const MAX_ZOOM = 4;
const KEY_STEP = 12; // px panned per arrow key press

interface Props {
  /** The picked file; the dialog is open while this is set. */
  file: File | null;
  onCancel: () => void;
  /** Receives the finished 256px JPEG data URL. */
  onConfirm: (dataUrl: string) => void | Promise<void>;
  busy?: boolean;
}

export function AvatarCropDialog({ file, onCancel, onConfirm, busy = false }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setImg(null); setSrc(null); setCrop(null); setZoom(1); setLoadError(null);
    if (!file) return;
    let cancelled = false;
    const url = URL.createObjectURL(file);
    loadImage(file)
      .then(i => { if (!cancelled) { setImg(i); setSrc(url); setCrop(centredCrop(i)); } })
      .catch(e => { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Could not read that image'); });
    return () => { cancelled = true; URL.revokeObjectURL(url); };
  }, [file]);

  const shorter = img ? Math.min(img.naturalWidth, img.naturalHeight) : 1;

  const panBy = (dx: number, dy: number) => {
    if (!img || !crop) return;
    const k = crop.side / VIEW; // source px per screen px
    setCrop(clampCrop(img, { ...crop, sx: crop.sx - dx * k, sy: crop.sy - dy * k }));
  };

  const changeZoom = (next: number) => {
    if (!img || !crop) return;
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    const side = shorter / z;
    const cx = crop.sx + crop.side / 2;
    const cy = crop.sy + crop.side / 2;
    setZoom(z);
    setCrop(clampCrop(img, { side, sx: cx - side / 2, sy: cy - side / 2 }));
  };

  const scale = crop ? VIEW / crop.side : 1;

  return (
    <Dialog open={!!file} onOpenChange={open => { if (!open && !busy) onCancel(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
          <DialogDescription>Drag to reposition and use the slider to zoom.</DialogDescription>
        </DialogHeader>

        {loadError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{loadError}</p>}

        {img && src && crop && (
          <div className="flex flex-col items-center gap-4">
            <div
              role="application"
              tabIndex={0}
              aria-label="Photo crop area. Use arrow keys to move the photo, plus and minus to zoom."
              className="relative touch-none select-none overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              style={{ width: VIEW, height: VIEW }}
              onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY }; }}
              onPointerMove={e => {
                if (!drag.current) return;
                panBy(e.clientX - drag.current.x, e.clientY - drag.current.y);
                drag.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerUp={() => { drag.current = null; }}
              onPointerCancel={() => { drag.current = null; }}
              onWheel={e => changeZoom(zoom - e.deltaY * 0.002)}
              onKeyDown={e => {
                const moves: Record<string, [number, number]> = {
                  ArrowLeft: [KEY_STEP, 0], ArrowRight: [-KEY_STEP, 0], ArrowUp: [0, KEY_STEP], ArrowDown: [0, -KEY_STEP],
                };
                if (moves[e.key]) { e.preventDefault(); panBy(...moves[e.key]); }
                else if (e.key === '+' || e.key === '=') { e.preventDefault(); changeZoom(zoom + 0.2); }
                else if (e.key === '-') { e.preventDefault(); changeZoom(zoom - 0.2); }
              }}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                className="absolute left-0 top-0 max-w-none"
                style={{
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  transformOrigin: '0 0',
                  transform: `scale(${scale}) translate(${-crop.sx}px, ${-crop.sy}px)`,
                }}
              />
              {/* Circle guide: this is the shape the photo is shown in around the site. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 0 999px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.9)' }}
              />
            </div>

            <div className="flex w-full items-center gap-3">
              <button type="button" onClick={() => changeZoom(zoom - 0.25)} aria-label="Zoom out" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={e => changeZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="h-2 flex-1 cursor-pointer accent-orange-600"
              />
              <button type="button" onClick={() => changeZoom(zoom + 0.25)} aria-label="Zoom in" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">
            Cancel
          </button>
          <button
            type="button"
            disabled={!img || !crop || busy}
            onClick={() => img && crop && onConfirm(renderAvatar(img, crop))}
            className="rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2"
          >
            {busy ? 'Saving…' : 'Save photo'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
