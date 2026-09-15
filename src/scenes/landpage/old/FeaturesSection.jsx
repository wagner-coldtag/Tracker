import {
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import {
  FaThermometerHalf,
  FaCubes,
  FaBell,
  FaShieldAlt,
  FaChartLine,
  FaClock,
} from "react-icons/fa";

const featuresPT = [
  {
    icon: <FaThermometerHalf size={28} color="rgb(27, 181, 247)" />,
    title: "Monitoramento",
    description: "Acompanhe a temperatura em tempo real, 24/7.",
  },
  {
    icon: <FaCubes size={28} color="rgb(27, 181, 247)" />,
    title: "Gestão Inteligente",
    description: "Gerencie com precisão e visibilidade total.",
  },
  {
    icon: <FaBell size={28} color="rgb(27, 181, 247)" />,
    title: "Alertas",
    description: "Notificações instantâneas em caso de inconformidades.",
  },
  {
    icon: <FaShieldAlt size={28} color="rgb(27, 181, 247)" />,
    title: "Qualidade e Segurança",
    description: "Reduza riscos e garanta qualidade dos produtos.",
  },
  {
    icon: <FaChartLine size={28} color="rgb(27, 181, 247)" />,
    title: "Eficiência Operacional",
    description: "Decisões baseadas em dados.",
  },
  {
    icon: <FaClock size={28} color="rgb(27, 181, 247)" />,
    title: "Shelf Life em Tempo Real",
    description: "Preveja a vida útil de cada lote com IA.",
  },
];

const featuresEN = [
  {
    icon: <FaThermometerHalf size={28} color="rgb(27, 181, 247)" />,
    title: "Monitoring",
    description: "Track temperature in real time, 24/7.",
  },
  {
    icon: <FaCubes size={28} color="rgb(27, 181, 247)" />,
    title: "Smart Management",
    description: "Manage with precision and total visibility.",
  },
  {
    icon: <FaBell size={28} color="rgb(27, 181, 247)" />,
    title: "Alerts",
    description: "Instant notifications for non-conformities.",
  },
  {
    icon: <FaShieldAlt size={28} color="rgb(27, 181, 247)" />,
    title: "Quality & Safety",
    description: "Reduce risks and ensure product quality.",
  },
  {
    icon: <FaChartLine size={28} color="rgb(27, 181, 247)" />,
    title: "Operational Efficiency",
    description: "Data-driven decision-making.",
  },
  {
    icon: <FaClock size={28} color="rgb(27, 181, 247)" />,
    title: "Real-Time Shelf Life",
    description: "Predict each batch’s lifespan with AI.",
  },
];

const FeaturesSection = ({ language }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const features = language === "en" ? featuresEN : featuresPT;

  return (
    <Box component="section" sx={{ py: 0 }}>
      <Grid container spacing={6} alignItems="center">
        {/* Left image */}
        <Grid
          item
          xs={12}
          sm={5}
          md={5}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Box
            component="img"
            src="/conteudos/clientes/nova.jpg"
            alt={language === "en" ? "Monitored environment" : "Ambiente monitorado"}
            sx={{
              width: "100%",
              minHeight: 735,
              objectFit: "cover",
              display: { xs: "none", md: "block" },
              borderRadius: 0,
              boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
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
              mt: isSmall ? 7 : 4,
              color: "#0e263b",
              textAlign: isSmall ? "center" : "left",
            }}
          >
            {language === "en"
              ? "Everything your operation needs. In real time."
              : "Tudo que sua operação precisa. Em tempo real."}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#374151",
              fontSize: { xs: "1rem", sm: "1.125rem" },
              maxWidth: 700,
              mb: 4,
              textAlign: isSmall ? "center" : "left",
              mx: isSmall ? "auto" : "0",
            }}
          >
            {language === "en"
              ? "With our technology, you monitor, manage, anticipate and ensure quality at every stage of the cold chain."
              : "Com nossa tecnologia, você monitora, gerencia, antecipa e garante qualidade em cada etapa da cadeia do frio."}
          </Typography>

          <Grid
            container
            spacing={1}
            sx={{
              pr: { xs: 2, md: 0 },
              pl: { xs: 2, md: 0 },
            }}
          >
            {features.map((feature, idx) => (
              <Grid item xs={6} sm={4} md={4} key={idx}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 3,
                    boxShadow: "0px 6px 16px rgba(0,0,0,0.06)",
                    height: "100%",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 700, color: "#0e263b", mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#4b5563", fontSize: "0.95rem" }}
                  >
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
