// AccountSettings.js
import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Snackbar, Alert, Box } from "@mui/material";
import { useDispatch } from "react-redux";
import { checkPassword } from "../../actions/Auth";
import { useSelector } from "react-redux";


const AccountSettings = () => {
  const user = JSON.parse(localStorage.getItem("profile"));
  const [step, setStep] = useState(1); // Step 1: Verify password, Step 2: Update email/password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const handlePasswordVerification = async () => {
    if (!currentPassword) {
      setMessage("Informe sua senha pessoal para ter acesso a mudanças no seu perfil!");
      setAlertType("warning");
      return;
    }

    try {
      await dispatch(checkPassword(user?.user?.Email, currentPassword));
      if (!error) {
        setStep(2); // Move to the next step only if there was no error
      } else {
        // If there's an error, display it.
        setMessage(error);
        setAlertType("error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to verify password.";
      setMessage(errorMessage);
      setAlertType("error");
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      setMessage("Please provide a new email.");
      setAlertType("warning");
      return;
    }

    try {
      const response = await axios.post("/api/update-email", { newEmail });
      setMessage(response.data.message || "Email updated successfully.");
      setAlertType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update email.");
      setAlertType("error");
    }
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
      const response = await axios.post("/api/update-password", { newPassword });
      setMessage(response.data.message || "Password updated successfully.");
      setAlertType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update password.");
      setAlertType("error");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" maxWidth="400px" mx="auto" mt={5}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      {step === 1 && (
        <>
          <Typography>Informe sua senha atual para poder modificar sua senha</Typography>
          <TextField
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handlePasswordVerification} fullWidth>
            Verificar
          </Button>
        </>
      )}

      {/* Step 2: Update Email and Password */}
      {step === 2 && (
        <>
          {/* Email Update Section */}
          <TextField
            label="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleEmailChange} fullWidth>
            Change Email
          </Button>

          <Box my={4} width="100%" borderBottom={1} borderColor="grey.300" />

          {/* Password Reset Section */}
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="secondary" onClick={handlePasswordChange} fullWidth>
            Reset Password
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
