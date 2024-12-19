import en from './en.ts';
import zhCN from './zhCN.ts';

const dataKeys = [
    'specializationsShortName',
    'dungeonsShortName',
    'specializations',
    'dungeons',
] as const;

const locales = [
    zhCN,
];

locales.forEach((locale) => {
    en.strings.forEach((_, key) => {
        if (!locale.strings.has(key)) {
            console.warn(`Missing key ${key} in ${locale.language} locale strings`);
        }
    });

    dataKeys.forEach((k) => {
        en[k].forEach((_, key) => {
            if (!locale[k].has(key)) {
                console.warn(`Missing key ${key.toString()} in ${locale.language} locale ${k}`);
            }
        });
    });
});

let selectedLocale = en;

export const selectLanguage = (language: string) => {
    const parent = language.includes('-') ? language.split('-')[0] : language;

    const locale = locales.find((l) => l.language === language);
    if (locale !== undefined) {
        selectedLocale = locale;
        return;
    }

    const parentLocale = locales.find((l) => l.language === parent);
    if (parentLocale !== undefined) {
        selectedLocale = parentLocale;
        return;
    }

    selectedLocale = en;
};

export const getLocaleString = (key: string): string => {
    const res = selectedLocale.strings.get(key);
    if (res !== undefined) {
        return res;
    }

    console.warn(`Missing key ${key} in locale strings`);

    return key;
};

export const getSpecializationShortName = (id: number): string => {
    const res = selectedLocale.specializationsShortName.get(id);
    if (res !== undefined) {
        return res;
    }

    console.warn(`Missing key ${id.toString()} in locale specializationsShortName`);

    const fallback = selectedLocale.specializations.get(id);
    if (fallback !== undefined) {
        return fallback.substring(0, 4);
    }

    console.warn(`Missing key ${id.toString()} in locale specializations`);

    return id.toString();
};

export const getDungeonShortName = (id: number): string => {
    const res = selectedLocale.dungeonsShortName.get(id);
    if (res !== undefined) {
        return res;
    }

    console.warn(`Missing key ${id.toString()} in locale dungeonsShortName`);

    const fallback = selectedLocale.dungeons.get(id);
    if (fallback !== undefined) {
        return fallback;
    }

    console.warn(`Missing key ${id.toString()} in locale dungeons`);

    return id.toString();
};

export const gettSpecializationName = (id: number): string => {
    const res = selectedLocale.specializations.get(id);
    if (res !== undefined) {
        return res;
    }

    console.warn(`Missing key ${id.toString()} in locale specializations`);

    return id.toString();
};

export const getDungeonName = (id: number): string => {
    const res = selectedLocale.dungeons.get(id);
    if (res !== undefined) {
        return res;
    }

    console.warn(`Missing key ${id.toString()} in locale dungeons`);

    return id.toString();
};

export const getSeasonName = (slug: string): string => {
    const res = selectedLocale.seasons.get(slug);
    if (res !== undefined) {
        return res;
    }

    console.warn(`Missing key ${slug} in locale seasons`);

    return slug;
};
