// Central brand palette — strictly white + blue, per brand guidelines.
// Everything else in the site (layout, sections, icon set) was rebuilt
// around this restrained two-color system instead of the previous mix of
// sky-blue / teal / cyan.

// Blue scale (lightest to darkest)
export const BLUE_50 = "#EAF6FE"; // section tints
export const BLUE_100 = "#D2ECFC"; // badge backgrounds, borders
export const BLUE_500 = "#1BB5F7"; // primary brand blue (icons, links, accents)
export const BLUE_600 = "#0B8FD6"; // hover / mid state
export const BLUE_700 = "#0B63C4"; // deep blue (gradient end, strong CTA)
export const BLUE_900 = "#0A2540"; // near-navy — headings, dark section backgrounds

export const WHITE = "#FFFFFF";

// Semantic aliases used throughout the components
export const BRAND_BLUE = BLUE_500;
export const BRAND_BLUE_DEEP = BLUE_700;
export const BRAND_DARK = BLUE_900;
export const BRAND_LIGHT_BG = BLUE_50;
export const BRAND_BADGE_BG = BLUE_100;

export const BRAND_GRADIENT = `linear-gradient(135deg, ${BLUE_500} 0%, ${BLUE_700} 100%)`;
export const BRAND_GRADIENT_HOVER = `linear-gradient(135deg, ${BLUE_600} 0%, ${BLUE_900} 100%)`;
