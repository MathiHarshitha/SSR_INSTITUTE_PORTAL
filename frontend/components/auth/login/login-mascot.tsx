"use client";

import { useId } from "react";
import { Lightbulb, LockKeyhole } from "lucide-react";
import styles from "./login.module.css";

/** watch: following the email · cover: eyes shut for the password · peek: password is revealed */
export type MascotMood = "watch" | "cover" | "peek";

const BODY = "M38 252 C 30 150, 88 36, 200 34 C 312 36, 370 150, 362 252 Z";
/* face features are drawn in a 340-wide frame, then centred on the wider body */
const FACE = "translate(200 146) scale(1.18) translate(-170 -140)";

interface LoginMascotProps {
  mood: MascotMood;
  /** 0–1: how far along the email the user has typed, so the eyes follow it */
  gaze: number;
}

export function LoginMascot({ mood, gaze }: LoginMascotProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  const pupilX = mood === "watch" ? -6 + Math.min(Math.max(gaze, 0), 1) * 12 : 0;
  const pupilY = mood === "watch" ? 3 : 0;

  return (
    <>
      <svg className={styles.mascot} viewBox="0 0 400 250" data-mood={mood} aria-hidden>
        <defs>
          <radialGradient id={id("body")} cx="38%" cy="28%" r="80%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".45" stopColor="#f7fbfd" />
            <stop offset=".78" stopColor="#e0eff6" />
            <stop offset="1" stopColor="#c5e1ed" />
          </radialGradient>
          <linearGradient id={id("shade")} x1="0" y1="0" x2="0" y2="1">
            <stop offset=".55" stopColor="var(--secondary)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--secondary)" stopOpacity=".14" />
          </linearGradient>
          <radialGradient id={id("hand")} cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".6" stopColor="#eef6fa" />
            <stop offset="1" stopColor="#cfe6f0" />
          </radialGradient>
          <linearGradient id={id("beak")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdba74" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
          <linearGradient id={id("mouth")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ea7a1a" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id={id("leaf")} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--secondary)" />
            <stop offset="1" stopColor="color-mix(in oklch, var(--secondary) 55%, white)" />
          </linearGradient>
          <radialGradient id={id("cheek")}>
            <stop offset="0" stopColor="var(--secondary)" stopOpacity=".5" />
            <stop offset="1" stopColor="var(--secondary)" stopOpacity="0" />
          </radialGradient>
          <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id={id("drop")} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f3a52" floodOpacity=".16" />
          </filter>
        </defs>

        <path d={BODY} fill={url("body")} stroke="#c3dde9" strokeWidth={2} filter={url("drop")} />
        <path d={BODY} fill={url("shade")} />
        <ellipse cx="130" cy="80" rx="44" ry="20" transform="rotate(-28 130 80)" fill="#fff" filter={url("blur")} />
        <ellipse cx="114" cy="72" rx="14" ry="7" transform="rotate(-28 114 72)" fill="#fff" />

        {/* learning sprout */}
        <path d="M200 36 C 198 24, 202 14, 210 6" stroke="var(--secondary)" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M208 10 C 216 -4, 234 -6, 242 0 C 234 14, 220 16, 208 10 Z" fill={url("leaf")} />
        <path d="M202 18 C 192 8, 178 8, 172 14 C 180 24, 194 24, 202 18 Z" fill={url("leaf")} opacity={0.8} />

        <g transform={FACE}>
          <ellipse cx="110" cy="161" rx="22" ry="12" fill={url("cheek")} />
          <ellipse cx="230" cy="161" rx="22" ry="12" fill={url("cheek")} />

          {/* open eyes (watch + peek) */}
          <g className={styles.mascotEyes}>
            <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)` }} className={styles.mascotPupils}>
              <ellipse cx="140" cy="132" rx="12.5" ry="16" fill="#0f1b2d" />
              <ellipse cx="200" cy="132" rx="12.5" ry="16" fill="#0f1b2d" />
              <circle cx="144.5" cy="125" r="4.8" fill="#fff" />
              <circle cx="204.5" cy="125" r="4.8" fill="#fff" />
              <circle cx="136.5" cy="139" r="2" fill="#fff" opacity={0.85} />
              <circle cx="196.5" cy="139" r="2" fill="#fff" opacity={0.85} />
            </g>
          </g>

          {/* squeezed-shut marks (cover) */}
          <g className={styles.mascotShut} stroke="#0f1b2d" strokeWidth={4} strokeLinecap="round" fill="none">
            <path d="M92 112 L 80 106" /><path d="M92 124 L 79 126" />
            <path d="M248 112 L 260 106" /><path d="M248 124 L 261 126" />
          </g>

          {/* beak with a friendly open smile */}
          <path d="M155 160 C 161 173, 179 173, 185 160 C 180 182, 160 182, 155 160 Z" fill={url("mouth")} />
          <path d="M162 171 C 167 177, 173 177, 178 171 C 174 178, 166 178, 162 171 Z" fill="#fdba74" />
          <path d="M152 158 C 160 150, 180 150, 188 158 C 182 165, 158 165, 152 158 Z" fill={url("beak")} />
          <ellipse cx="164" cy="155" rx="6" ry="2" fill="#fff" opacity={0.6} />

          {/* paws: hidden behind the panel while watching, rise over the eyes for the password */}
          <g className={styles.mascotPaws}>
            <g filter={url("drop")}>
              <path d="M96 150 C 84 128, 92 98, 116 92 C 136 87, 160 94, 166 110 C 170 122, 164 138, 150 144 C 134 150, 108 158, 96 150 Z" fill={url("hand")} stroke="#c3dde9" strokeWidth={2} />
              <path d="M244 150 C 256 128, 248 98, 224 92 C 204 87, 180 94, 174 110 C 170 122, 176 138, 190 144 C 206 150, 232 158, 244 150 Z" fill={url("hand")} stroke="#c3dde9" strokeWidth={2} />
            </g>
            <g stroke="#b7d5e3" strokeWidth={2.5} strokeLinecap="round" fill="none">
              <path d="M128 90 C 130 96, 131 101, 130 106" /><path d="M146 93 C 147 98, 148 103, 146 108" />
              <path d="M212 90 C 210 96, 209 101, 210 106" /><path d="M194 93 C 193 98, 192 103, 194 108" />
            </g>
            <ellipse cx="114" cy="104" rx="11" ry="5" transform="rotate(-20 114 104)" fill="#fff" opacity={0.9} />
            <ellipse cx="226" cy="104" rx="11" ry="5" transform="rotate(20 226 104)" fill="#fff" opacity={0.9} />
          </g>
        </g>
      </svg>

      {/* paws resting on the panel edge while watching (drawn above the panel) */}
      <svg className={`${styles.mascot} ${styles.mascotFront}`} viewBox="0 0 400 250" data-mood={mood} aria-hidden>
        <g className={styles.mascotRest} filter={url("drop")}>
          <ellipse cx="96" cy="240" rx="30" ry="18" transform="rotate(10 96 240)" fill={url("hand")} stroke="#c3dde9" strokeWidth={2} />
          <ellipse cx="304" cy="240" rx="30" ry="18" transform="rotate(-10 304 240)" fill={url("hand")} stroke="#c3dde9" strokeWidth={2} />
        </g>
      </svg>

      {/* learning bulb ↔ privacy lock, beside the mascot */}
      <span className={styles.mascotBadge} data-mood={mood} aria-hidden>
        <Lightbulb className={styles.badgeBulb} />
        <LockKeyhole className={styles.badgeLock} />
      </span>

      {/* small stack of books on the panel's shoulder */}
      <svg className={styles.mascotBooks} viewBox="0 0 180 104" aria-hidden>
        <rect x="14" y="68" width="150" height="30" rx="8" fill="#ecc98d" />
        <rect x="22" y="74" width="136" height="18" rx="4" fill="#fffaf0" />
        <rect x="14" y="68" width="16" height="30" rx="6" fill="#d9a55a" />
        <rect x="26" y="40" width="136" height="30" rx="8" fill="var(--secondary)" />
        <rect x="34" y="46" width="120" height="18" rx="4" fill="#f5fbfd" />
        <rect x="146" y="40" width="16" height="30" rx="6" fill="color-mix(in oklch, var(--secondary) 80%, black)" />
        <g transform="rotate(-6 96 26)">
          <rect x="30" y="12" width="128" height="28" rx="8" fill="#1e3a5f" />
          <rect x="38" y="18" width="112" height="16" rx="4" fill="#f8fbfd" />
          <rect x="30" y="12" width="16" height="28" rx="6" fill="#142a47" />
          <path d="M120 12 V 44 L 126 38 L 132 44 V 12 Z" fill="color-mix(in oklch, var(--secondary) 60%, white)" />
        </g>
      </svg>
    </>
  );
}
