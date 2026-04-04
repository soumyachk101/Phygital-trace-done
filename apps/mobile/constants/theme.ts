/**
 * Forensic Amber Design System — Theme Constants
 * Typography, spacing, and elevation tokens
 */
import { Colors } from './Colors';

export const FontFamilies = {
  // Display & Headlines — Space Grotesk: condensed, aggressive, rhythmic
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  displayRegular: 'SpaceGrotesk_400Regular',

  // Body & Labels — Inter: clean, utilitarian, highly legible
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',

  // Mono — JetBrains Mono for hashes, blockchain data, timestamps
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const Typography = {
  displayLg: {
    fontFamily: FontFamilies.display,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -1.12, // -0.02em
  },
  displayMd: {
    fontFamily: FontFamilies.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.72,
  },
  displaySm: {
    fontFamily: FontFamilies.displayMedium,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.48,
  },
  headlineLg: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 2,
  },
  headlineSm: {
    fontFamily: FontFamilies.displayMedium,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 1.5,
  },
  bodyLg: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
  },
  labelLg: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  labelSm: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  labelXs: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontFamily: FontFamilies.mono,
    fontSize: 12,
    lineHeight: 16,
  },
  monoSm: {
    fontFamily: FontFamilies.mono,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

export const Elevation = {
  level0: Colors.surfaceLowest,
  level1: Colors.surface,
  level2: Colors.surfaceHigh,
  // Ambient shadow for floating modals: primary-tinted
  ambientShadow: {
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 50,
    elevation: 8,
  },
} as const;

export default { Colors, FontFamilies, Typography, Spacing, Elevation };
