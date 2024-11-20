// DashboardStyles.js
const dashboardStyles = (colors) => ({
  button: (isSelected) => ({
    marginRight: "10px",
    color: isSelected ? "rgb(42, 180, 234)" : colors.grey[100],
    backgroundColor: colors.primary[400],
    border: "0.5px solid",
    borderColor: isSelected ? "rgb(42, 180, 234)" : colors.grey[100],
    fontWeight: isSelected ? 600 : "normal",
    "&:hover": {
      backgroundColor: colors.primary[900],
      color: colors.grey[300],
      border: "0.5px solid",

    },
    width: "175px",
    height: "30px",
  }),
  iconButton: {
    backgroundColor: colors.primary,
    color:  "rgb(42, 180, 234)",
    "&:hover": {
      backgroundColor: colors.grey[900],
    },
    marginRight: "10px",
  },
  downloadButton: {
    backgroundColor: colors.blueAccent[700],
    color: colors.grey[100],
    fontSize: "14px",
    fontWeight: "bold",
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    "&:hover": {
      backgroundColor: colors.blueAccent[800],
    },
  },
});

export default dashboardStyles;
