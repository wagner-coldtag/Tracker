import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Thermostat from "@mui/icons-material/Thermostat";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, signUp } from "../../actions/Auth.js";
import { UserState } from "../../context/UserProvider";
import Logo from "../global/Logo.jpeg";
import { tokens } from "../../theme";
import "react-phone-input-2/lib/style.css";

const Auth = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    surname: "",
    name: "",
    phone: "",
    notificationEnabled: false,
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [notification, setNotification] = useState({ text: "", severity: "error" });
  const [showNotification, setShowNotification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setLoggedIn } = UserState();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const okColor = colors.blueAccent[500];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCaptcha = (e) => setForm({ ...form, notificationEnabled: e.target.checked });

  const showAlert = (text, severity) => {
    setNotification({ text, severity });
    setShowNotification(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp && form.password !== form.confirmPassword) {
      showAlert("As senhas não coincidem.", "error");
      return;
    }

    const userData = isSignUp ? { ...form, role: "Normal" } : { email: form.email, password: form.password };

    setSubmitting(true);
    try {
      const response = await dispatch(isSignUp ? signUp(userData) : login(form.email, form.password));

      if (response) {
        setNotification({ text: response, severity: "error" });
        setShowNotification(true);
      } else if (isSignUp) {
        setNotification({
          text: "Sua solicitação de abertura de conta foi enviada aos administradores e será resolvida em, no máximo, 24 horas.",
          severity: "success",
        });
        setShowNotification(true);

        setTimeout(() => {
          window.location.href = "https://coldtagsolutions.com";
        }, 3000);
      } else {
        setLoggedIn(true);
        navigate("/");
      }
    } catch (error) {
      showAlert(error.message || "Ação falhou", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      backgroundColor: colors.primary[400],
      "& fieldset": { borderColor: colors.grey[700] },
      "&:hover fieldset": { borderColor: okColor },
      "&.Mui-focused fieldset": { borderColor: okColor, borderWidth: 1 },
      "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}` },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: okColor },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: colors.primary[500],
      }}
    >
      {/* Brand panel (hidden on phones) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          width: "42%",
          p: 6,
          color: "#fff",
          background: `linear-gradient(135deg, ${okColor} 0%, #0B63C4 100%)`,
        }}
      >
<Box
  sx={{
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: "50%",
    overflow: "hidden",
    mb: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <Box
    component="img"
    src={Logo}
    alt="Coldtag"
    sx={{
      width: 90,       // fixed width of the image
      height: "auto",
      objectFit: "contain",
    }}
  />
</Box>

        <Typography variant="h6" sx={{ opacity: 0.9, textAlign: "center", maxWidth: 320 }}>
          Monitoramento e administração de sensores de temperatura em tempo real.
        </Typography>


      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          {/* Logo only on phones, where the brand panel is hidden */}
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 2 }}>
            <Box
              component="img"
              src={Logo}
              alt="Coldtag"
              sx={{
                width: 90,       // fixed width of the image
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          <Typography variant="h3" fontWeight="bold" textAlign="center">
            {isSignUp ? "Criar conta" : "Bem-vindo de volta"}
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ color: colors.grey[300], mt: 0.5, mb: 3 }}>
            {isSignUp ? "Preencha os dados para solicitar acesso." : "Entre com seu e-mail e senha."}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {isSignUp && (
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Sobrenome"
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  sx={fieldSx}
                />
              </Box>
            )}

            <TextField
              fullWidth
              size="small"
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              sx={fieldSx}
              InputProps={{
                startAdornment: <EmailOutlined sx={{ mr: 1, fontSize: 20, color: colors.grey[400] }} />,
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Senha"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              sx={fieldSx}
              InputProps={{
                startAdornment: <LockOutlined sx={{ mr: 1, fontSize: 20, color: colors.grey[400] }} />,
              }}
            />

            {isSignUp && (
              <>
                <TextField
                  fullWidth
                  size="small"
                  label="Confirmar senha"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: <LockOutlined sx={{ mr: 1, fontSize: 20, color: colors.grey[400] }} />,
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Empresa"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  sx={fieldSx}
                />

                <Box
                  className="coldtag-phone-input"
                  sx={{
                    "& .react-tel-input .form-control": {
                      width: "100%",
                      height: 40,
                      borderRadius: "12px",
                      backgroundColor: colors.primary[400],
                      borderColor: colors.grey[700],
                      color: theme.palette.text.primary,
                      fontSize: "0.9rem",
                    },
                    "& .react-tel-input .form-control:focus": {
                      borderColor: okColor,
                      boxShadow: `0 0 0 3px ${alpha(okColor, 0.2)}`,
                    },
                    "& .react-tel-input .flag-dropdown": {
                      borderRadius: "12px 0 0 12px",
                      backgroundColor: colors.primary[400],
                      borderColor: colors.grey[700],
                    },
                    "& .react-tel-input .selected-flag:hover, & .react-tel-input .selected-flag:focus": {
                      backgroundColor: colors.primary[500],
                    },
                    "& .react-tel-input .country-list": {
                      backgroundColor: colors.primary[400],
                      color: theme.palette.text.primary,
                    },
                  }}
                >
                  <PhoneInput
                    country="br"
                    value={form.phone}
                    onChange={(phone) => handleChange({ target: { name: "phone", value: phone } })}
                    inputStyle={{ width: "100%" }}
                    containerStyle={{ width: "100%" }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.notificationEnabled}
                      onChange={handleCaptcha}
                      sx={{
                        color: colors.grey[500],
                        "&.Mui-checked": { color: okColor },
                        "&.Mui-focusVisible": { outline: `2px solid ${okColor}` },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                      Aceito receber notificações por celular.
                    </Typography>
                  }
                  sx={{ mt: -0.5 }}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={submitting}
              sx={{
                mt: 1,
                height: 46,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                backgroundColor: okColor,
                "&:hover": { backgroundColor: alpha(okColor, 0.85) },
                "&.Mui-disabled": { backgroundColor: alpha(okColor, 0.4), color: "#fff" },
              }}
            >
              {submitting ? "Enviando..." : isSignUp ? "Criar conta" : "Entrar"}
            </Button>

            <Typography
              onClick={() => !submitting && setIsSignUp((prev) => !prev)}
              variant="body2"
              textAlign="center"
              sx={{
                mt: 0.5,
                cursor: submitting ? "default" : "pointer",
                color: okColor,
                fontWeight: 600,
                "&:hover": { textDecoration: submitting ? "none" : "underline" },
              }}
            >
              {isSignUp ? "Já tem uma conta? Entrar" : "Não tem uma conta? Cadastre-se"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity={notification.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {notification.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Auth;