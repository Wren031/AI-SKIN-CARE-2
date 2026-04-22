// @/src/constants/themes.ts

export const THEMES = {
  DERMA_AI: {
    COLORS: {
      // THE "GLOW" - Soft Rose/Coral representing healthy skin
      PRIMARY: '#FB7185',       
      
      // THE "AI" - A soft indigo/violet for neural processing accents
      ACCENT: '#818CF8',        
      
      // THE "CLEANSE" - A very pale, warm off-white (less "hospital", more "spa")
      BACKGROUND: '#FAFBFC',    
      
      // GLASS EFFECT - Semi-transparent for that high-end aesthetic
      SURFACE: 'rgba(255, 255, 255, 0.85)', 
      
      // TYPOGRAPHY - Softened blacks for better readability
      TEXT_PRIMARY: '#1E293B',  // Slate 800
      TEXT_SECONDARY: '#64748B',// Slate 500
      
      // NEURAL DATA - Success/Hydration greens
      SUCCESS: '#34D399',
      
      BORDER: 'rgba(226, 232, 240, 0.5)',
      INPUT_BG: '#F8FAFC',
      WHITE: '#FFFFFF',
    },
    
    // Softer, larger radii for a "friendly tech" feel
    RADIUS: {
      S: 16,     // For inputs
      M: 24,     // For cards
      L: 40,     // For main containers/buttons
      ROUND: 99, // For floating action buttons
    },
    
    SHADOWS: {
      // A soft, wide shadow that mimics ambient light
      GLOW: {
        shadowColor: '#FB7185',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      },
      // Subtle shadow for cards
      SOFT: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      }
    }
  }
};