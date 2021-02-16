export const tokens = {
    colors: {
        ultramarine: '#3f5bf6',
        supermarine: '#3044FA',
        raisin_black: '#21222c',
        cultured: '#fafafa',
        mellow_apricot: '#F7C27D',
        congo_pink: '#F54780',
        white: '#FFFFFF',
        medium_aquamarine: '#47E5BC',
        yellow: '#F8FD20',
        pingo: '#FD5AA8',

        green100: '#B4FBB6',
        green200: '#83E286',
        green300: '#65DA69',
        green400: '#51E556',

        red100: '#FF9999',
        red200: '#F16868',
        red300: '#E94A4A',
        red400: '#F34040',

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

        gray100: '#C4C4D8',
        gray200: '#84849A',
        gray300: '#51576C',
        gray400: '#353749',
        gray500: '#2A2D3E',
        gray600: '#242637',
        gray700: '#1F2130',
        gray800: '#1B1D2C',
        gray900: '#161825',

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
        heading_5: 600,
        heading_6: 600,
    },
};

export default {
    primary: tokens.colors.ultramarine,

    foreground: tokens.colors.white,
    background: tokens.colors.background,

    headerBg: tokens.colors.raisin_black,

    shadow: `${tokens.colors.gray900} 0px 2px 4px 2px`,

    dark: {
        foreground: tokens.colors.white,
        background: tokens.colors.gray700,
        primaryFontColor: tokens.colors.gray100,
        secondaryFontColor: tokens.colors.gray200,
        shadow: `${tokens.colors.gray900} 0px 2px 4px 2px`,

        heading: {
            primaryColor: tokens.colors.gray100,
            secondaryColor: tokens.colors.gray200,
        },

        buttonGroup: {
            primary: {
                background: tokens.colors.gray700,
                activeColor: tokens.colors.white,
                activeBackground: tokens.colors.supermarine,
                inactiveColor: tokens.colors.gray200,
                borderColor: tokens.colors.gray200,
                hoverColor: tokens.colors.white,
            },

            secondary: {
                background: tokens.colors.gray700,
                activeColor: tokens.colors.gray700,
                activeBackground: tokens.colors.congo_pink,
                inactiveColor: tokens.colors.gray200,
                borderColor: tokens.colors.gray400,
                hoverColor: tokens.colors.white,
            }
        },

        dropdown: {
            background: tokens.colors.gray500,
            hoverColor: tokens.colors.supermarine,
            color: tokens.colors.gray100,
        },

        table: {
            headerBackground: tokens.colors.gray900,
            background: tokens.colors.gray900,
            headerColor: tokens.colors.gray100,
            cellPrimaryColor: tokens.colors.gray100,
            cellSecondaryColor: tokens.colors.gray200,
        },
        card: {
            background: tokens.colors.gray900,
            borderColor: tokens.colors.gray400,
        },

        graph: {
            color: tokens.colors.gray100,
            foreground: tokens.colors.ultramarine,
            background: tokens.colors.gray900,
        },
    },
    light: {
        foreground: tokens.colors.white,
        background: tokens.colors.white,
        table: {
            headerBackground: tokens.colors.gray600,
            background: tokens.colors.gray700,
            headerColor: tokens.colors.gray100,
            cellPrimaryColor: tokens.colors.gray100,
            cellSecondaryColor: tokens.colors.gray200,
        },
    },

    borderColor: tokens.colors.gray600,
    emphasizedBorder: tokens.colors.gray500,
    headingColor: tokens.colors.gray800,
    typography: tokens.typography,
    fontWeight: tokens.fontWeight,
    subheadingColor: tokens.colors.gray700,
    emphasizedText: tokens.colors.congo_pink,

    balancerLogoFill: tokens.colors.white,

    cardBackgroundColor: tokens.colors.gray100,

    tooltipBackgroundColor: tokens.colors.congo_pink,
    tooltipTextColor: tokens.colors.gray100,

    silentdropdownHover: tokens.colors.ultramarine,
    silentdropdownButtonHover: tokens.colors.blue100,
    dropdownItemHoverColor: tokens.colors.blue500,

    actionButtonHover: tokens.colors.gray200,
    actionButtonTextColor: tokens.colors.gray700,
};
