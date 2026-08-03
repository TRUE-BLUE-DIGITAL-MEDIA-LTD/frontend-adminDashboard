/**
 * Shrink-only zoom-to-fit for the GrapesJS canvas.
 *
 * The Desktop/Tablet/Mobile devices render at fixed frame widths so authors
 * always design against the real device width. The side panels float over the
 * canvas (OxyEditor renders them absolute + z-index), so the frame owns the
 * full editor width; only when the *viewport itself* is narrower than the
 * device frame (e.g. a 1024px screen in 1200px desktop mode) is the frame
 * scaled down via `Canvas.setZoom` instead of clipping.
 */
import type { Editor } from "grapesjs";

/** Optional breathing room around the frame; attachFitZoom passes 0. */
export const FIT_ZOOM_GUTTER = 40;
/** Floor: a transiently 0-width container must never produce setZoom(0)/NaN. */
export const MIN_ZOOM = 5;

export function computeFitZoom(
  containerWidth: number,
  deviceWidth: number,
  gutter: number = FIT_ZOOM_GUTTER,
): number {
  if (!Number.isFinite(containerWidth)) return 100;
  if (!Number.isFinite(deviceWidth) || deviceWidth <= 0) return 100;
  const zoom = ((containerWidth - gutter) / deviceWidth) * 100;
  return Math.min(100, Math.max(MIN_ZOOM, zoom));
}

/** GrapesJS device widths are CSS strings ("1200px") or "" for fluid. */
export function parseDeviceWidth(width: unknown): number | null {
  if (typeof width !== "string" || width === "") return null;
  const parsed = parseFloat(width);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Keep the canvas zoom fitted to the container. Returns a teardown function;
 * `mountEngine` calls it from `destroy()` before `grapes.destroy()`.
 */
export function attachFitZoom(grapes: Editor, container: HTMLElement): () => void {
  const apply = () => {
    const device = grapes.Devices.getSelected();
    const deviceWidth = parseDeviceWidth(device?.get?.("width"));
    if (deviceWidth === null) {
      // Fluid device (defensive — all shipped devices now have widths).
      grapes.Canvas.setZoom(100);
      return;
    }
    // Gutter 0: panels float above the canvas, so the frame may use the
    // whole container — zoom engages only when the container itself is
    // narrower than the device frame.
    grapes.Canvas.setZoom(
      computeFitZoom(container.clientWidth, deviceWidth, 0),
    );
  };

  // ResizeObserver fires once on observe(), covering the initial layout, and
  // again on every panel toggle / window resize.
  const observer = new ResizeObserver(apply);
  observer.observe(container);
  grapes.on("device:select", apply);
  apply();

  return () => {
    observer.disconnect();
    grapes.off("device:select", apply);
  };
}
