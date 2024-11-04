// AccountSettings.js
import React, { useState } from "react";
import { TextField, Button, Typography, Snackbar, Alert, Box } from "@mui/material";
import { useDispatch } from "react-redux";
import { checkPassword, passwordChange } from "../../actions/Auth";
import { useNavigate } from "react-router-dom";


const AccountSettings = () => {
  const user = JSON.parse(localStorage.getItem("profile"));
  const [step, setStep] = useState(1); // Step 1: Verify password, Step 2: Update email/password
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ text: "", severity: "error" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePasswordVerification = async () => {
    if (!currentPassword) {
      setMessage("Informe sua senha pessoal para ter acesso a mudanças no seu perfil!");
      setAlertType("warning");
      return;
    }

    try {
      const loginError = await dispatch(checkPassword(user?.Email, currentPassword));
      if (!loginError) {
        setStep(2); // Move to the next step only if there was no error
      } else {
        setNotification({ text: loginError, severity: "error" });
        setShowNotification(true);
      }
    } catch (error) {
      showAlert(error.message || "Action failed", "error");

    }
  };

  const showAlert = (text, severity) => {
    setNotification({ text, severity });
    setShowNotification(true);
  };


  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("Please fill out both password fields.");
      setAlertType("warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setAlertType("warning");
      return;
    }

    try {
      const loginError = await dispatch(passwordChange(user?.Email, newPassword));

      if (!loginError) {
        setNotification({ text: "Senha alterada com sucesso!", severity: "error" });
        setShowNotification(true);
        navigate("/");
      } else {
        setNotification({ text: loginError, severity: "error" });
        setShowNotification(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update password.");
      setAlertType("error");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" maxWidth="400px" mx="auto" mt={5}>
      <Typography variant="h4" gutterBottom>
        Alterar senha
      </Typography>

      {step === 1 && (
        <>
          <Typography>Informe sua senha atual para poder modificar sua senha</Typography>
          <TextField
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            sx={{ width: "300px",
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
          <Button variant="contained" color="primary" onClick={handlePasswordVerification}
            style={{ width: "300px", height: "45px", fontSize: "1rem", margin: "16px auto", display: "block", backgroundColor: "rgb(30,182,250)", color: "white" }}
          >
            Verificar
          </Button>
          <Snackbar open={showNotification} autoHideDuration={6000} onClose={() => setShowNotification(false)}>
            <Alert onClose={() => setShowNotification(false)} severity={notification.severity}>
              {notification.text}
            </Alert>
          </Snackbar>
        </>
      )}

      {/* Step 2: Update Email and Password */}
      {step === 2 && (
        <>

          {/* Password Reset Section */}
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ width: "300px",
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
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ width: "300px", mt: "20px",
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
          <Button variant="contained" color="secondary" onClick={handlePasswordChange}
            style={{ width: "300px", height: "45px", fontSize: "1rem", margin: "16px auto", display: "block", backgroundColor: "rgb(30,182,250)", color: "white" }}
          >
            Mudar senha
          </Button>
        </>
      )}

      {/* Feedback Message */}
      <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage(null)}>
        <Alert severity={alertType} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountSettings;
