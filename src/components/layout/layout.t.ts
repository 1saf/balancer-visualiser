import { pick } from 'lodash';

export type Spacing = 'x-small' | 'small' | 'base' | 'medium' | 'large' | 'x-large' | 'none';

type AllDevices<T> = T;
type TabletDevices<T> = T;
type LandscapeDevices<T> = T;
type SmallDesktops<T> = T;
type LargeDesktops<T> = T;

export type ResponsiveProp<T> = T | [AllDevices<T>?, TabletDevices<T>?, LandscapeDevices<T>?, SmallDesktops<T>?, LargeDesktops<T>?];
export type Devices = 'all' | 'tablet' | 'landscape' | 'smallDesktop' | 'largeDesktop';

export const MediaQueryConfig: Partial<Record<Devices, number>> = {
    tablet: 640,
    landscape: 768,
    smallDesktop: 1024,
    largeDesktop: 1280,
};

export const SpacingRemConfig: Record<Spacing, number> = {
    none: 0,
    'x-small': 0.25,
    small: 0.5,
    medium: 0.75,
    base: 1,
    large: 1.25,
    'x-large': 2,
};

export type Padding = 'padding' | 'paddingX' | 'paddingY' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom';
const PaddingToPaddingCSSString: Partial<Record<Padding, string>> = {
    padding: 'padding',
    paddingLeft: 'padding-left',
    paddingRight: 'padding-right',
    paddingBottom: 'padding-bottom',
    paddingTop: 'padding-top',
};

export const getPaddingString = (padding: Padding, unit: Spacing) => {
    if (padding === 'paddingX') {
        return `
            padding-left: ${SpacingRemConfig[unit]}rem;
            padding-right: ${SpacingRemConfig[unit]}rem;
        `;
    }
    if (padding === 'paddingY') {
        return `
            padding-top: ${SpacingRemConfig[unit]}rem;
            padding-bottom: ${SpacingRemConfig[unit]}rem;
        `;
    }
    return `${PaddingToPaddingCSSString[padding]}: ${SpacingRemConfig[unit]}rem;`;
};

export const getMediaQuery = (device: Devices) => {
    return `@media (min-width: ${MediaQueryConfig[device]}px)`;
};

export const getResponsiveCss = (device: Devices, css: string[]) => {
    if (device === 'all') return css.join(`\n`);
    return `${getMediaQuery(device)} {\n${css.map(property => property).join(`;\n`)}\n}`;
};

export const resolveSpacing = (props: any) => {
    const paddingProps = pick(props, ['padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'paddingX', 'paddingY']);

    const responsivePadding = Object.keys(paddingProps).reduce(
        (style, paddingType: Padding) => {
            const value = props[paddingType];
            if (Array.isArray(value)) {
                value[0] && style.all.push(getPaddingString(paddingType, value[0]));
                value[1] && style.tablet.push(getPaddingString(paddingType, value[1]));
                value[2] && style.landscape.push(getPaddingString(paddingType, value[2]));
                value[3] && style.smallDesktop.push(getPaddingString(paddingType, value[3]));
                value[4] && style.largeDesktop.push(getPaddingString(paddingType, value[4]));
                return style;
            }
            style.all.push(getPaddingString(paddingType, value));
            return style;
        },
        {
            all: [],
            tablet: [],
            landscape: [],
            smallDesktop: [],
            largeDesktop: [],
        } as Record<Devices, string[]>
    );

    return Object.keys(responsivePadding).reduce((css: string, device: Devices) => {
        if (responsivePadding[device].length) {
            css = `${css}\n${getResponsiveCss(device, responsivePadding[device])}`;
        }
        return css;
    }, ``);
};
