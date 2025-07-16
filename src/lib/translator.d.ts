interface TranslatorType {
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<TranslatorInstance>;
}

interface TranslatorInstance {
  translate(text: string): Promise<string>;
}

declare global {
  interface Window {
    Translator: TranslatorType;
  }
}

export {};
