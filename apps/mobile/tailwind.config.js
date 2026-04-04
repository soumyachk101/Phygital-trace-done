/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core Surfaces
        ink: "#0e0e0e",
        surface: "#131313",
        "surface-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-raised": "#2a2a2a",
        "surface-highest": "#353534",
        "surface-bright": "#3a3939",
        
        // Borders
        border: "#1e1e1e",
        "border-light": "#2a2a2a",
        "border-ghost": "rgba(90, 65, 54, 0.15)",
        
        // Primary (Amber)
        amber: "#FF6B00",
        "amber-dim": "#CC5500",
        "amber-glow": "#FF8C33",
        "amber-light": "#ffb693",
        "amber-fixed": "#ffdbcc",
        
        // Semantic
        verified: "#00E676",
        suspicious: "#FFAA00",
        revoked: "#FF3D3D",
        pending: "#4FC3F7",
        
        // Tertiary (Blockchain blue)
        "chain-blue": "#9ccaff",
        "chain-container": "#059eff",
        
        // Text
        "text-primary": "#e5e2e1",
        "text-secondary": "#888888",
        "text-muted": "#444444",
        "text-warm": "#e2bfb0",
      },
      fontFamily: {
        display: ["SpaceGrotesk_700Bold", "sans-serif"],
        "display-md": ["SpaceGrotesk_500Medium", "sans-serif"],
        "display-reg": ["SpaceGrotesk_400Regular", "sans-serif"],
        body: ["Inter_400Regular", "sans-serif"],
        "body-md": ["Inter_500Medium", "sans-serif"],
        "body-semi": ["Inter_600SemiBold", "sans-serif"],
        "body-bold": ["Inter_700Bold", "sans-serif"],
        mono: ["JetBrainsMono_400Regular", "monospace"],
        "mono-md": ["JetBrainsMono_500Medium", "monospace"],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
}
