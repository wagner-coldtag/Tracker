import React, { useState } from "react";
import { Grid, Paper, Button, Divider, Typography, Snackbar, Alert, Box, TextField } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../global/Logo.jpeg";
import { useNavigate } from "react-router-dom";
import { UserState } from "../../context/UserProvider";
import { useDispatch } from "react-redux";
import { login, signUp } from "../../actions/Auth.js";

const Auth = () => {

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    surname: "",
    name: ""
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [notification, setNotification] = useState({ text: "", severity: "error" });
  const [showNotification, setShowNotification] = useState(false);
  const { setLoggedIn } = UserState();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && form.password !== form.confirmPassword) {
      showAlert("Passwords do not match.", "error");
      return;
    }
    const userData = isSignUp ? { ...form, role: "Normal" } : { email: form.email, password: form.password };
    try {
      const loginError = await dispatch(isSignUp ? signUp(userData) : login(form.email, form.password));
      if (loginError) {
        setNotification({ text: loginError, severity: "error" });
        setShowNotification(true);
      } else {
        setLoggedIn(true);
        navigate("/");
      }
    } catch (error) {
      showAlert(error.message || "Action failed", "error");
    }
  };

  const showAlert = (text, severity) => {
    setNotification({ text, severity });
    setShowNotification(true);
  };

  const googleSuccess = (res) => console.log(res);
  const googleFailure = (error) => showAlert("Google login failed. Try again.", error);

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
              <FormFields form={form} isSignUp={isSignUp} handleChange={handleChange} />
            </Box>
            <Button type="submit" variant="contained" color="primary"
              style={{ width: "270px", height: "45px", fontSize: "1rem", margin: "16px auto", display: "block", backgroundColor: "rgb(30,182,250)", color: "white" }}
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <GoogleLogin onSuccess={googleSuccess} onFailure={googleFailure}
                style={{ width: "270px", marginBottom: "16px" }}
              />
            </div>
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

const FormFields = ({ form, isSignUp, handleChange }) => (
  <>
    {isSignUp && (
      <>
        <CustomTextField label="Name" name="name" value={form.name} handleChange={handleChange} />
        <CustomTextField label="Surname" name="surname" value={form.surname} handleChange={handleChange} />
      </>
    )}
    <CustomTextField label="Email" name="email" type="email" value={form.email} handleChange={handleChange} />
    <CustomTextField label="Password" name="password" type="password" value={form.password} handleChange={handleChange} />
    {isSignUp && (
      <>
        <CustomTextField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} handleChange={handleChange} />
        <CustomTextField label="Company" name="company" value={form.company} handleChange={handleChange} />
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
