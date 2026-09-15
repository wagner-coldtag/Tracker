import { Grid, Paper, Button, Typography, Snackbar, Alert, Box, TextField,FormControlLabel, Checkbox } from "@mui/material";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, signUp } from "../../actions/Auth.js";
import { UserState } from "../../context/UserProvider";
import Logo from "../global/Logo.jpeg";
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
    notificationEnabled: false

  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [notification, setNotification] = useState({ text: "", severity: "error" });
  const [showNotification, setShowNotification] = useState(false);
  const { setLoggedIn } = UserState();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCaptcha = (e) => setForm({ ...form, notificationEnabled: e.target.checked });

  const handleSubmit = async(e) => {
    e.preventDefault();
  
    if (isSignUp && form.password !== form.confirmPassword) {
      showAlert("Passwords do not match.", "error");
      return;
    }
  
    const userData = isSignUp
      ? { ...form, role: "Normal" }
      : { email: form.email, password: form.password };
  
    try {
      const response = await dispatch(isSignUp ? signUp(userData) : login(form.email, form.password));
  
      if (response) {
        setNotification({ text: response, severity: "error" });
        setShowNotification(true);
      } else {
        if (isSignUp) {
          // Show success message
          setNotification({
            text: "Sua solicitação de abertura de conta foi enviada aos administradores e será resolvida em, no máximo, 24 horas.",
            severity: "success",
          });
          setShowNotification(true);
  
          // Redirect after a delay
          setTimeout(() => {
            window.location.href = "https://coldtagsolutions.com";
          }, 3000); // Redirect after 3 seconds
        } else {
          setLoggedIn(true);
          navigate("/");
        }
      }
    } catch (error) {
      showAlert(error.message || "Action failed", "error");
    }
  };

  const showAlert = (text, severity) => {
    setNotification({ text, severity });
    setShowNotification(true);
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ height: "100vh", backgroundColor: "#f5f5f5" }}>
      <Grid item xs={12} sm={8} md={4}>
        <Paper elevation={0} style={{ padding: 20, maxWidth: 350, margin: "15vh auto", border: "1px solid #c9c8c8" }}>
          <Box display="flex" justifyContent="center" mb={1}>
            <img src={Logo} alt="profile-user" style={{ cursor: "pointer" }} />
          </Box>
          <Typography variant="h4" align="center" color="textPrimary">
            {isSignUp ? "Create Account" : "Log In"}
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 2 }}>
              <FormFields form={form} isSignUp={isSignUp} handleChange={handleChange} handleCaptcha={handleCaptcha} />
            </Box>
            <Button type="submit" variant="contained" color="primary"
              style={{ width: "270px", height: "45px", fontSize: "1rem", margin: "16px auto", display: "block", backgroundColor: "rgb(30,182,250)", color: "white" }}
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
            <Typography onClick={() => setIsSignUp(!isSignUp)} component="span"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "8px",
                cursor: "pointer",
                color: "#0079ff",
              }}
            >
              {isSignUp ? "Já tem uma conta? Log in" : "Não tem uma conta? Sign up"}
            </Typography>
          </form>
        </Paper>
      </Grid>
      <Snackbar open={showNotification} autoHideDuration={6000} onClose={() => setShowNotification(false)}>
        <Alert onClose={() => setShowNotification(false)} severity={notification.severity}>
          {notification.text}
        </Alert>
      </Snackbar>
    </Grid>
  );
};
const PhoneTextField = ({ value, handleChange }) => (
  <PhoneInput
    country={"br"} // Default country (Brazil in this case)
    value={value}
    onChange={(phone) => handleChange({ target: { name: "phone", value: phone } })}
    inputStyle={{
      width: "270px",
      height: "45px",
      fontSize: "1rem",
      paddingLeft: "48px",
    }}


    containerStyle={{ paddingLeft: "19px" }}
  />
);

const FormFields = ({ form, isSignUp, handleChange, handleCaptcha }) => (
  
  <>
    {isSignUp && (
      <>
        <CustomTextField label="Nome" name="name" value={form.name} handleChange={handleChange} />
        <CustomTextField label="Sobrenome" name="surname" value={form.surname} handleChange={handleChange} />
      </>
    )}
    <CustomTextField label="E-mail" name="email" type="email" value={form.email} handleChange={handleChange} />

    <CustomTextField label="Senha" name="password" type="password" value={form.password} handleChange={handleChange} />
    {isSignUp && (
      <>
        <CustomTextField label="Confirmar Senha" name="confirmPassword" type="password" value={form.confirmPassword} handleChange={handleChange} />
        <CustomTextField label="Empresa" name="company" value={form.company} handleChange={handleChange} />
        <div style={{ paddingTop: "14px"}}></div>
        <PhoneTextField value={form.phone} handleChange={handleChange} />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.notificationEnabled}
              onChange={handleCaptcha}
              color="primary" // This makes the checkbox blue when checked
              sx={{
                "&.Mui-checked": {
                  color: "rgb(30,182,250)", // Blue color for checked state
                },
                "&.Mui-focusVisible": {
                  outline: `2px solid rgb(30,182,250)`, // Blue outline when focused (touched)
                },
              }}
            />
          }
          label="Aceito receber notificações por celular."
          sx={{ display: "block", textAlign: "center", mt: 1, mb: 1 }}
        />
      </>
    )}
  </>
);

const CustomTextField = ({ label, name, type = "text", value, handleChange }) => (
  <TextField
    fullWidth
    variant="outlined"
    label={label}
    name={name}
    type={type}
    value={value}
    onChange={handleChange}
    margin="normal"
    sx={{ width: "270px",
      "& .MuiOutlinedInput-root": {
        height: "45px",
        "& .MuiInputBase-input": {
          padding: "12px 14px", // Vertical centering
          fontSize: "1rem",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgb(30,182,250)", // Light blue outline on focus
        },
      },
      "& .MuiInputLabel-root": {
        fontSize: "1rem",
        top: "-6px",
        "&.Mui-focused": {
          color: "rgb(30,182,250)", // Light blue label color on focus
        },
      },
    }}
  />
);

export default Auth;
