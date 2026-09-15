import { Box, Typography, Grid } from "@mui/material";
import React from "react";
import {
  TbThermometer,
  TbRoute,
  TbBellRinging,
  TbReportMedical,
  TbSitemap,
  TbHistory,
} from "react-icons/tb";
import { BRAND_BLUE, BRAND_DARK, BRAND_GRADIENT, BRAND_GRADIENT_HOVER } from "./brand";

const content = {
  pt: {
    title: "Segurança e compliance para a cadeia da saúde",
    description:
      "A mesma tecnologia que protege alimentos sensíveis à temperatura também protege vacinas, medicamentos, hemoderivados e amostras biológicas.",
    cta: "Falar com um especialista",
    items: [
      { icon: TbThermometer, title: "Faixas configuráveis por produto", description: "Perfis de temperatura específicos para imunobiológicos e termolábeis." },
      { icon: TbRoute, title: "Rastreabilidade ponta a ponta", description: "Histórico completo de temperatura e localização, do fabricante ao hospital ou farmácia." },
      { icon: TbBellRinging, title: "Alertas", description: "Notificações multicanal em caso de desvio, para agir antes que um lote seja perdido." },
      { icon: TbReportMedical, title: "Relatórios prontos para auditoria", description: "Dados organizados e exportáveis para vistorias e processos de compliance." },
      { icon: TbSitemap, title: "Gestão multiunidade", description: "Hospitais, clínicas, laboratórios e centros de distribuição em um único painel." },
      { icon: TbHistory, title: "Histórico para investigação", description: "Dados detalhados para apurar causas de não conformidades e evitar recorrência." },
    ],
  },
  en: {
    title: "Safety and compliance for the healthcare cold chain",
    description:
      "The same technology that protects temperature-sensitive food also protects vaccines, medications, blood products, and biological samples.",
    cta: "Talk to a specialist",
    items: [
      { icon: TbThermometer, title: "Configurable ranges per product", description: "Specific temperature profiles for biologics and cold-sensitive drugs." },
      { icon: TbRoute, title: "End-to-end traceability", description: "Complete temperature and location history, from manufacturer to hospital or pharmacy." },
      { icon: TbBellRinging, title: "Alerts", description: "Multichannel notifications on deviation, so you can act before a batch is lost." },
      { icon: TbReportMedical, title: "Audit-ready reports", description: "Organized, exportable data for inspections and compliance processes." },
      { icon: TbSitemap, title: "Multi-site management", description: "Hospitals, clinics, labs, and distribution centers in a single dashboard." },
      { icon: TbHistory, title: "Investigation history", description: "Detailed data to help determine the root cause of non-conformities." },
    ],
  },
};

const HealthcareSection = ({ language }) => {
  const t = content[language === "en" ? "en" : "pt"];

  return (
    <Box component="section" sx={{ bgcolor: BRAND_DARK, color: "white", py: { xs: 8, md: 10 }, px: { xs: 3, md: 10 } }}>
      <Grid container spacing={{ xs: 5, md: 8 }} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Grid item xs={12} md={5}>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700, fontSize: { xs: "1.8rem", sm: "2.1rem" }, mb: 2.5 }}>
            {t.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: "0.95rem", sm: "1.05rem" }, lineHeight: 1.65, mb: 4, maxWidth: 440 }}
          >
            {t.description}
          </Typography>

          <Box
            component="a"
            href="#contact"
            sx={{
              display: "inline-block",
              background: BRAND_GRADIENT,
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              textTransform: "none",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "0.95rem",
              px: 3.5,
              py: 1.2,
              cursor: "pointer",
              fontFamily: "inherit",
              "&:hover": { background: BRAND_GRADIENT_HOVER },
            }}
          >
            {t.cta}
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box>
            {t.items.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  gap: 2.5,
                  alignItems: "flex-start",
                  py: 2.5,
                  borderBottom: idx < t.items.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "rgba(27,181,247,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <item.icon size={19} color={BRAND_BLUE} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthcareSection;
