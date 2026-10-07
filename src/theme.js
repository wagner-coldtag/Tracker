import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// color design tokens export
//
// Convention: an index means the same *role* in both modes.
//   primary[400] = card / surface        primary[500] = page background
//   primary[600..900] = progressively deeper surfaces than the page
//   primary[100..300] = muted foreground tones
//   grey / accent scales are index-reversed in light mode (100 = highest contrast,
//   500 = anchor color, identical in both modes).
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
      grey: {
        100: "#e0e0e0",
        200: "#c2c2c2",
        300: "#a3a3a3",
        400: "#858585",
        500: "#666666",
        600: "#525252",
        700: "#3d3d3d",
        800: "#292929",
        900: "#141414",
      },
      primary: {
        100: "#d0d1d5",
        200: "#a1a4ab",
        300: "#727681",
        400: "#1F2A40", // card / surface
        500: "#141b2d", // page background
        600: "#101624",
        700: "#0c101b",
        800: "#080b12",
        900: "#040509",
      },
      greenAccent: {
        100: "#dbf5ee",
        200: "#b7ebde",
        300: "#94e2cd",
        400: "#70d8bd",
        500: "#4cceac",
        600: "#3da58a",
        700: "#2e7c67",
        800: "#1e5245",
        900: "#0f2922",
      },
      redAccent: {
        100: "#f8dcdb",
        200: "#f1b9b7",
        300: "#e99592",
        400: "#e2726e",
        500: "#db4f4a",
        600: "#af3f3b",
        700: "#832f2c",
        800: "#58201e",
        900: "#2c100f",
      },
      // Brand blue, anchored at 500 = #1BB5F7
      blueAccent: {
        100: "#EAF6FE",
        200: "#D2ECFC",
        300: "#9FDCFA",
        400: "#57C4F8",
        500: "#1BB5F7",
        600: "#0B8FD6",
        700: "#0B63C4",
        800: "#083F7D",
        900: "#0A2540",
      },
    }
    : {
      grey: {
        100: "#141414",
        200: "#292929",
        300: "#3d3d3d",
        400: "#525252",
        500: "#666666",
        600: "#858585",
        700: "#a3a3a3",
        800: "#c2c2c2",
        900: "#e0e0e0",
      },
      primary: {
        100: "#2b3247", // muted foreground tones (dark, on a light page)
        200: "#4a5166",
        300: "#727681",
        400: "#f2f0f0", // card / surface
        500: "#fcfcfc", // page background
        600: "#e8e6e6", // deeper than the page, like dark mode
        700: "#d6d4d4",
        800: "#c4c2c2",
        900: "#b0aeae",
      },
      greenAccent: {
        100: "#0f2922",
        200: "#1e5245",
        300: "#2e7c67",
        400: "#3da58a",
        500: "#4cceac",
        600: "#70d8bd",
        700: "#94e2cd",
        800: "#b7ebde",
        900: "#dbf5ee",
      },
      redAccent: {
        100: "#2c100f",
        200: "#58201e",
        300: "#832f2c",
        400: "#af3f3b",
        500: "#db4f4a",
        600: "#e2726e",
        700: "#e99592",
        800: "#f1b9b7",
        900: "#f8dcdb",
      },
      // Same brand-blue scale as dark mode, index-reversed. 500 stays the
      // exact same hex in both modes.
      blueAccent: {
        100: "#0A2540",
        200: "#083F7D",
        300: "#0B63C4",
        400: "#0B8FD6",
        500: "#1BB5F7",
        600: "#57C4F8",
        700: "#9FDCFA",
        800: "#D2ECFC",
        900: "#EAF6FE",
      },
    }),

  // Semantic colors, identical in both modes
  brand: "#1BB5F7", // "in range" / primary actions
  alert: "#e5695a", // "out of range" / destructive (soft red)
});

// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      // One palette definition for both modes: the tokens already carry the differences.
      primary: {
        main: colors.blueAccent[500],
      },
      secondary: {
        main: colors.greenAccent[500],
      },
      error: {
        main: colors.alert,
      },
      neutral: {
        dark: colors.grey[700],
        main: colors.grey[500],
        light: colors.grey[100],
      },
      background: {
        default: colors.primary[500],
        paper: colors.primary[400],
      },
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};