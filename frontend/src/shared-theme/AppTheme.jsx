import React, { useMemo, useState, createContext, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

export default function AppTheme({ children }) {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#ff9839" },
          background: {
            default: mode === "light" ? "#f8f8f8" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1f1f1f",
          },
          text: {
            primary: mode === "light" ? "#000" : "#fff",
          },
        },
        typography: {
          fontFamily: "Poppins, Roboto, sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}
