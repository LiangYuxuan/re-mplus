const localeStrings = new Map<string, Map<string, string>>();

export const registerLocaleString = (key: string, content: string, language: string) => {
    if (!localeStrings.has(language)) {
        localeStrings.set(language, new Map());
    }

    localeStrings.get(language)?.set(key, content);

    if (language.includes('-')) {
        const [lang] = language.split('-');
        if (!localeStrings.has(lang)) {
            localeStrings.set(lang, new Map());
        }

        if (!localeStrings.get(lang)?.has(key)) {
            localeStrings.get(lang)?.set(key, content);
        }
    }
};

export const getLocaleString = (key: string, language: string): string => {
    const bestMatch = localeStrings.get(language)?.get(key);
    if (bestMatch) {
        return bestMatch;
    }

    if (language.includes('-')) {
        const [lang] = language.split('-');
        const subMatch = localeStrings.get(lang)?.get(key);
        if (subMatch) {
            return subMatch;
        }
    }

    return localeStrings.get('en')?.get(key) ?? key;
};
