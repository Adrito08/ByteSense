/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0714",
          900: "#0f0b1f",
          850: "#140f28",
          800: "#191331",
        },
        violet: {
          500: "#7c3aed",
          600: "#6d28d9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,58,237,0.15), 0 20px 60px -20px rgba(124,58,237,0.35)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% -10%, rgba(124,58,237,0.25), transparent 45%), radial-gradient(circle at 100% 0%, rgba(217,70,239,0.12), transparent 40%)",
      },
    },
  },
  plugins: [],
};