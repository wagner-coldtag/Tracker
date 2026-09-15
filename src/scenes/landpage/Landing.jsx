import {
  AppBar,
  Toolbar,
  Drawer,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  GlobalStyles,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  TbBrandLinkedin,
  TbBrandFacebook,
  TbBrandInstagram,
  TbMenu2,
  TbX,
  TbMapPin,
  TbMail,
  TbClock,
  TbArrowRight,
} from "react-icons/tb";
import { Link } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import ClientsSection from "./ClientsSection";
import FeaturesSection from "./FeaturesSection";
import HealthcareSection from "./HealthcareSection";
import HowItWorksSection from "./HowItWorksSection";
import {
  BRAND_BLUE,
  BRAND_BLUE_DEEP,
  BRAND_DARK,
  BRAND_BADGE_BG,
  BRAND_GRADIENT,
  BRAND_GRADIENT_HOVER,
} from "./brand";

const NAVBAR_HEIGHT = { xs: 64, md: 72 };

// ===== Translation dictionary =====
const translations = {
  pt: {
    home: "Home",
    platform: "Alimentos",
    health: "Saúde",
    sectors: "Setores",
    contact: "Contato",
    login: "Entrar",
    heroTitleLine1: "Com a",
    heroTitleBrand: "Coldtag",
    heroTitleLine2: "o futuro da cadeia do frio",
    heroDesc:
      "Soluções em IoT e Inteligência Artificial que reduzem perdas, aumentam a eficiência e garantem a segurança de alimentos e produtos biológicos para saúde em todas as etapas da cadeia do frio.",
    ctaPrimary: "Solicitar Demonstração",
    ctaSecondary: "Ver Plataforma",
    liveBadge: "Monitoramento em tempo real",
    contactTitle: "Contato",
    followUs: "Nos siga",
    addressTitle: "Coldtag Solutions",
    address1: "Sala 221 Unitec 2",
    address2: "Av. Theodomiro Porto da Fonseca, 3397",
    address3: "Bairro Cristo Rei, CEP 93022-715",
    address4: "São Leopoldo, RS",
    email: "coldtag@coldtagsolutions.com",
    schedule: "Seg-Sex 9h-17h",
    rights: "© 2026 Coldtag Solutions. Todos os direitos reservados.",
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
    platform: "Food",
    health: "Health",
    sectors: "Sectors",
    contact: "Contact",
    login: "Login",
    heroTitleLine1: "With",
    heroTitleBrand: "Coldtag,",
    heroTitleLine2: "the future of industry",
    heroDesc:
      "IoT and Artificial Intelligence solutions that reduce losses, increase efficiency, and ensure the safety of food and healthcare products at every stage of the cold chain.",
    ctaPrimary: "Request a Demo",
    ctaSecondary: "See Platform",
    liveBadge: "Real-time monitoring",
    contactTitle: "Contact",
    followUs: "Follow us",
    addressTitle: "Coldtag Solutions",
    address1: "Room 221 Unitec 2",
    address2: "Av. Theodomiro Porto da Fonseca, 3397",
    address3: "Cristo Rei District, ZIP 93022-715",
    address4: "São Leopoldo, RS - Brazil",
    email: "coldtag@coldtagsolutions.com",
    schedule: "Mon-Fri 9AM-5PM",
    rights: "© 2026 Coldtag Solutions. All rights reserved.",
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
// Navigation uses real <a href="#id"> anchors everywhere (not JS-only click
// handlers), so links keep working even if a script elsewhere on the page
// errors out. Smooth scrolling + the navbar-height offset are handled with
// plain CSS (html { scroll-behavior: smooth } + scroll-margin-top on each
// section), which is far more reliable than manual scrollIntoView math.
const Navbar = ({ onChangeLanguage, language }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = translations[language];

  const navItems = [
    { id: "hero", label: t.home },
    { id: "platform", label: t.platform },
    { id: "health", label: t.health },
    { id: "sectors", label: t.sectors },
    { id: "contact", label: t.contact },
  ];

  const closeMenu = () => setMobileOpen(false);

  const loginButtonSx = {
    background: BRAND_GRADIENT,
    color: "#fff",
    borderRadius: "9999px",
    textTransform: "none",
    fontWeight: "bold",
    "&:hover": { background: BRAND_GRADIENT_HOVER },
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(10, 37, 64, 0.08)",
        }}
      >
        <Toolbar
          disableGutters
          sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, minHeight: NAVBAR_HEIGHT }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            {/* Logo */}
            <Box component="a" href="#hero" sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <img src="/conteudos/LOGO(RECTANGLE)_DESKTOP.png" alt="Coldtag Logo" style={{ height: 30, display: "block" }} />
            </Box>

            {/* Desktop nav links, centered in remaining space */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", gap: 4 }}>
                {navItems.map((item) => (
                  <Box
                    key={item.id}
                    component="a"
                    href={`#${item.id}`}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: BRAND_DARK,
                      textDecoration: "none",
                      "&:hover": { color: BRAND_BLUE },
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Box>
            )}

            {/* Right side actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: isMobile ? "auto" : 0, flexShrink: 0 }}>
              {!isMobile && (
                <>
                  <IconButton onClick={() => onChangeLanguage("pt")} title="Português" size="small">
                    <ReactCountryFlag countryCode="BR" svg style={{ fontSize: "1.3em" }} />
                  </IconButton>
                  <IconButton onClick={() => onChangeLanguage("en")} title="English" size="small">
                    <ReactCountryFlag countryCode="US" svg style={{ fontSize: "1.3em" }} />
                  </IconButton>
                  <Button component={Link} to="/auth" variant="contained" sx={{ ...loginButtonSx, px: 3, py: 0.7, ml: 1 }}>
                    {t.login}
                  </Button>
                </>
              )}

              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: BRAND_DARK }} aria-label="menu">
                  <TbMenu2 size={22} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer so fixed AppBar doesn't cover page content */}
      <Toolbar sx={{ minHeight: NAVBAR_HEIGHT }} />

      {/* Mobile menu */}
      <Drawer anchor="right" open={mobileOpen} onClose={closeMenu}>
        <Box sx={{ width: 270, height: "100%", display: "flex", flexDirection: "column", px: 3, pt: 3, pb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <IconButton onClick={closeMenu} aria-label="fechar menu">
              <TbX size={20} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {navItems.map((item) => (
              <Box
                key={item.id}
                component="a"
                href={`#${item.id}`}
                onClick={closeMenu}
                sx={{ fontWeight: 600, fontSize: "1.05rem", color: BRAND_DARK, textDecoration: "none" }}
              >
                {item.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
            <IconButton onClick={() => onChangeLanguage("pt")} title="Português">
              <ReactCountryFlag countryCode="BR" svg style={{ fontSize: "1.3em" }} />
            </IconButton>
            <IconButton onClick={() => onChangeLanguage("en")} title="English">
              <ReactCountryFlag countryCode="US" svg style={{ fontSize: "1.3em" }} />
            </IconButton>
          </Box>

          <Button component={Link} to="/auth" variant="contained" onClick={closeMenu} sx={{ ...loginButtonSx, mt: 3, py: 1 }}>
            {t.login}
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

// ===== Footer decorative wave — vector, blue-only gradient =====
const FooterWave = () => (
  <Box component="svg" viewBox="0 0 1440 200" preserveAspectRatio="none" sx={{ display: "block", width: "100%", height: { xs: 70, sm: 110, md: 150 } }}>
    <defs>
      <linearGradient id="footerWaveGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={BRAND_BLUE} />
        <stop offset="100%" stopColor={BRAND_BLUE_DEEP} />
      </linearGradient>
    </defs>
    <path d="M0,110 C240,40 480,160 720,90 C960,20 1200,140 1440,70 L1440,200 L0,200 Z" fill="rgba(27,181,247,0.12)" />
    <path d="M0,140 C240,90 480,190 720,120 C960,60 1200,170 1440,110 L1440,200 L0,200 Z" fill="rgba(27,181,247,0.28)" />
    <path d="M0,170 C240,130 480,200 720,150 C960,110 1200,190 1440,150 L1440,200 L0,200 Z" fill="url(#footerWaveGradient)" />
  </Box>
);

// ===== Landing Page =====
const Landing = () => {
  const [language, setLanguage] = useState("pt");
  const t = translations[language];
  const typedWord = useTypewriter(t.words);

  const sectionOffsetSx = { scrollMarginTop: { xs: NAVBAR_HEIGHT.xs, md: NAVBAR_HEIGHT.md } };

  return (
    <>
      <GlobalStyles
        styles={{
          html: { scrollBehavior: "smooth" },
          "@keyframes cursorBlink": {
            "0%, 50%": { borderColor: BRAND_BLUE },
            "50.01%, 100%": { borderColor: "transparent" },
          },
          "@keyframes pulseDot": {
            "0%": { transform: "scale(1)", opacity: 0.7 },
            "100%": { transform: "scale(2.4)", opacity: 0 },
          },
        }}
      />

      <Navbar onChangeLanguage={setLanguage} language={language} />

      {/* HERO — white canvas, blue accents only. No photo-with-dark-overlay. */}
      <Box
        id="hero"
        sx={{
          ...sectionOffsetSx,
          position: "relative",
          overflow: "hidden",
          bgcolor: "white",
          py: { xs: 8, md: 10 },
          minHeight: { xs: "auto", md: "calc(100vh - 72px)" },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* decorative dot grid */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: { xs: "100%", md: "55%" },
            height: "100%",
            backgroundImage: `radial-gradient(${BRAND_BADGE_BG} 1.5px, transparent 1.5px)`,
            backgroundSize: "24px 24px",
            opacity: 0.7,
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 72%)",
            pointerEvents: "none",
          }}
        />
        {/* decorative glow blob */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: "-15%", md: "-5%" },
            transform: "translateY(-50%)",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND_BLUE}33 0%, transparent 70%)`,
            filter: "blur(40px)",
            display: { xs: "none", sm: "block" },
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Grid container spacing={{ xs: 6, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.9rem" },
                  lineHeight: 1.15,
                  color: BRAND_DARK,
                }}
              >
                {t.heroTitleLine1}{" "}
                <Box
                  component="span"
                  sx={{
                    color: BRAND_BLUE,
                    fontWeight: 400,
                                      fontWeight: "bold",

                  }}
                >
                  {t.heroTitleBrand}
                </Box>
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.9rem" },
                  lineHeight: 1.15,
                  color: BRAND_DARK,
                  mt: 0.5,

                }}
              >
                {t.heroTitleLine2}
              </Typography>

              <Typography
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.9rem" },
                  lineHeight: 1.15,
                  borderRight: `3px solid ${BRAND_BLUE}`,
                  display: "inline-block",
                  mt: 1,
                  color: BRAND_BLUE,
                  animation: "cursorBlink 0.9s steps(1) infinite",
                }}
              >
                {language === "pt" ? "é" : "is"} {typedWord}
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 3, maxWidth: 500, fontSize: { xs: "1rem", sm: "1.1rem" }, color: "#3d5166", lineHeight: 1.6 }}
              >
                {t.heroDesc}
              </Typography>

              <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Button
                  component="a"
                  href="#contact"
                  variant="contained"
                  endIcon={<TbArrowRight size={18} />}
                  sx={{
                    background: BRAND_GRADIENT,
                    color: "#fff",
                    borderRadius: "9999px",
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    px: 3.5,
                    py: 1.2,
                    "&:hover": { background: BRAND_GRADIENT_HOVER },
                  }}
                >
                  {t.ctaPrimary}
                </Button>
                <Button
                  component="a"
                  href="#platform"
                  variant="outlined"
                  sx={{
                    color: BRAND_DARK,
                    borderColor: BRAND_BADGE_BG,
                    borderWidth: 1.5,
                    borderRadius: "9999px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    px: 3.5,
                    py: 1.2,
                    "&:hover": { borderColor: BRAND_BLUE, bgcolor: `${BRAND_BLUE}0D` },
                  }}
                >
                  {t.ctaSecondary}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: "none", sm: "block" } }}>
              <Box sx={{ position: "relative", maxWidth: 480, mx: { xs: "auto", md: 0 } }}>
                <Box
                  component="img"
                  src="/conteudos/cropped.png"
                  alt={language === "en" ? "Cold chain monitoring" : "Monitoramento da cadeia do frio"}
                  sx={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    borderRadius: 4,
                    display: "block",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: "0 25px 60px rgba(10,37,64,0.22)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: 16, md: -22 },
                    left: { xs: 16, md: -22 },
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.4,
                    bgcolor: "white",
                    color: BRAND_DARK,
                    borderRadius: 3,
                    px: 2.2,
                    py: 1.3,
                    boxShadow: "0 14px 30px rgba(10,37,64,0.18)",
                  }}
                >
                  <Box sx={{ position: "relative", width: 10, height: 10 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: BRAND_BLUE }} />
                    <Box
                      sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: BRAND_BLUE, animation: "pulseDot 1.6s ease-out infinite" }}
                    />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.82rem" }}>{t.liveBadge}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="how-it-works" sx={sectionOffsetSx}>
        <HowItWorksSection language={language} />
      </Box>

      <Box id="platform" sx={sectionOffsetSx}>
        <FeaturesSection language={language} />
      </Box>

      <Box id="health" sx={sectionOffsetSx}>
        <HealthcareSection language={language} />
      </Box>

      <Box id="sectors" sx={sectionOffsetSx}>
        <ClientsSection language={language} />
      </Box>

      {/* FOOTER */}
      <Box id="contact" sx={{ ...sectionOffsetSx, width: "100%", pt: { xs: 6, md: 8 }, px: { xs: 3, md: 5 }, pb: 0, bgcolor: BRAND_DARK }}>
        <Grid container spacing={5} justifyContent="center" sx={{ maxWidth: 1160, mx: "auto" }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="white" sx={{ fontWeight: 700, mb: 2 }}>
              {t.addressTitle}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.3, alignItems: "flex-start" }}>
              <TbMapPin size={18} color={BRAND_BLUE} style={{ marginTop: 3, flexShrink: 0 }} />
              <Typography variant="body2" color="white" sx={{ opacity: 0.85, lineHeight: 1.8 }}>
                {t.address1}
                <br />
                {t.address2}
                <br />
                {t.address3}
                <br />
                {t.address4}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="white" sx={{ fontWeight: 700, mb: 2 }}>
              {t.contactTitle}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.3, alignItems: "flex-start", mb: 1.2 }}>
              <TbMail size={18} color={BRAND_BLUE} style={{ marginTop: 3, flexShrink: 0 }} />
              <Typography variant="body2" color="white" sx={{ opacity: 0.85 }}>
                {t.email}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.3, alignItems: "flex-start" }}>
              <TbClock size={18} color={BRAND_BLUE} style={{ marginTop: 3, flexShrink: 0 }} />
              <Typography variant="body2" color="white" sx={{ opacity: 0.85 }}>
                {t.schedule}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <Typography variant="h6" color="white" sx={{ fontWeight: 700, mb: 2 }}>
              {t.followUs}
            </Typography>
            <Box sx={{ color: "white", fontSize: "1.4rem", display: "flex", gap: 2.5 }}>
              <a
                href="https://www.linkedin.com/company/coldtag-solutions/?originalSubdomain=br"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none", display: "flex" }}
                aria-label="LinkedIn"
              >
                <TbBrandLinkedin />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61576303142767"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none", display: "flex" }}
                aria-label="Facebook"
              >
                <TbBrandFacebook />
              </a>
              <a
                href="https://www.instagram.com/coldtagsolutions/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none", display: "flex" }}
                aria-label="Instagram"
              >
                <TbBrandInstagram />
              </a>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" color="white" sx={{ opacity: 0.55, textAlign: "center", mt: 5, fontSize: "0.8rem" }}>
          {t.rights}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <FooterWave />
        </Box>
      </Box>
    </>
  );
};

export default Landing;
