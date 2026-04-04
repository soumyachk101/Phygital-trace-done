/**
 * Forensic Amber Design System — Color Constants
 * Dark-only theme (no light/dark switching for forensic consistency)
 */

const ForensicAmberColors = {
  text: '#e5e2e1',
  background: '#131313',
  tint: '#FF6B00',
  icon: '#4a4949',
  tabIconDefault: '#4a4949',
  tabIconSelected: '#FF6B00',

  // Extended Forensic Amber palette
  primary: '#FF6B00',
  primaryContainer: '#CC5500',
  primaryLight: '#ffb693',
  surface: '#131313',
  surfaceLowest: '#0e0e0e',
  surfaceLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceHigh: '#2a2a2a',
  surfaceHighest: '#353534',
  onSurface: '#e5e2e1',
  secondary: '#c8c6c5',
  tertiary: '#9ccaff',
  outline: '#a98a7d',
  outlineVariant: '#5a4136',
  border: '#1e1e1e',
  borderLight: '#2a2a2a',
  verified: '#00E676',
  suspicious: '#FFAA00',
  revoked: '#FF3D3D',
  pending: '#4FC3F7',
  error: '#ffb4ab',
  inverseSurface: '#e5e2e1',
  inversePrimary: '#a04100',
} as const;

// Forensic apps don't switch themes — truth is absolute.
// But we keep the light/dark structure for library compat.
const Colors = {
  light: ForensicAmberColors,
  dark: ForensicAmberColors,
  ...ForensicAmberColors,
};

export type ColorToken = keyof typeof ForensicAmberColors;
export { Colors };
export default Colors;
