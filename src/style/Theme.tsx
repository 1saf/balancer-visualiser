export const tokens = {
    colors: {
        ultramarine: '#536dfe',
        raisin_black: '#21222c',
        cultured: '#fafafa',
        mellow_apricot: '#F7C27D',
        congo_pink: '#E96B94',
        white: '#FFFFFF',
        medium_aquamarine: '#47E5BC',

        yellow300: '#fce7cb',
        yellow400: '#f9ce97',
        yellow500: '#F7C27D',

        blue100: '#eef0fe',
        blue200: '#cbd2fb',
        blue300: '#97a6f6',
        blue400: '#7488f3',
        blue500: '#536dfe',
        blue600: '#394aa8',
        blue700: '#293578',
        blue800: '#101530',
        blue900: '#080b18',

        gray100: '#FEFEFF',
        gray200: '#F3F3F5',
        gray300: '#E5E6EA',
        gray400: '#D3D4DB',
        gray500: '#AAACB9',
        gray600: '#72758A',
        gray700: '#62657C',
        gray800: '#3C3E4D',
        gray900: '#181921',

        background: '#f7fafc',
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
    fontWeight: {
        heading_1: 600,
        heading_2: 600,
        heading_3: 600,
        heading_4: 600,
        heading_5: 700,
        heading_6: 700,  
    }
};

export default {
    background: tokens.colors.background,
    foreground: tokens.colors.white,
    borderColor: tokens.colors.gray400,
    emphasizedBorder: tokens.colors.gray400,
    headingColor: tokens.colors.gray800,
    typography: tokens.typography,
    fontWeight: tokens.fontWeight,
    subheadingColor: tokens.colors.gray700,
    emphasizedText: tokens.colors.congo_pink,
    actionButtonHover: tokens.colors.gray200,
    actionButtonTextColor: tokens.colors.gray700,
    cardBackgroundColor: tokens.colors.gray100,

    tooltipBackgroundColor: tokens.colors.ultramarine,
    tooltipTextColor: tokens.colors.gray100,
};
