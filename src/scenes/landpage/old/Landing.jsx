import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import ClientsSection from "./ClientsSection";
import FeaturesSection from "./FeaturesSection";

// ===== Translation dictionary =====
const translations = {
  pt: {
    home: "Home",
    features: "Funcionalidades",
    clients: "Clientes",
    contact: "Contato",
    login: "Entrar",
    heroTitle: "O futuro da indústria",
    heroDesc:
      "Soluções em IoT e Inteligência Artificial que reduzem perdas, aumentam a eficiência e garantem a segurança dos alimentos em todas as etapas do processo produtivo.",
    contactTitle: "Contato",
    followUs: "Nos siga",
    addressTitle: "Coldtag Solutions",
    address1: "Sala 221 Unitec 2",
    address2: "Av. Theodomiro Porto da Fonseca, 3397",
    address3: "Bairro Cristo Rei, CEP 93022-715",
    address4: "São Leopoldo, RS",
    email: "coldtag@coldtagsolutions.com",
    schedule: "Seg-Sex 9h-17h",
    words: [
      "transparente",
      "rastreável",
      "inteligente",
      "seguro",
      "eficiente",
      "sustentável",
      "agora!",
    ],
  },
  en: {
    home: "Home",
    features: "Features",
    clients: "Clients",
    contact: "Contact",
    login: "Login",
    heroTitle: "The future of industry",
    heroDesc:
      "IoT and Artificial Intelligence solutions that reduce losses, increase efficiency, and ensure food safety at every stage of the production process.",
    contactTitle: "Contact",
    followUs: "Follow us",
    addressTitle: "Coldtag Solutions",
    address1: "Room 221 Unitec 2",
    address2: "Av. Theodomiro Porto da Fonseca, 3397",
    address3: "Cristo Rei District, ZIP 93022-715",
    address4: "São Leopoldo, RS - Brazil",
    email: "coldtag@coldtagsolutions.com",
    schedule: "Mon-Fri 9AM-5PM",
    words: [
      "transparent",
      "traceable",
      "smart",
      "secure",
      "efficient",
      "sustainable",
      "now!",
    ],
  },
};

// ====== Typewriter effect hook ======
const useTypewriter = (wordList, typingSpeed = 120, pause = 1500) => {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = wordList[wordIndex];
    let timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayed((prev) => prev.slice(0, -1));
        if (displayed === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % wordList.length);
        }
      }, typingSpeed / 2);
    } else {
      timeout = setTimeout(() => {
        setDisplayed((prev) => current.slice(0, prev.length + 1));
        if (displayed === current) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex, wordList, typingSpeed, pause]);

  return displayed;
};

// ===== Navbar Component =====
const Navbar = ({ onChangeLanguage, language }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [showNavbar, setShowNavbar] = useState(true);
  const t = translations[language];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    const yOffset = -80; // adjust for navbar height
    const y =
      section.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById("contact");
      if (!contactSection) return;
      const contactTop = contactSection.getBoundingClientRect().top;
      setShowNavbar(contactTop > 80);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!showNavbar) return null;

  const linkStyle = {
    fontWeight: 600,
    color: "#0e263b",
    cursor: "pointer",
    textDecoration: "none",
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90vw",
        maxWidth: 1200,
        bgcolor: "rgba(255, 255, 255, 0.75)",
        borderRadius: 16,
        px: 4,
        py: 0.5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          flexGrow: 2,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => scrollToSection("hero")}
      >
        <img
          src="/conteudos/LOGO(RECTANGLE)_DESKTOP.png"
          alt="Coldtag Logo"
          style={{ height: 30, display: "block" }}
        />
      </Box>

      {/* Links */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        {!isSmallScreen && (
          <>
            <Box onClick={() => scrollToSection("hero")} sx={linkStyle}>
              {t.home}
            </Box>
            <Box onClick={() => scrollToSection("features")} sx={linkStyle}>
              {t.features}
            </Box>
            <Box onClick={() => scrollToSection("clients")} sx={linkStyle}>
              {t.clients}
            </Box>
            <Box onClick={() => scrollToSection("contact")} sx={linkStyle}>
              {t.contact}
            </Box>
          </>
        )}

        {/* Language flags */}
        <IconButton onClick={() => onChangeLanguage("pt")} title="Português">
          <ReactCountryFlag countryCode="BR" svg style={{ fontSize: "1.4em" }} />
        </IconButton>
        <IconButton onClick={() => onChangeLanguage("en")} title="English">
          <ReactCountryFlag countryCode="US" svg style={{ fontSize: "1.4em" }} />
        </IconButton>

        {/* Login */}
        <Button
          variant="contained"
          component={Link}
          to="/auth"
          sx={{
            background: "linear-gradient(90deg, #19a8a1, #117873)",
            color: "#fff",
            borderRadius: "9999px",
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            py: 0.6,
            "&:hover": {
              background: "linear-gradient(90deg, #19a8a1, #13f0e5)",
            },
          }}
        >
          {t.login}
        </Button>
      </Box>
    </Box>
  );
};

// ===== Landing Page =====
const Landing = () => {
  const [language, setLanguage] = useState("pt");
  const t = translations[language];
  const typedWord = useTypewriter(t.words);

  return (
    <>
      <Navbar onChangeLanguage={setLanguage} language={language} />

      {/* HERO */}
      <Box
        id="hero"
        sx={{
          fontFamily: "'Intervogue Alt', sans-serif",
          bgcolor: "white",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          px: { xs: 2, sm: 4 },
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url(/conteudos/cropped.png)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          color: "white",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1,
          },
        }}
      >
        <Container sx={{ maxWidth: "md", position: "relative", zIndex: 2 }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              whiteSpace: "nowrap",
            }}
          >
            {t.heroTitle}
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              borderRight: "2px solid rgb(27, 181, 247)",
              whiteSpace: "nowrap",
              display: "inline-block",
              mt: 1,
              color: "rgb(27, 181, 247)",
            }}
          >
            {language === "pt" ? "é" : "is"} {typedWord}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 3,
              maxWidth: 600,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              opacity: 0.9,
              color: "white",
            }}
          >
            {t.heroDesc}
          </Typography>
        </Container>
      </Box>

      <Box id="features">
        <FeaturesSection language={language} />
      </Box>

      <Box id="clients">
        <ClientsSection language={language} />
      </Box>

      {/* FOOTER */}
      <Box
        id="contact"
        sx={{
          width: "100%",
          paddingTop: "10px",
          pt: 5,
          pr: 5,
          pl: 5,
          pb: 0,
          minHeight: "40vh",
          backgroundColor: "rgba(0, 188, 212)",
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h4" color="white" gutterBottom>
              {t.addressTitle}
            </Typography>
            <Typography variant="h5" color="white">
              {t.address1}
            </Typography>
            <Typography variant="h5" color="white">
              {t.address2}
            </Typography>
            <Typography variant="h5" color="white">
              {t.address3}
            </Typography>
            <Typography variant="h5" color="white">
              {t.address4}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" color="white" gutterBottom>
              {t.contactTitle}
            </Typography>
            <Typography variant="h5" color="white">
              {t.email}
            </Typography>
            <Typography variant="h5" color="white">
              {t.schedule}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" color="white" gutterBottom>
              {t.followUs}
            </Typography>
            <Box
              sx={{
                position: "relative",
                zIndex: 3500,
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                display: "flex",
                gap: 2,
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

        <Box
          sx={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            mt: { xs: -15, sm: -23, md: -30 },
          }}
        >
          <Box
            component="img"
            src="/conteudos/BKG_DESKTOP.png"
            alt="Andes"
            sx={{ width: "100%", display: "block" }}
          />
        </Box>
      </Box>
    </>
  );
};

export default Landing;
