import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ChangePassword () {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ text: "", severity: "error" });
  const navigate = useNavigate();

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setNotification({ text: "Passwords do not match", severity: "error" });
      setShowNotification(true);
      return;
    }

    const profile = JSON.parse(localStorage.getItem("profile"));
    const { email } = profile.user;

    try {
      const response = await axios.post(
        "https://qm4f8rjp17.execute-api.sa-east-1.amazonaws.com/dev/change-password",
        { email, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setNotification({ text: "Password updated successfully!", severity: "success" });
        setShowNotification(true);
        navigate("/");  // Redirect to homepage after successful password change
      }
    } catch (error) {
      setNotification({ text: error.response?.data?.message || "Error changing password", severity: "error" });
      setShowNotification(true);
      console.error("Error during password change:", error);
    }
  };

  return (
    <Box>
      <form onSubmit={handleChangePassword}>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Change Password
        </Button>
      </form>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
      >
        <Alert onClose={() => setShowNotification(false)} severity={notification.severity}>
          {notification.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChangePassword;
