/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                purple: {
                    gradient: {
                        from: '#667eea',
                        to: '#764ba2',
                    }
                }
            },
            animation: {
                'float': 'float 20s infinite ease-in-out',
                'fade-in': 'fadeIn 0.6s ease-out',
                'fade-in-delay-1': 'fadeIn 0.6s ease-out 0.2s both',
                'fade-in-delay-2': 'fadeIn 0.6s ease-out 0.4s both',
                'fade-in-delay-3': 'fadeIn 0.6s ease-out 0.6s both',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) translateX(0)' },
                    '25%': { transform: 'translateY(-20px) translateX(10px)' },
                    '50%': { transform: 'translateY(-10px) translateX(-10px)' },
                    '75%': { transform: 'translateY(-30px) translateX(5px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
