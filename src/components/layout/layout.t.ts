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
export type Margin = 'margin' | 'marginX' | 'marginY' | 'marginLeft' | 'marginRight' | 'marginTop' | 'marginBottom';
const SpacingToPaddingCSSString: Partial<Record<Padding & Margin, string>> = {
    padding: 'padding',
    paddingLeft: 'padding-left',
    paddingRight: 'padding-right',
    paddingBottom: 'padding-bottom',
    paddingTop: 'padding-top',
    margin: 'margin',
    marginLeft: 'margin-left',
    marginRight: 'margin-right',
    marginBottom: 'margin-bottom',
    marginTop: 'margin-top',
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
    return `${(SpacingToPaddingCSSString as any)[padding]}: ${SpacingRemConfig[unit]}rem;`;
};

// duplicated, but whatever for now, lets just get the product out
export const getMarginString = (margin: Margin, unit: Spacing) => {
    if (margin === 'marginX') {
        return `
            margin-left: ${SpacingRemConfig[unit]}rem;
            margin-right: ${SpacingRemConfig[unit]}rem;
        `;
    }
    if (margin === 'marginY') {
        return `
            margin-top: ${SpacingRemConfig[unit]}rem;
            margin-bottom: ${SpacingRemConfig[unit]}rem;
        `;
    }
    return `${(SpacingToPaddingCSSString as any)[margin]}: ${SpacingRemConfig[unit]}rem;`;
};

export const getMediaQuery = (device: Devices) => {
    return `@media (min-width: ${MediaQueryConfig[device]}px)`;
};

export const getResponsiveCss = (device: Devices, css: string[]) => {
    if (device === 'all') return css.join(`\n`);
    return `${getMediaQuery(device)} {\n${css.map(property => property).join(`;\n`)}\n}`;
};

export const resolveSpacing = (t: 'm' | 'p') => (props: any) => {
    const spacingProperty = t == 'm' ? 'margin' : 'padding';
    const spacingProps = pick(props, [
        `${spacingProperty}`,
        `${spacingProperty}Left`,
        `${spacingProperty}Right`,
        `${spacingProperty}Top`,
        `${spacingProperty}Bottom`,
        `${spacingProperty}X`,
        `${spacingProperty}Y`,
    ]);
    const spacingPropFunc: any = t == 'm' ? getMarginString : getPaddingString;

    const responsivePadding = Object.keys(spacingProps).reduce(
        (style, spacingType: Padding) => {
            const value = props[spacingType];
            if (Array.isArray(value)) {
                value[0] && style.all.push(spacingPropFunc(spacingType, value[0]));
                value[1] && style.tablet.push(spacingPropFunc(spacingType, value[1]));
                value[2] && style.landscape.push(spacingPropFunc(spacingType, value[2]));
                value[3] && style.smallDesktop.push(spacingPropFunc(spacingType, value[3]));
                value[4] && style.largeDesktop.push(spacingPropFunc(spacingType, value[4]));
                return style;
            }
            style.all.push(spacingPropFunc(spacingType, value));
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

export const resolveResponsiveCSSProperty = (cssProperty: string, nickname = '', valuePrefix = '') => (props: any) => {
    const propertyValue = props[cssProperty] || props[nickname];
    if (!propertyValue) return '';
    
    if (!Array.isArray(propertyValue)) return `${cssProperty}: ${valuePrefix} ${propertyValue};`;

    const responsiveValues = propertyValue.reduce(
        (style, value: string[] | number[], i) => {
            const _value = `${cssProperty}: ${valuePrefix} ${value};`;
            i === 0 && style.all.push(_value);
            i === 1 && style.tablet.push(_value);
            i === 2 && style.landscape.push(_value);
            i === 3 && style.smallDesktop.push(_value);
            i === 4 && style.largeDesktop.push(_value);
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

    const css = Object.keys(responsiveValues).reduce((css: string, device: Devices) => {
        if (responsiveValues[device].length) {
            css = `${css}\n${getResponsiveCss(device, responsiveValues[device])}`;
        }
        return css;
    }, ``);
    return css;
};
