const tokens = {
    colors: {
        ultramarine: '#536dfe',
        raisin_black: '#21222c',
        cultured: '#fafafa',
        mellow_apricot: '#F7C27D',
        congo_pink: '#EB8278',
        white: '#FFFFFF',

        blue100: '#eef0fe',
        blue200: '#cbd2fb',
        blue300: '#97a6f6',
        blue400: '#7488f3',
        blue500: '#536dfe',
        blue600: '#394aa8',
        blue700: '#293578',
        blue800: '#101530',
        blue900: '#080b18',

        gray100: '#fefeff',
        gray200: '#f3f3f5',
        gray300: '#e5e6ea',
        gray400: '#aaacb9',
        gray500: '#72758a',
        gray600: '#55576c',
        gray700: '#30313f',
        gray800: '#1d1e27',
        gray900: '#181921',
    },
    space: [0, 4, 8, 12, 16, 20, 32],
    typography: {
        heading_1: 3,
        heading_2: 2.4375,
        heading_3: 1.9375,
        heading_4: 1.5625,
        heading_5: 1.25,
        heading_6: 1,
    },
};

export default {
    background: tokens.colors.gray100,
    foreground: tokens.colors.white,
    borderColor: tokens.colors.gray300,
    headingColor: tokens.colors.raisin_black,
    typography: tokens.typography,
};
