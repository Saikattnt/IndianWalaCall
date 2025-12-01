// src/pages/authentication.jsx
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import SignInCard from "../components/LoginForm";

/* Full-page background image (Unsplash) */
const BG_URL =
  "https://images.unsplash.com/photo-1485770958101-9dd7e4ea6d93?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632";

export default function Authentication() {


  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />

      {/* background layer: image + subtle blur, full screen */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          backgroundImage: `url("${BG_URL}")`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          /* slightly darken so glass panel text is readable (very subtle) */
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.12)" /* tweak opacity if needed */,
          },
        }}
      >
        {/* blur the background image only (keeps children sharp) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />
      </Box>

      {/* main stack centers content */}
      <Stack
        component="main"
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          px: 2,
        }}
      >
        <SignInCard />
      </Stack>
    </AppTheme>
  );
}
