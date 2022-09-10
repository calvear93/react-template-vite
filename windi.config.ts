import { Config } from 'windicss/types/interfaces';

export default {
    theme: {
        extend: {
            colors: {
                brand: '#007a33',
                primary: '#00b2a9',
                'primary-light': '#78ddd8'
            },
            boxShadow: {
                normal: '0 2px 4px rgba(9, 35, 66, .25)',
                header: '0 2px 10px rgba(9, 35, 66, .45)',
                button: '0 2px 4px 0 rgba(0, 0, 0, .1)',
                hover: '0 4px 8px 0 rgba(0, 0, 0, .1)',
                floating: '0 10px 32px -10px rgba(0, 0, 0, .75)',
                toast: '(0 2px 6px rgba(0, 0, 0, .1), 0 0 12px rgba(3, 45, 68, .1))',
                focus: '(0 2px 16px rgba(0, 0, 0, .08), 0 0 24px rgba(3, 45, 68, .16))',
                box: '(0 9px 16px rgba(0, 0, 0, .08), 0 0 56px rgba(3, 45, 68, .16))'
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
