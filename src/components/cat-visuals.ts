import type { CatState } from "@/lib/world-types";

export type CatVariant = CatState["variant"];

export interface CatPalette {
  primary: string;
  secondary: string;
  accent: string;
  shadow: string;
  glow: string;
  eye: string;
  pupil: string;
}

const CAT_PALETTES: Record<CatVariant, CatPalette> = {
  cream: {
    primary: "var(--cat-cream-primary)",
    secondary: "var(--cat-cream-secondary)",
    accent: "var(--cat-cream-accent)",
    shadow: "rgba(255, 144, 102, 0.34)",
    glow: "rgba(255, 144, 102, 0.4)",
    eye: "var(--cat-eye)",
    pupil: "var(--cat-pupil)",
  },
  peach: {
    primary: "var(--cat-peach-primary)",
    secondary: "var(--cat-peach-secondary)",
    accent: "var(--cat-peach-accent)",
    shadow: "rgba(255, 95, 144, 0.34)",
    glow: "rgba(255, 95, 144, 0.4)",
    eye: "var(--cat-eye)",
    pupil: "var(--cat-pupil)",
  },
  lilac: {
    primary: "var(--cat-lilac-primary)",
    secondary: "var(--cat-lilac-secondary)",
    accent: "var(--cat-lilac-accent)",
    shadow: "rgba(159, 86, 251, 0.35)",
    glow: "rgba(159, 86, 251, 0.42)",
    eye: "var(--cat-eye)",
    pupil: "var(--cat-pupil)",
  },
  mint: {
    primary: "var(--cat-mint-primary)",
    secondary: "var(--cat-mint-secondary)",
    accent: "var(--cat-mint-accent)",
    shadow: "rgba(39, 201, 146, 0.35)",
    glow: "rgba(39, 201, 146, 0.42)",
    eye: "var(--cat-eye)",
    pupil: "var(--cat-pupil)",
  },
};

export function getCatPalette(variant: CatVariant): CatPalette {
  return CAT_PALETTES[variant] ?? CAT_PALETTES.cream;
}
