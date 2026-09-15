import { Box, Typography, Grid } from "@mui/material";
import React from "react";
import { TbCpu, TbBrain, TbDeviceMobileMessage } from "react-icons/tb";
import { BRAND_BLUE, BRAND_DARK, BRAND_LIGHT_BG, BRAND_BADGE_BG } from "./brand";

const content = {
  pt: {
    title: "Como funciona",
    description:
      "Da coleta do dado à decisão, em três etapas: simples para operar e robusto para produtos que não podem falhar.",
    steps: [
      {
        icon: TbCpu,
        title: "Sensores conectados",
        description:
          "Dispositivos IoT capturam temperatura continuamente, em cada ponto da cadeia.",
      },
      {
        icon: TbBrain,
        title: "Inteligência artificial",
        description:
          "Algoritmos analisam os dados em tempo real e antecipam desvios antes que virem perda.",
      },
      {
        icon: TbDeviceMobileMessage,
        title: "Alertas e decisão",
        description:
          "Você recebe o alerta na hora certa, com o histórico e os relatórios prontos para agir.",
      },
    ],
  },
  en: {
    title: "How it works",
    description:
      "From raw data to decision, in three steps: simple to operate and robust for products that can't fail.",
    steps: [
      {
        icon: TbCpu,
        title: "Connected sensors",
        description:
          "IoT devices continuously capture temperature at every point in the chain.",
      },
      {
        icon: TbBrain,
        title: "Artificial intelligence",
        description:
          "Algorithms analyze the data in real time and anticipate deviations before they become a loss.",
      },
      {
        icon: TbDeviceMobileMessage,
        title: "Alerts and decisions",
        description:
          "You get the alert at the right time, with history and reports ready for you to act on.",
      },
    ],
  },
};

const HowItWorksSection = ({ language }) => {
  const t = content[language === "en" ? "en" : "pt"];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, px: { xs: 3, md: 10 }, bgcolor: BRAND_LIGHT_BG }}>
      <Box sx={{ maxWidth: 640, mx: "auto", textAlign: "center", mb: { xs: 6, md: 8 } }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: BRAND_DARK, fontSize: { xs: "1.8rem", sm: "2.1rem" } }}
        >
          {t.title}
        </Typography>
        <Typography variant="body1" sx={{ color: "#3d5166", fontSize: { xs: "0.95rem", sm: "1.05rem" }, lineHeight: 1.6 }}>
          {t.description}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto", position: "relative" }}>
        {/* Connecting line (desktop only) */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 28,
            left: "16.5%",
            right: "16.5%",
            height: 2,
            bgcolor: BRAND_BADGE_BG,
          }}
        />

        <Grid container spacing={{ xs: 6, md: 4 }}>
          {t.steps.map((step, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Box sx={{ textAlign: "center", position: "relative" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "white",
                    border: `2px solid ${BRAND_BADGE_BG}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <step.icon size={24} color={BRAND_BLUE} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: BRAND_BLUE,
                    mb: 1,
                    letterSpacing: 0.3,
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_DARK, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#3d5166", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 280, mx: "auto" }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
