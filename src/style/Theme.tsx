export const tokens = {
    colors: {
        ultramarine: '#3f5bf6',
        raisin_black: '#21222c',
        cultured: '#fafafa',
        mellow_apricot: '#F7C27D',
        congo_pink: '#E96B94',
        white: '#FFFFFF',
        medium_aquamarine: '#47E5BC',

        green100: '#c1efdf',
        green200: '#53e5be',
        green300: '#4dc5a3',
        green400: '#4da58a',
        green500: '#488874',
        green600: '#0e664f',

        red100: '#f4e0e5',
        red200: '#efc2ce',
        red300: '#ec9ab1',
        red400: '#e96b94',
        red500: '#bd5d7b',
        red600: '#c01d52',

        yellow300: '#fce7cb',
        yellow400: '#f9ce97',
        yellow500: '#F7C27D',

        blue100: '#eef0fe',
        blue200: '#c9d1fd',
        blue300: '#97a6f6',
        blue400: '#677df8',
        blue500: '#3f5bf6',
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
    primary: tokens.colors.ultramarine,

    foreground: tokens.colors.white,
    background: tokens.colors.background,

    headerBg: tokens.colors.raisin_black,
    borderColor: tokens.colors.gray600,
    emphasizedBorder: tokens.colors.gray500,
    headingColor: tokens.colors.gray800,
    typography: tokens.typography,
    fontWeight: tokens.fontWeight,
    subheadingColor: tokens.colors.gray700,
    emphasizedText: tokens.colors.congo_pink,

    balancerLogoFill: tokens.colors.white,

    cardBackgroundColor: tokens.colors.gray100,

    tooltipBackgroundColor: tokens.colors.ultramarine,
    tooltipTextColor: tokens.colors.gray100,

    silentdropdownHover: tokens.colors.ultramarine,
    silentdropdownButtonHover: tokens.colors.blue100,
    dropdownItemHoverColor: tokens.colors.blue500,
    
    actionButtonHover: tokens.colors.gray200,
    actionButtonTextColor: tokens.colors.gray700,
};
