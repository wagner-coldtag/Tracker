import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import React from "react";

const potentialClientsPT = [
  { label: "Distribuidores Logísticos", imgSrc: "/conteudos/clientes/distribuidores.jpg" },
  { label: "Varejistas", imgSrc: "/conteudos/clientes/varejistas.jpg" },
  { label: "Indústria de Alimentos", imgSrc: "/conteudos/clientes/industria.jpg" },
  { label: "Redes de Supermercado", imgSrc: "/conteudos/clientes/supermercado.jpg" },
  { label: "Centros Refrigerados", imgSrc: "/conteudos/clientes/refrigerado.jpg" },
];

const potentialClientsEN = [
  { label: "Logistics Distributors", imgSrc: "/conteudos/clientes/distribuidores.jpg" },
  { label: "Retailers", imgSrc: "/conteudos/clientes/varejistas.jpg" },
  { label: "Food Industry", imgSrc: "/conteudos/clientes/industria.jpg" },
  { label: "Supermarket Chains", imgSrc: "/conteudos/clientes/supermercado.jpg" },
  { label: "Refrigerated Centers", imgSrc: "/conteudos/clientes/refrigerado.jpg" },
];

const CARD_WIDTH = 200;
const VISIBLE_WIDTH = 470;
const PANEL_HEIGHT_LG = 400;
const PANEL_HEIGHT_SM = 250;

const RotatingClientsPanel = ({ language }) => {
  const clients = language === "en" ? potentialClientsEN : potentialClientsPT;
  const containerRef = React.useRef(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [offsetX, setOffsetX] = React.useState(0);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const panelHeight = isSmallScreen ? PANEL_HEIGHT_SM : PANEL_HEIGHT_LG;

  React.useEffect(() => {
    let animationFrameId;
    let lastTimestamp = performance.now();

    const step = (timestamp) => {
      if (!isPaused) {
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        setOffsetX((prev) => {
          const newOffset = prev + elapsed * 0.05;
          const totalWidth = CARD_WIDTH * clients.length;
          return newOffset >= totalWidth ? 0 : newOffset;
        });
      } else {
        lastTimestamp = timestamp;
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, clients]);

  const totalWidth = CARD_WIDTH * clients.length;

  return (
    <Box
      sx={{
        width: VISIBLE_WIDTH,
        height: panelHeight,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
        flexShrink: 0,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      <Box
        sx={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: totalWidth * 2,
          transform: `translateX(${-offsetX}px)`,
        }}
      >
        {[...clients, ...clients].map((client, idx) => (
          <Box
            key={idx}
            sx={{
              minWidth: CARD_WIDTH,
              height: "100%",
              mr: 2,
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 6px 10px rgba(0,0,0,0.15)",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={client.imgSrc}
              alt={client.label}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                bgcolor: "rgba(0,0,0,0.55)",
                color: "white",
                textAlign: "center",
                py: 1.2,
                fontWeight: "bold",
                fontSize: "1.1rem",
                letterSpacing: 0.5,
                userSelect: "none",
              }}
            >
              {client.label}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ClientsSection = ({ language }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const title = language === "en" ? "Who We Deliver Value To" : "Para Quem Entregamos Valor";
  const description =
    language === "en"
      ? "We serve several strategic sectors with customized and efficient solutions to ensure quality, traceability, and sustainability throughout the chain."
      : "Atendemos diversos segmentos estratégicos com soluções personalizadas e eficientes para garantir qualidade, rastreabilidade e sustentabilidade em toda a cadeia.";

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 3, md: 10 },
        py: 8,
        bgcolor: "#f7f9fc",
        gap: 6,
      }}
    >
      <Box
        sx={{
          flex: { xs: "unset", md: 0.8 },
          maxWidth: { xs: "100%", md: 460 },
        }}
      >
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: "rgb(27, 181, 247)",
            fontSize: { xs: "1.8rem", sm: "2rem" },
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#374151",
            fontSize: { xs: "0.95rem", sm: "1rem", md: "1.rem" },
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: { xs: "unset", md: 1.2 },
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
          width: "100%",
        }}
      >
        <RotatingClientsPanel language={language} />
      </Box>
    </Box>
  );
};

export default ClientsSection;
