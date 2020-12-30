import { get } from 'lodash';
import { useAppContext } from '../layouts/AppLayout';

import Theme from '../style/Theme';

export type ThemeProp = {
    innerTheme: 'light' | 'dark';
};

export const getThemeValue = (accessor: string) => (props?: any) => {
    const { theme: activeTheme } = useAppContext();

    return get((props?.theme || Theme)[activeTheme], accessor);
};
