// src/components/SignInCard.jsx
import React, { useState, useContext } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";

export default function SignInCard() {
  const theme = useTheme();

  // 0 = Sign In, 1 = Sign Up
  const [formState, setFormState] = useState(0);

  // form fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // password visibility
  const [showPassword, setShowPassword] = useState(false);

  // feedback
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  // one-time prefill flag for redirect from Sign Up -> Sign In
  const [prefillOnce, setPrefillOnce] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleAuth = async () => {
    setErrorMsg("");
    setSnackMsg("");
    setLoading(true);

    try {
      if (formState === 0) {
        // SIGN IN
        const res = await handleLogin(username, password);
        setSnackMsg(res?.message || "Signed in");
        setSnackOpen(true);

        // If these were auto-filled from sign-up, clear them after login
        if (prefillOnce) {
          setUsername("");
          setPassword("");
          setPrefillOnce(false);
        }
      } else {
        // SIGN UP
        const u = username.trim();
        const p = password; // keep exact password
        const n = fullName.trim();

        const res = await handleRegister({ name: n, username: u, password: p });
        setSnackMsg(res?.message || "Account created");
        setSnackOpen(true);

        // 1) clear sign-up specific fields
        setFullName("");

        // 2) switch to Sign In
        setFormState(0);

        // 3) prefill username/password ONCE on the sign-in side
        setUsername(u);
        setPassword(p);
        setPrefillOnce(true); // true means attribute cleared from the field
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setErrorMsg(msg);
      setSnackMsg(msg);
      setSnackOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleAuth();
  };

  return (
    <Paper
      elevation={6}
      component="form"
      onSubmit={onSubmit}
      sx={{
        width: { xs: "94%", sm: 420 },
        maxWidth: 520,
        p: { xs: 3, sm: 4 },
        borderRadius: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "stretch",
        background:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        color: theme.palette.mode === "dark" ? "#fff" : "#111",
      }}
    >
      {/* Toggle */}
      <Box sx={{ display: "flex", gap: 1, mb: 1, position: "relative" }}>
        {errorMsg && (
          <Typography
            variant="caption"
            color="error"
            sx={{ position: "absolute", top: -22 }}
          >
            {errorMsg}
          </Typography>
        )}

        <Button
          type="button"
          variant={formState === 0 ? "contained" : "text"}
          onClick={() => setFormState(0)}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 1,
            px: 2,
            ...(formState === 0
              ? {
                  background: "linear-gradient(90deg,#ffb37a 0%, #ff9839 100%)",
                  color: "#1b1b1b",
                  boxShadow: "0 6px 18px rgba(255,152,57,0.18)",
                }
              : {
                  color: "rgba(255,255,255,0.85)",
                  background: "transparent",
                }),
          }}
          aria-pressed={formState === 0}
        >
          Sign In
        </Button>

        <Button
          type="button"
          variant={formState === 1 ? "contained" : "text"}
          onClick={() => setFormState(1)}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 1,
            px: 2,
            ...(formState === 1
              ? {
                  background: "linear-gradient(90deg,#ffb37a 0%, #ff9839 100%)",
                  color: "#1b1b1b",
                  boxShadow: "0 6px 18px rgba(255,152,57,0.18)",
                }
              : {
                  color: "rgba(255,255,255,0.85)",
                  background: "transparent",
                }),
          }}
          aria-pressed={formState === 1}
        >
          Sign Up
        </Button>
      </Box>

      {/* Full name only for Sign Up */}
      {formState === 1 && (
        <TextField
          label="Full Name"
          name="name"
          id="name"
          fullWidth
          variant="outlined"
          size="medium"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
              "&.Mui-focused fieldset": { borderColor: "#af8966ff" },
            },
            input: { color: "#fff" },
            label: { color: "rgba(255,255,255,0.8)" },
          }}
        />
      )}

      <TextField
        label="Username"
        name="username"
        id="username"
        fullWidth
        variant="outlined"
        size="medium"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
            "&.Mui-focused fieldset": { borderColor: "#af8966ff" },
          },
          input: { color: "#fff" },
          label: { color: "rgba(255,255,255,0.8)" },
        }}
      />

      <TextField
        label="Password"
        name="password"
        id="password"
        type={showPassword ? "text" : "password"}
        fullWidth
        variant="outlined"
        size="medium"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={formState === 0 ? "current-password" : "new-password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
            "&.Mui-focused fieldset": { borderColor: "#af8966ff" },
          },
          input: { color: "#fff" },
          label: { color: "rgba(255,255,255,0.8)" },
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#af8966ff",
            "&:hover": { backgroundColor: "#ff7f00" },
            px: 3,
          }}
        >
          {loading
            ? "Please wait…"
            : formState === 0
            ? "Login"
            : "Create account"}
        </Button>
      </Stack>

      <Snackbar
        open={snackOpen}
        onClose={() => setSnackOpen(false)}
        autoHideDuration={4000}
        message={snackMsg}
      />
    </Paper>
  );
}
