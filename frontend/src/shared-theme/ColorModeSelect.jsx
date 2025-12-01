import React from "react";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "./AppTheme";

export default function ColorModeSelect(props) {
  const theme = useTheme();
  const colorMode = useColorMode();

  return (
    <Tooltip title="Toggle color mode">
      <IconButton
        color="inherit"
        onClick={colorMode.toggleColorMode}
        {...props}
      >
        {theme.palette.mode === "dark" ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </Tooltip>
  );
}
