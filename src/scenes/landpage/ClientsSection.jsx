import { Box, Typography, Grid } from "@mui/material";
import React from "react";
import {
  TbTruck,
  TbBuildingStore,
  TbBuildingFactory2,
  TbShoppingCart,
  TbSnowflake,
  TbBuildingHospital,
  TbPill,
  TbMicroscope,
  TbVaccine,
} from "react-icons/tb";
import { BRAND_BLUE, BRAND_BLUE_DEEP, BRAND_DARK, BRAND_LIGHT_BG } from "./brand";

const content = {
  pt: {
    title: "Setores que atendemos",
    description:
      "Atendemos operações que não podem errar no controle de temperatura, com soluções personalizadas de monitoramento e rastreabilidade.",
    groupIndustryLabel: "Alimentos & Logística",
    groupHealthLabel: "Saúde",
    industry: [
      { icon: TbTruck, title: "Distribuidores Logísticos", description: "Rotas e cargas com temperatura monitorada de ponta a ponta." },
      { icon: TbBuildingStore, title: "Varejistas/Redes de Supermecado", description: "Controle de temperatura em todas as unidades e no estoque." },
      { icon: TbBuildingFactory2, title: "Indústria de Alimentos", description: "Produção e armazenagem sempre dentro das faixas ideais." },
      { icon: TbSnowflake, title: "Centros Refrigerados", description: "Câmaras frias e armazéns monitorados 24 horas por dia." },
    ],
    health: [
      { icon: TbBuildingHospital, title: "Hospitais e Clínicas", description: "Medicamentos e insumos sempre dentro da faixa segura." },
      { icon: TbPill, title: "Indústria Farmacêutica", description: "Da fabricação à distribuição, com rastreabilidade completa." },
      { icon: TbMicroscope, title: "Laboratórios e Bancos de Sangue", description: "Amostras e hemoderivados sob monitoramento contínuo." },
      { icon: TbVaccine, title: "Distribuição de Vacinas", description: "Cadeia de frio íntegra do fabricante até a aplicação." },
    ],
  },
  en: {
    title: "Sectors we serve",
    description:
      "We serve operations that can't afford a temperature mistake — from food production to healthcare — with tailored monitoring and traceability solutions.",
    groupIndustryLabel: "Food & Logistics",
    groupHealthLabel: "Healthcare",
    industry: [
      { icon: TbTruck, title: "Logistics Distributors", description: "Routes and cargo monitored end to end." },
      { icon: TbBuildingStore, title: "Retailers", description: "Temperature control across stores and stockrooms." },
      { icon: TbBuildingFactory2, title: "Food Industry", description: "Production and storage within ideal ranges." },
      { icon: TbShoppingCart, title: "Supermarket Chains", description: "Centralized visibility across multiple sites." },
      { icon: TbSnowflake, title: "Refrigerated Centers", description: "Cold rooms and warehouses monitored around the clock." },
    ],
    health: [
      { icon: TbBuildingHospital, title: "Hospitals & Clinics", description: "Medications and supplies always within safe range." },
      { icon: TbPill, title: "Pharmaceutical Industry", description: "From manufacturing to distribution, fully traceable." },
      { icon: TbMicroscope, title: "Labs & Blood Banks", description: "Samples and blood products under continuous watch." },
      { icon: TbVaccine, title: "Vaccine Distribution", description: "An unbroken cold chain from manufacturer to patient." },
    ],
  },
};

const SegmentCard = ({ icon: Icon, title, description, accent }) => (
  <Box
    sx={{
      height: "100%",
      p: 3,
      borderRadius: 2,
      border: "1px solid rgba(10,37,64,0.08)",
      bgcolor: "white",
      transition: "border-color 0.2s ease, transform 0.2s ease",
      "&:hover": { borderColor: accent, transform: "translateY(-3px)" },
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${accent}1A`,
        mb: 2,
      }}
    >
      <Icon size={20} color={accent} />
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BRAND_DARK, mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: "#5b6675", fontSize: "0.9rem", lineHeight: 1.5 }}>
      {description}
    </Typography>
  </Box>
);

const SegmentGroup = ({ label, segments, accent }) => (
  <Box sx={{ mb: { xs: 5, md: 6 }, "&:last-of-type": { mb: 0 } }}>
    <Typography sx={{ fontWeight: 700, color: accent, mb: 2, fontSize: "1.05rem" }}>{label}</Typography>
    <Grid container spacing={2.5}>
      {segments.map((segment, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <SegmentCard {...segment} accent={accent} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const ClientsSection = ({ language }) => {
  const t = content[language === "en" ? "en" : "pt"];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, px: { xs: 3, md: 10 }, bgcolor: BRAND_LIGHT_BG }}>
      <Box sx={{ maxWidth: 680, mx: "auto", textAlign: "center", mb: { xs: 6, md: 7 } }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: BRAND_DARK, fontSize: { xs: "1.8rem", sm: "2.1rem" } }}
        >
          {t.title}
        </Typography>
        <Typography variant="body1" sx={{ color: "#374151", fontSize: { xs: "0.95rem", sm: "1.05rem" }, lineHeight: 1.6 }}>
          {t.description}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1160, mx: "auto" }}>
        <SegmentGroup label={t.groupIndustryLabel} segments={t.industry} accent={BRAND_BLUE} />
        <SegmentGroup label={t.groupHealthLabel} segments={t.health} accent={BRAND_BLUE_DEEP} />
      </Box>
    </Box>
  );
};

export default ClientsSection;
