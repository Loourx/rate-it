/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: '#121212',
                surface: '#1E1E1E',
                'surface-elevated': '#2A2A2A',
                'surface-pressed': '#333333',
                divider: '#2A2A2A',
                primary: '#FFFFFF',
                secondary: '#A0A0A0',
                tertiary: '#666666',
                // Category Colors
                'category-movie': '#FF6B6B',
                'category-series': '#4ECDC4',
                'category-book': '#FFE66D',
                'category-game': '#95E1D3',
                'category-music': '#F3A683',
                'category-podcast': '#A8D8EA',
                'category-anything': '#B3B3B3',
                // Faded Colors (20% opacity)
                'category-movie-faded': 'rgba(255, 107, 107, 0.2)',
                'category-series-faded': 'rgba(78, 205, 196, 0.2)',
                'category-book-faded': 'rgba(255, 230, 109, 0.2)',
                'category-game-faded': 'rgba(149, 225, 211, 0.2)',
                'category-music-faded': 'rgba(243, 166, 131, 0.2)',
                'category-podcast-faded': 'rgba(168, 216, 234, 0.2)',
                'category-anything-faded': 'rgba(179, 179, 179, 0.2)',
                // Status
                success: '#95E1D3',
                warning: '#FFE66D',
                error: '#FF6B6B',
                link: '#4ECDC4',
            },
            spacing: {
                xs: '4px',
                sm: '8px',
                md: '12px',
                base: '16px',
                lg: '20px',
                xl: '24px',
                '2xl': '32px',
                '3xl': '48px',
            },
            borderRadius: {
                sm: '8px',
                md: '12px',
                lg: '16px',
                full: '999px',
            },
            fontSize: {
                displayLarge: '40px',
                displayMedium: '32px',
                displaySmall: '24px',
                headlineLarge: '24px',
                headlineMedium: '20px',
                headlineSmall: '18px',
                bodyLarge: '16px',
                bodyMedium: '14px',
                bodySmall: '12px',
                labelLarge: '14px',
                labelMedium: '12px',
                labelSmall: '10px',
            },
            fontFamily: {
                sans: ['SpaceGrotesk_400Regular'],
                medium: ['SpaceGrotesk_500Medium'],
                semibold: ['SpaceGrotesk_600SemiBold'],
                bold: ['SpaceGrotesk_700Bold'],
            }
        },
    },
    plugins: [],
};
