import Image from "next/image";
import type { PhotoSlot } from "@/lib/photos";
import { cn } from "@/lib/cn";

/**
 * Warm photographic slot. With a photo: full-bleed image, credit underneath.
 * Without: a line drawing of a hand pump on a warm ground, so the page never looks unfinished.
 */
export function FieldPhoto({ photo, className, priority = false, aspect = "aspect-[16/9]" }: { photo: PhotoSlot; className?: string; priority?: boolean; aspect?: string }) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className={cn("relative overflow-hidden rounded-xl bg-secondary-container ring-1 ring-outline-variant/60", aspect)}>
        {photo.src ? (
          <Image src={photo.src} alt={photo.alt} fill priority={priority} sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
        ) : (
          <PumpIllustration label={photo.alt} />
        )}
      </div>
      {photo.src && (photo.credit || photo.place) && (
        <figcaption className="flex flex-wrap gap-x-2 font-mono text-[11px] text-on-surface-variant">
          {photo.place && <span>{photo.place}</span>}
          {photo.credit && (
            <span>
              Photo: {photo.sourceUrl ? <a href={photo.sourceUrl} className="underline decoration-outline-variant underline-offset-2">{photo.credit}</a> : photo.credit}
              {photo.license && `, ${photo.license}`}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/** Line drawing of a community hand pump, in role colours. */
export function PumpIllustration({ label, className }: { label: string; className?: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 size-full", className)}
    >
      <defs>
        <linearGradient id="fk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--md-secondary-container)" />
          <stop offset="1" stopColor="var(--md-surface-container)" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#fk-sky)" />
      {/* sun */}
      <circle cx="640" cy="120" r="46" fill="var(--md-surface-container-lowest)" opacity="0.7" />
      {/* ground */}
      <path d="M0 360 C 200 340 600 340 800 360 V450 H0 Z" fill="var(--md-surface-container-high)" />
      <g fill="none" stroke="var(--md-on-surface)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.82">
        {/* slab */}
        <path d="M250 352 h300 l-24 -26 h-252 z" fill="var(--md-surface-container-lowest)" />
        {/* body */}
        <rect x="372" y="170" width="44" height="156" rx="6" fill="var(--md-surface-container-lowest)" />
        <path d="M362 326 h64" />
        {/* head */}
        <rect x="360" y="146" width="68" height="30" rx="6" fill="var(--md-surface-container-lowest)" />
        {/* handle */}
        <path d="M426 160 L560 108" strokeWidth="6" />
        <circle cx="426" cy="160" r="6" fill="var(--md-on-surface)" />
        <path d="M556 104 l18 -7" strokeWidth="9" />
        {/* spout */}
        <path d="M372 214 h-46 v14" strokeWidth="8" />
        {/* bucket */}
        <path d="M296 270 h52 l-6 56 h-40 z" fill="var(--md-surface-container-lowest)" />
        <path d="M300 270 c4 -22 40 -22 44 0" />
      </g>
      {/* water */}
      <g fill="var(--md-primary)">
        <path d="M326 236 c0 0 -6 9 -6 13 a6 6 0 0 0 12 0 c0 -4 -6 -13 -6 -13z" opacity="0.9" />
        <path d="M326 256 c0 0 -4 6 -4 9 a4 4 0 0 0 8 0 c0 -3 -4 -9 -4 -9z" opacity="0.6" />
      </g>
      <path d="M302 290 h44" stroke="var(--md-primary)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
