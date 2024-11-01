import en from './en.ts';
import zhCN from './zhCN.ts';

const localeStrings = new Map<string, Map<string, string>>([
    [en.language, en.strings],
    [zhCN.language, zhCN.strings],
]);

let selectedLanguage = 'en';
let selectedLanguageParent: string | undefined;

export const selectLanguage = (language: string) => {
    selectedLanguage = language;
    if (language.includes('-')) {
        [selectedLanguageParent] = language.split('-');
    } else {
        selectedLanguageParent = undefined;
    }
};

export const getLocaleString = (key: string): string => {
    const bestMatch = localeStrings.get(selectedLanguage)?.get(key);
    if (bestMatch !== undefined) {
        return bestMatch;
    }

    if (selectedLanguageParent !== undefined) {
        const subMatch = localeStrings.get(selectedLanguageParent)?.get(key);
        if (subMatch !== undefined) {
            return subMatch;
        }
    }

    return localeStrings.get('en')?.get(key) ?? key;
};
