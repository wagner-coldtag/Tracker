import { AppBar, Toolbar, Grid, Button, Container, Box, Typography, Card, CardContent, CardMedia, IconButton , useTheme, useMediaQuery } from "@mui/material";
import React, { useState } from "react";
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";
import { IoIosCloud, IoIosAlert } from "react-icons/io";
import { Link } from "react-router-dom"; 
import andes from "./andes.mp4";

const translations = {
  pt: {
    home: "Início",
    solutions: "Soluções",
    purpouse: "Propósito",
    team: "Equipe",
    contact: "Contato",
    followUs: "Siga-nos",
    hour: "Horário de atendimento: 9h às 18h",
    rights: "© 2025 ColdTag Solutions. Todos os direitos reservados.",

    heroTitle: "Transforme sua operação com a ColdTag!",
    heroSubtitle:
      "Soluções em IoT e Inteligência Artificial que reduzem perdas, aumentam a eficiência e garantem a segurança dos alimentos em todas as etapas da cadeia do frio.",

    solutionsTitle:
      "Tecnologia aplicada à segurança dos alimentos com eficiência comprovada.",
    solutionsText1:
      "Com a ColdTag, você tem acesso a um ecossistema completo de monitoramento e gestão da cadeia do frio.",
    solutionsText2:
      "Nossa tecnologia permite o acompanhamento em tempo real da temperatura e umidade dos produtos, com alertas automáticos, rastreabilidade e análises preditivas, através de um sistema inovador que integra IA e IoT às suas operações.",
    solutionsText3:
      "Tudo para tornar sua operação mais eficiente, segura e sustentável.",

    purposeTitle: "Ciência, tecnologia e propósito.",
    purposeText:
      "Nosso objetivo é transformar a cadeia do frio no Brasil e no mundo, promovendo soluções acessíveis, eficientes e sustentáveis.",

    missionTitle: "Missão:",
    missionText:
      "Promover a segurança dos alimentos com tecnologia de ponta, reduzindo custos, perdas e impactos ambientais através de soluções inovadoras e acessíveis.",

    visionTitle: "Visão:",
    visionText:
      "Ser referência global em tecnologia para a cadeia do frio, com foco em inovação e impacto positivo.",

    valuesTitle: "Valores:",
    valuesList: [
      "Inovação com propósito",
      "Compromisso com a ciência",
      "Sustentabilidade em primeiro lugar",
      "Ética, transparência e foco em resultados",
    ],

    teamText1:
      "A ColdTag é liderada por um time multidisciplinar de pesquisadores e profissionais com décadas de experiência em segurança dos alimentos, tecnologia e inovação.",
    teamText2: "Conheça quem está por trás das nossas soluções:",
  },

  en: {
    home: "Home",
    solutions: "Solutions",
    purpouse: "Purpose",
    team: "Team",
    contact: "Contact",
    followUs: "Follow us",
    hour: "Office hours: 9 a.m. to 6 p.m.",
    rights: "© 2025 ColdTag Solutions. All rights reserved.",

    heroTitle: "Transform your operation with ColdTag!",
    heroSubtitle:
      "IoT and Artificial Intelligence solutions that reduce losses, increase efficiency, and ensure food safety at every stage of the cold chain.",

    solutionsTitle:
      "Technology applied to food safety with proven efficiency.",
    solutionsText1:
      "With ColdTag, you gain access to a complete ecosystem for monitoring and managing the cold chain.",
    solutionsText2:
      "Our technology enables real-time monitoring of temperature and humidity, with automatic alerts, traceability, and predictive analytics through an innovative system that integrates AI and IoT into your operations.",
    solutionsText3:
      "Everything to make your operation more efficient, safe, and sustainable.",

    purposeTitle: "Science, technology, and purpose.",
    purposeText:
      "Our goal is to transform the cold chain in Brazil and worldwide, promoting accessible, efficient, and sustainable solutions.",

    missionTitle: "Mission:",
    missionText:
      "Promote food safety with cutting-edge technology, reducing costs, losses, and environmental impacts through innovative and accessible solutions.",

    visionTitle: "Vision:",
    visionText:
      "To be a global reference in cold chain technology, focused on innovation and positive impact.",

    valuesTitle: "Values:",
    valuesList: [
      "Innovation with purpose",
      "Commitment to science",
      "Sustainability first",
      "Ethics, transparency, and focus on results",
    ],

    teamText1:
      "ColdTag is led by a multidisciplinary team of researchers and professionals with decades of experience in food safety, technology, and innovation.",
    teamText2: "Meet the people behind our solutions:",
  },
};

const sections = [
  { id: "home" },
  { id: "solutions" },
  { id: "purpouse" },
  { id: "team" },
  { id: "contact" },
];



const scrollToSection = (id) => {
  const element = document.getElementById(id);
  const offset = 70; // Adjust for AppBar height
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
};

const LandPage = () => {
  const theme = useTheme();
  const [language, setLanguage] = useState("pt");
  const t = translations[language];
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));  
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
          width: "100vw", // ensures full screen width
          zIndex: 1300,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Logo */}
          <Box sx={{ flexGrow: 1 }}>
            <img src="/conteudos/LOGO(RECTANGLE)_DESKTOP.png" alt="Coldtag Logo" style={{ height: 40 }} />
          </Box>

          {/* Right-side controls */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* Show menu only on medium and up */}
            {!isSmallScreen &&
            sections.map((section) => (
              <Button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  color: "#333",
                  fontSize: "0.95rem",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    color: "#1976d2",
                    borderRadius: "8px",
                  },
                  px: 2,
                }}
              >
                {t[section.id]}
              </Button>
            ))}

            {/* Language toggle */}
            <IconButton
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              sx={{ fontSize: "1.25rem" }}
            >
              {language === "pt" ? "🇺🇸" : "🇧🇷"}
            </IconButton>

            {/* Login */}
            <Button
              component={Link}
              to="/auth"
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#125ea4",
                  transform: "scale(1.05)",
                },
                ml: 1,
              }}
            >
            Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Toolbar /> {/* Spacer to avoid content being hidden behind AppBar */}
      
      <Container maxWidth={false} disableGutters>

        <Box
          id="home"
          sx={{
            minHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgb(25,180,248)",
            px: "clamp(30px, calc(30px + (268 * ((100vw - 600px) / 600))), 288px)",
            py: { xs: 4, sm: 4, md: 7 }, // reduce vertical padding on md+
          }}
        >
          <Grid
            container
            spacing={{ xs: 0.5, sm: 0.5, md: 0.5 }} // closer spacing on wide screens
            alignItems="center"
            justifyContent="center"
            maxWidth="lg"
            direction="row"
          >
            {/* Text */}
            <Grid item xs={6} md={6}>
              <Box sx={{ px: { xs: 0, md: 1 } }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    color: "#fff",
                    mb: 2,
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.45rem" },
                    textAlign:"left",
                  }}
                >
        Transforme sua operação com a ColdTag!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#fff",
                    fontSize: "0.9rem",
                    lineHeight: 1.3,
                    mb: 2,

                    textAlign: "left" ,
                  }}
                >
        Soluções em IoT e Inteligência Artificial que reduzem perdas, aumentam a eficiência e garantem a segurança dos alimentos em todas as etapas da cadeia do frio.
                </Typography>
              </Box>
            </Grid>

            {/* Image */}
            <Grid item xs={6} md={6} sx={{
              textAlign: "left",
            }}>              <Box
                component="img"
                src="/conteudos/ASSET-HERO_DESKTOP.png"
                alt="ColdTag"
                sx={{
                  width: "100%", // fill container width
                  maxWidth: "clamp(150px, 50vw, 400px)", // but clamp size between min and max
                  boxShadow: 0,
                  display: "block",
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box id="solutions" sx={{ py: 8, backgroundColor: "#f4f6f8" }}>
          <Container maxWidth="sm">
            <Typography
              variant="h2"
              align="center"
              fontWeight="bold"
              sx={{ color: "rgb(25,180,248)", mb: 1, fontSize: { xs: "1.5rem", md: "2rem" }
              }}

            >
      Tecnologia aplicada à segurança dos alimentos com eficiência comprovada.
            </Typography>

            <Typography
              variant="body1"
              align="center"
              color="rgb(48,157,250)"
              sx={{ mb: 1 }}
            >
      Com a ColdTag, você tem acesso a um ecossistema completo de monitoramento
      e gestão da cadeia do frio.
            </Typography>

            <Typography
              variant="body1"
              align="center"
              color="rgb(48,157,250)"
              sx={{ mb: 1 }}
            >
      Nossa tecnologia permite o acompanhamento em tempo real da temperatura e
      umidade dos produtos, com alertas automáticos, rastreabilidade e análises
      preditivas, através de um sistema inovador que integra IA e IoT às suas
      operações.
            </Typography>

            <Typography
              variant="body1"
              align="center"
              color="rgb(48,157,250)"
            >
      Tudo para tornar sua operação mais eficiente, segura e sustentável.
            </Typography>
            <Grid container spacing={4} justifyContent="center" sx={{ mt: 1 }}>
              {[
                {
                  text: "Inteligência Artificial aplicada à segurança dos alimentos",
                  icon:  "/conteudos/THUMB-AI_DESKTOP.png", // Placeholder
                },
                {
                  text: "Monitoramento em tempo real com sensores IoT",
                  icon:  "/conteudos/THUMB-IOT_DESKTOP.png", // Placeholder
                },
                {
                  text: "Dados e análises que orientam decisões estratégicas",
                  icon:  "/conteudos/THUMB-ANALISE_DESKTOP.png", // Placeholder
                },
                {
                  text: "Conformidade com normas regulatórias",
                  icon:  "/conteudos/THUMB-RULES_DESKTOP.png", // Placeholder
                },
                {
                  text: "Redução de desperdício e impacto ambiental",
                  icon:  "/conteudos/THUMB-COSTS_DESKTOP.png", // Placeholder
                },
                {
                  text: "Redução de custos operacionais",
                  icon:  "/conteudos/THUMB-ECO_DESKTOP.png", // Placeholder
                },
              ].map(({ icon, text }, index) => (
                <Grid item xs={4} sm={4} md={4} key={index}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <Box
                      component="img"
                      src={icon}
                      alt={`icon-${index}`}
                      sx={{ width: 90, height: 90,borderRadius: "12px" }}
                    />
                    <Typography variant="body1" fontWeight="bold" sx={{ mt: 2, maxWidth: 250, color: "rgb(10,148,237)", fontSize: "0.78rem",lineHeight: 1.2 }}>
                      {text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
        <Box
          id="purpouse"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgb(25,180,248)",
            px: { xs: 2, md: 6 },
            py: { xs: 5, md: 7 },
          }}
        >
          <Container maxWidth={false} style={{ maxWidth: 750 }}>
            <Box
              sx={{
                border: "2px solid rgba(255,255,255)",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              {/* Parte superior: Título e Propósito */}
              <Box
                sx={{
                  color: "rgb(255,255,255)",
                  pt: { xs: 4, md: 6 },
                  pr: { xs: 4, md: 6 },
                  pb: 2, // no bottom padding
                  pl: { xs: 4, md: 6 },
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h1"
                  fontWeight="bold"
                  sx={{ mb: 2, fontSize: {
                    xs: "1.5rem", // smaller on small screens
                    sm: "2rem", // smaller on small screens

                    md: "2.5rem", // bigger on medium and up
                  } ,}}
     
                >
          Ciência, tecnologia e propósito.
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 700, margin: "0 auto" , fontSize: {
                  xs: "1.rem", // smaller on small screens
                  sm: "1rem", // smaller on small screens

                  md: "1.1rem", // bigger on medium and up
                },}}>
          Nosso objetivo é transformar a cadeia do frio no Brasil e no mundo,
          promovendo soluções acessíveis, eficientes e sustentáveis.
                </Typography>
              </Box>

              {/* Parte inferior: Missão, Visão, Valores */}
              <Box
                sx={{
                  backgroundColor: "rgb(25,180,248)",
                  color: "rgb(255,255,255)",
                  pt: 0, // top padding zero
                  pr: { xs: 4, md: 6 },
                  pb: { xs: 4, md: 6 },
                  pl: { xs: 4, md: 6 },
                }}
              >                <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ mb: 2, fontSize: {
                  xs: "1.5rem", // smaller on small screens
                  sm: "1.75rem", // smaller on small screens

                  md: "2rem", // bigger on medium and up
                } ,}}>
          Missão:
                </Typography>
                <Typography variant="body1" paragraph sx={{fontSize: {
                  xs: "0.8rem", // smaller on small screens
                  sm: "1rem", // smaller on small screens

                  md: "1.1rem", // bigger on medium and up
                } ,}}>
          Promover a segurança dos alimentos com tecnologia de ponta, reduzindo
          custos, perdas e impactos ambientais através de soluções inovadoras e acessíveis.
                </Typography>

                <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ mb: 2, fontSize: {
                  xs: "1.5rem", // smaller on small screens
                  sm: "1.75rem", // smaller on small screens

                  md: "2rem", // bigger on medium and up
                } ,}}>          Visão:
                </Typography>
                <Typography variant="body1" paragraph sx={{fontSize: {
                  xs: "0.8rem", // smaller on small screens
                  sm: "1rem", // smaller on small screens

                  md: "1.1rem", // bigger on medium and up
                } ,}}>          Ser referência global em tecnologia para a cadeia do frio, com foco em inovação e
          impacto positivo.
                </Typography>

                <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ mb: 2, fontSize: {
                  xs: "1.5rem", // smaller on small screens
                  sm: "1.75rem", // smaller on small screens

                  md: "2rem", // bigger on medium and up
                } ,}}>          Valores:
                </Typography>
                <ul style={{ paddingLeft: "1.5rem", color: "rgb(255,255,255)", marginTop: 0 }}>
                  <Box
                    component="li"
                    sx={{
                      mb: 1,
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.10rem",
                      },
                    }}
                  >
  Inovação com propósito
                  </Box>
                  <Box
                    component="li"
                    sx={{
                      mb: 1,
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.10rem",
                      },
                    }}
                  >
Compromisso com a ciência                  </Box>
                  <Box
                    component="li"
                    sx={{
                      mb: 1,
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.10rem",
                      },
                    }}
                  >
Sustentabilidade em primeiro lugar                  </Box>
                  <Box
                    component="li"
                    sx={{
                      mb: 1,
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.10rem",
                      },
                    }}
                  >
Ética, transparência e foco em resultados                  </Box>
                </ul>
              </Box>
              <Box
                sx={{
                  height: "2px",
                  backgroundColor: "white",
                  width: "1200px",
                  margin: "24px auto",
                }}
              />
              <Box
                id="team"

                sx={{
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "rgb(25,180,248)",
                  py: { xs: 4, md: 3 },
                  px: { xs: 2, md: 6 },
                }}
              >
                <Container maxWidth="md">
                  <Grid container spacing={4}>


                    <Grid item xs={12} md={11}>
                      <Typography
                        variant="body1"
                        sx={{
                          maxWidth: 700,
                          margin: "0 auto",
                          fontSize: "1.4rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          lineHeight: 1.2, // 👈 this controls the spacing

                          color: "#fff", // ou mantenha se for sobre fundo azul
                        }}
                      >
  A ColdTag é liderada por um time multidisciplinar de pesquisadores e
  profissionais com décadas de experiência em segurança dos alimentos,
  tecnologia e inovação.
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "1.3rem",
                          color: "#fff", // ajuste se o fundo for escuro
                          textAlign: "center",
                          mt: 3,
                        }}
                      >
  Conheça quem está por trás das nossas soluções:
                      </Typography>
                      <Grid container spacing={4} justifyContent="center" sx={{ mt: 0 }}>
                        {[
                          "/conteudos/Prof. Dr. Sandro.png",
                          "/conteudos/Prof. Dr. Suse.png",
                          "/conteudos/Dr. Wagner.png",

                        ].map((photo, index) => (
                          <Grid item xs={12} sm={4} md={4} key={index}>
                            <Box sx={{ textAlign: "center" }}>

                              <Box
                                component="img"
                                src={photo}
                                alt={`Membro ${index + 1}`}
                                sx={{
                                  width: {
                                    xs: "80%",
                                    sm: "120%",
                                    md: "120%",
                                  },
                                  mx: "auto", // centers the image horizontally
                                  height: "auto",
                                  borderRadius: "16px",
                                  transition: "0.3s",
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>


                    </Grid>
                  </Grid>
                </Container>
              </Box>
            </Box>
          </Container>
        </Box>
        <Box id="contact" sx={{ width: "100%", maxWidth: "100vw", paddingTop: "10px", pt: 5, pr:5, pl:5, pb:0, minHeight: "40vh", backgroundColor: "rgb(26,180,245)" }}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4} lg={4}>
              <Typography variant="h4" color="white" gutterBottom>Coldtag Solutions</Typography>
              <Typography variant="h5" color="white">Sala 221 Unitec 2</Typography>
              <Typography variant="h5" color="white">Av. Theodomiro Porto da Fonseca, 3397</Typography>
              <Typography variant="h5" color="white">Bairro Cristo Rei, CEP 93022-715 </Typography>
              <Typography variant="h5" color="white">São Leopoldo, RS</Typography>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <Typography variant="h4" color="white" gutterBottom>{t.contact}</Typography>
              <Typography variant="h5" color="white">coldtag@coltagsolutions.com</Typography>
              <Typography variant="h5" color="white">{t.hour}</Typography>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <Typography variant="h4" color="white" gutterBottom>{t.followUs}</Typography>
              <Box
                sx={{
                  position: "relative",
                  zIndex: 3500,
                  color: "white", // white icons
                  fontSize: "2rem",
                  cursor: "pointer",
                  display: "flex",
                  gap: 2, // space between icons
                }}
              >
                <a
                  href="https://www.linkedin.com/company/coldtag-solutions/?originalSubdomain=br"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61576303142767"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <FaFacebook />
                </a>
                <a
                  href="https://www.instagram.com/coldtagsolutions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <FaInstagram />
                </a>
              </Box>    
            </Grid>
          </Grid>
          <Typography variant="body2" color="white" sx={{ mt: 3, textAlign: "center" }}>{t.rights}</Typography>
          <Box
            sx={{
              width: "100vw",
              position: "relative",
              left: "50%",
              right: "50%",
              marginLeft: "-50vw",
              marginRight: "-50vw",
              paddingTop: "-100",
              zIndex: 1000, // default or lower than LinkedIn icon

              mt: {
                xs: -15, // smaller negative margin on xs
                sm: -23, // medium negative margin on sm
                md: -30 // original margin on md and up
              } }}
          >
            <Box
              component="img"
              src="/conteudos/BKG_DESKTOP.png"
              alt="Andes"
              sx={{
                width: "100%",
                display: "block",

              }}
            />
          </Box>
        </Box>

      </Container>

    </>
  );
};

export default LandPage;