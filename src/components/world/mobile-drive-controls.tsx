"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type Pedal = "forward" | "reverse";

type MobileDriveControlsProps = {
  lang: "es" | "en";
  onSteer: (value: number) => void;
  onPedal: (pedal: Pedal, pressed: boolean) => void;
  disabled?: boolean;
};

const labels = {
  es: {
    region: "Controles táctiles para conducir el camión escalera",
    direction: "Dirección",
    wheel: "Desliza el volante a izquierda o derecha",
    throttle: "Acelerar",
    brake: "Retroceder",
    drive: "Mantén pulsado para conducir",
    steer: "Desliza para girar",
  },
  en: {
    region: "Touch controls for the aerial ladder truck",
    direction: "Steering",
    wheel: "Drag the steering wheel left or right",
    throttle: "Accelerate",
    brake: "Reverse",
    drive: "Press and hold to drive",
    steer: "Drag to steer",
  },
} as const;

/**
 * Touch-specific controls. Pointer capture keeps the chosen action active even
 * when a finger slides outside the button; every cancellation releases it.
 * Mobile users can steer and accelerate simultaneously with two fingers.
 */
export function MobileDriveControls({
  lang,
  onSteer,
  onPedal,
  disabled = false,
}: MobileDriveControlsProps) {
  const t = labels[lang];
  const wheelRef = useRef<HTMLButtonElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const [wheelOffset, setWheelOffset] = useState(0);
  const pointerButtons = useRef(new Set<Pedal>());

  function resetWheel() {
    activePointerRef.current = null;
    onSteer(0);
    setWheelOffset(0);
  }

  function updateWheel(event: ReactPointerEvent<HTMLButtonElement>) {
    const button = wheelRef.current;
    if (!button || activePointerRef.current !== event.pointerId || disabled) return;
    const rect = button.getBoundingClientRect();
    const limit = Math.max(24, rect.width * 0.30);
    const dx = Math.max(-limit, Math.min(limit, event.clientX - (rect.left + rect.width / 2)));
    const value = dx / limit;
    // In the world simulation, positive steering points left.
    onSteer(-value);
    setWheelOffset(dx);
  }

  function pressPedal(event: ReactPointerEvent<HTMLButtonElement>, pedal: Pedal) {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerButtons.current.add(pedal);
    onPedal(pedal, true);
  }

  function releasePedal(pedal: Pedal) {
    pointerButtons.current.delete(pedal);
    onPedal(pedal, false);
  }

  useEffect(() => {
    if (!disabled) return;
    // Closing a modal or leaving the 3D scene can never leave a pedal held.
    onSteer(0);
    onPedal("forward", false);
    onPedal("reverse", false);
  }, [disabled, onPedal, onSteer]);

  useEffect(() => () => {
    onSteer(0);
    onPedal("forward", false);
    onPedal("reverse", false);
  }, [onPedal, onSteer]);

  return (
    <div
      className="flex w-full items-end justify-between gap-3 sm:gap-6 lg:hidden"
      role="group"
      aria-label={t.region}
      style={{ touchAction: "pan-y" }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-200">
          {t.direction}
        </span>
        <button
          ref={wheelRef}
          type="button"
          disabled={disabled}
          aria-label={t.wheel}
          className="relative flex size-[94px] touch-none select-none items-center justify-center rounded-full border-2 border-white/40 bg-[#102743]/90 shadow-[0_0_30px_rgba(0,0,0,.35)] backdrop-blur focus-visible:outline-offset-4 active:border-violet-300 sm:size-[114px]"
          onPointerDown={(event) => {
            if (disabled) return;
            event.preventDefault();
            activePointerRef.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            updateWheel(event);
          }}
          onPointerMove={updateWheel}
          onPointerUp={(event) => {
            if (activePointerRef.current === event.pointerId) resetWheel();
          }}
          onPointerCancel={(event) => {
            if (activePointerRef.current === event.pointerId) resetWheel();
          }}
          onLostPointerCapture={(event) => {
            if (activePointerRef.current === event.pointerId) resetWheel();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); onSteer(1); setWheelOffset(-28); }
            if (event.key === "ArrowRight") { event.preventDefault(); onSteer(-1); setWheelOffset(28); }
          }}
          onKeyUp={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") resetWheel();
          }}
          onBlur={resetWheel}
        >
          <span className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-white/35" />
          <span
            aria-hidden="true"
            className="pointer-events-none relative flex size-[55px] items-center justify-center rounded-full border-2 border-violet-200/70 bg-violet-400/20 text-2xl text-white shadow-inner shadow-black/30 transition-transform duration-75 sm:size-[70px]"
            style={{ transform: `translateX(${wheelOffset}px)` }}
          >
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" className="size-10" aria-hidden="true">
              <circle cx="20" cy="20" r="15" />
              <circle cx="20" cy="20" r="4" />
              <path d="M5 17h11m8 0h11M20 24v11" />
            </svg>
          </span>
        </button>
        <span className="text-[10px] text-slate-300">{t.steer}</span>
      </div>

      <div className="flex items-end gap-2 sm:gap-3">
        <button
          type="button"
          disabled={disabled}
          aria-label={t.brake}
          onPointerDown={(event) => pressPedal(event, "reverse")}
          onPointerUp={() => releasePedal("reverse")}
          onPointerCancel={() => releasePedal("reverse")}
          onLostPointerCapture={() => releasePedal("reverse")}
          onContextMenu={(event) => event.preventDefault()}
          className="flex h-[78px] w-[62px] touch-none select-none flex-col items-center justify-center gap-1 rounded-2xl border-2 border-amber-200/40 bg-amber-400/15 text-white shadow-lg backdrop-blur active:bg-amber-400/40 disabled:opacity-50 sm:h-[96px] sm:w-[76px]"
        >
          <span aria-hidden="true" className="text-xl font-black">↓</span>
          <span className="text-[10px] font-semibold">{t.brake}</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-label={t.throttle}
          onPointerDown={(event) => pressPedal(event, "forward")}
          onPointerUp={() => releasePedal("forward")}
          onPointerCancel={() => releasePedal("forward")}
          onLostPointerCapture={() => releasePedal("forward")}
          onContextMenu={(event) => event.preventDefault()}
          className="flex h-[104px] w-[76px] touch-none select-none flex-col items-center justify-center gap-1 rounded-2xl border-2 border-emerald-200/50 bg-emerald-400/25 text-white shadow-lg backdrop-blur active:bg-emerald-400/45 disabled:opacity-50 sm:h-[120px] sm:w-[88px]"
        >
          <span aria-hidden="true" className="text-3xl font-black">↑</span>
          <span className="text-[11px] font-bold">{t.throttle}</span>
        </button>
      </div>
    </div>
  );
}
