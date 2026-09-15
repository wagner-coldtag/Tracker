import { Box, Typography, Grid, useTheme, useMediaQuery } from "@mui/material";
import React from "react";
import {
  TbThermometer,
  TbPackage,
  TbBell,
  TbShieldCheck,
  TbTrendingUp,
  TbClockHour4,
  TbClipboardCheck,
  TbBroadcast,
} from "react-icons/tb";
import { BRAND_BLUE, BRAND_DARK, BRAND_BADGE_BG } from "./brand";

const featuresPT = [
  { icon: TbThermometer, title: "Monitoramento", description: "Acompanhe a temperatura em tempo real, 24/7." },
  { icon: TbPackage, title: "Gestão", description: "Gerencie com precisão e visibilidade total." },
  { icon: TbBell, title: "Alertas", description: "Notificações instantâneas em caso de inconformidades." },
  { icon: TbShieldCheck, title: "Segurança", description: "Reduza riscos e garanta qualidade dos produtos." },
  { icon: TbTrendingUp, title: "Eficiência", description: "Decisões baseadas em dados." },
  { icon: TbClockHour4, title: "Shelf Life", description: "Preveja a vida útil de cada lote com IA." },
  { icon: TbClipboardCheck, title: "Rastreabilidade", description: "Relatórios auditáveis e histórico completo para inspeções." },
  { icon: TbBroadcast, title: "Alertas", description: "Notificações multicanal para operações onde cada grau importa." },
];

const featuresEN = [
  { icon: TbThermometer, title: "Monitoring", description: "Track temperature in real time, 24/7." },
  { icon: TbPackage, title: "Management", description: "Manage with precision and total visibility." },
  { icon: TbBell, title: "Alerts", description: "Instant notifications for non-conformities." },
  { icon: TbShieldCheck, title: "Safety", description: "Reduce risks and ensure product quality." },
  { icon: TbTrendingUp, title: "Eficiência", description: "Decisões baseadas em dados." },
  { icon: TbClockHour4, title: "Shelf Life", description: "Preveja a vida útil de cada lote com IA." },
  { icon: TbClipboardCheck, title: "Rastreabilidade", description: "Relatórios auditáveis e histórico completo para inspeções." },
  { icon: TbBroadcast, title: "Alertas", description: "Notificações multicanal para operações onde cada grau importa." },
];

const FeaturesSection = ({ language }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const features = language === "en" ? featuresEN : featuresPT;

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, px: { xs: 3, md: 10 }, bgcolor: "white" }}>
      <Grid container spacing={{ xs: 0, md: 6 }} alignItems="center" sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Left image */}
        <Grid item xs={12} sm={5} md={5} sx={{ display: { xs: "none", md: "block" } }}>
          <Box
            component="img"
            src="/conteudos/clientes/nova.jpg"
            alt={language === "en" ? "Monitored environment" : "Ambiente monitorado"}
            sx={{
              width: "100%",
              minHeight: 650,
              objectFit: "cover",
              display: { xs: "none", md: "block" },
              borderRadius: 4,
              boxShadow: "0 20px 50px rgba(10,37,64,0.15)",
            }}
          />
        </Grid>

        {/* Text content and feature cards */}
        <Grid item xs={12} md={7}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              mb: 2,
              color: BRAND_DARK,
              textAlign: isSmall ? "center" : "left",
            }}
          >
            {language === "en" ? "One platform, every stage of the cold chain." : "Uma plataforma, cada etapa da cadeia do frio."}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#3d5166",
              fontSize: { xs: "1rem", sm: "1.125rem" },
              maxWidth: 700,
              mb: 4,
              textAlign: isSmall ? "center" : "left",
              mx: isSmall ? "auto" : "0",
            }}
          >
            {language === "en"
              ? "You monitor, manage, anticipate, and ensure quality at every stage of the cold chain."
              : "Você monitora, gerencia, antecipa e garante qualidade em cada etapa da cadeia do frio."}
          </Typography>

          <Grid container spacing={2} sx={{ pr: { xs: 2, md: 0 }, pl: { xs: 2, md: 0 } }}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 3,
                    border: "1px solid rgba(10,37,64,0.08)",
                    height: "100%",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: BRAND_BLUE,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: BRAND_BADGE_BG,
                      mb: 1.5,
                    }}
                  >
                    <feature.icon size={20} color={BRAND_BLUE} />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: BRAND_DARK, mb: 1, fontSize: "1rem" }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#3d5166", fontSize: "0.88rem" }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeaturesSection;
