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
                // Category Colors (Nueva paleta vibrant)
                'category-movie': '#FF595E',    // Vibrant Coral
                'category-series': '#8939F7',   // Vibrant Purple
                'category-book': '#8AC926',     // Yellow Green
                'category-game': '#1982C4',     // Steel Blue
                'category-music': '#FFCA3A',    // Golden Pollen
                'category-podcast': '#5BC0EB',  // Sky Blue
                'category-anything': '#FFFBFF', // Soft White
                // Faded Colors (20% opacity)
                'category-movie-faded': 'rgba(255, 89, 94, 0.2)',
                'category-series-faded': 'rgba(137, 57, 247, 0.2)',
                'category-book-faded': 'rgba(138, 201, 38, 0.2)',
                'category-game-faded': 'rgba(25, 130, 196, 0.2)',
                'category-music-faded': 'rgba(255, 202, 58, 0.2)',
                'category-podcast-faded': 'rgba(91, 192, 235, 0.2)',
                'category-anything-faded': 'rgba(255, 251, 255, 0.2)',
                // Status
                success: '#34C759',
                warning: '#FFD60A',
                error: '#FF453A',
                link: '#64D2FF',
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
