import { Config } from 'windicss/types/interfaces';

export default {
    theme: {
        extend: {
            colors: {
                brand: '#007a33',
                primary: '#00b2a9',
                'primary-light': '#78ddd8'
            },
            zIndex: {
                toast: 1000,
                loader: 800,
                tooltip: 600,
                dropdown: 500,
                modal: 200,
                navigation: 100,
                header: 80,
                component: 50,
                container: 10,
                body: 1
            }
        }
    }
} as Config;
