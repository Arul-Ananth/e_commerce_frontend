import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useAuth } from "../global_component/AuthContext.jsx";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login({ email, password });
      const redirect = query.get("redirect") || "/";
      navigate(redirect, { replace: true });
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <Box
          sx={{
            position: "fixed",
            inset: 0,                 // top:0, right:0, bottom:0, left:0
            zIndex: (theme) => theme.zIndex.appBar - 1, // keep AppBar above
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "100vh",
            overflowY: "auto",        // allow scroll if content grows
            backgroundColor: "#f5f5f5",
          }}
      >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/signup")}
            >
              Signup
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}