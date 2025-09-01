import { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        halloween: {
          "base-100": "oklch(21% 0.006 56.043)",
          "base-200": "oklch(14% 0.004 49.25)",
          "base-300": "oklch(0% 0 0)",
          "base-content": "oklch(84.955% 0 0)",
          primary: "oklch(77.48% 0.204 60.62)",
          "primary-content": "oklch(19.693% 0.004 196.779)",
          secondary: "oklch(45.98% 0.248 305.03)",
          "secondary-content": "oklch(89.196% 0.049 305.03)",
          accent: "oklch(64.8% 0.223 136.073)",
          "accent-content": "oklch(0% 0 0)",
          neutral: "oklch(24.371% 0.046 65.681)",
          "neutral-content": "oklch(84.874% 0.009 65.681)",
          info: "oklch(54.615% 0.215 262.88)",
          "info-content": "oklch(90.923% 0.043 262.88)",
          success: "oklch(62.705% 0.169 149.213)",
          "success-content": "oklch(12.541% 0.033 149.213)",
          warning: "oklch(66.584% 0.157 58.318)",
          "warning-content": "oklch(13.316% 0.031 58.318)",
          error: "oklch(65.72% 0.199 27.33)",
          "error-content": "oklch(13.144% 0.039 27.33)",

          /* custom vars you can use manually */
          "--radius-selector": "1rem",
          "--radius-field": "0.5rem",
          "--radius-box": "1rem",
        }
      }
    ]
  }
};

export default config