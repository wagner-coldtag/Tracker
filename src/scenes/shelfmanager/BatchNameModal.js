import {
  Modal,
  Box,
  Typography,
  TextField,
  Button
} from "@mui/material";
import React, { useState } from "react";
  
const modalStyle = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  width: 300,
};
  
const BatchNameModal = ({ open, handleClose, batchName, setBatchName, postBatch }) => {
  const [tempName, setTempName] = useState(batchName || "");
  

  const handleSave = () => {
    const trimmedName = tempName.trim();
    if (trimmedName) {
      setBatchName(trimmedName);
      postBatch(); // <- chama a API logo após definir o nome
    }
    handleClose();
  };

  
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>Definir Nome do Lote</Typography>
        <TextField
          fullWidth
          label="Nome do Lote"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ mt: 2, bgcolor: "rgb(42, 180, 234)" }}
        >
            Salvar
        </Button>
      </Box>
    </Modal>
  );
};
  
export default BatchNameModal;
  