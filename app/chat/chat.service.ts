// app/chat/chat.service.ts

import OpenAI from "openai";
import { ChatMessageItem } from "./chat.dto";
const { Translate } = require("@google-cloud/translate").v2;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

const FRENCH_BUREAUCRACY_SYSTEM: ChatMessageItem = {
  role: "system",
  content: `You are FranceGuide, a specialized assistant helping immigrants, expats, and refugees navigate French bureaucratic processes.

CORE EXPERTISE:
- CAF (Caisse d'Allocations Familiales) - family benefits, housing aid (APL, ALS), RSA
- CPAM (Caisse Primaire d'Assurance Maladie) - health insurance, Carte Vitale, medical reimbursements
- Prefecture procedures - residence permits, naturalization, visa renewals
- Employment services (Pôle Emploi) - job seeking, unemployment benefits
- Banking and financial services for newcomers
- Housing procedures and tenant rights
- Tax obligations and procedures
- Education system enrollment
- Social services and integration programs

RESPONSE STYLE:
- Keep answers concise and actionable (2-4 sentences max unless translating)
- Provide specific steps or requirements
- Mention required documents when relevant
- Include useful French terms in parentheses
- Suggest next actions or where to go
- For translations: provide complete, accurate translations maintaining original formatting

LANGUAGE SUPPORT:
- Detect user's preferred language and respond accordingly
- For document translations, maintain professional accuracy
- Explain French bureaucratic terms clearly

Always prioritize practical, immediately useful information over lengthy explanations.`,
};

// const SUPPORTED_LANGUAGES = [
//   "english",
//   "russian",
//   "portuguese",
//   "georgian",
//   "arabic",
//   "chinese",
//   "french",
// ];

// Enhanced context analysis
function analyzeUserContext(message: string, docContext?: string): string {
  const contexts = [];

  // Bureaucratic context detection
  if (
    /\b(caf|allocation|apl|als|rsa|famille)\b/i.test(
      message + (docContext || "")
    )
  ) {
    contexts.push("CAF_ASSISTANCE");
  }
  if (
    /\b(cpam|carte vitale|sécu|santé|médecin|remboursement)\b/i.test(
      message + (docContext || "")
    )
  ) {
    contexts.push("HEALTH_INSURANCE");
  }
  if (
    /\b(prefecture|titre de séjour|visa|naturalisation|carte de résident)\b/i.test(
      message + (docContext || "")
    )
  ) {
    contexts.push("RESIDENCE_PERMITS");
  }
  if (
    /\b(pôle emploi|chômage|travail|emploi|cv)\b/i.test(
      message + (docContext || "")
    )
  ) {
    contexts.push("EMPLOYMENT");
  }
  if (
    /\b(logement|bail|hlm|garant|caution)\b/i.test(message + (docContext || ""))
  ) {
    contexts.push("HOUSING");
  }
  if (
    /\b(banque|compte|rib|crédit|impôt)\b/i.test(message + (docContext || ""))
  ) {
    contexts.push("BANKING_TAXES");
  }
  if (
    /\b(école|université|inscription|éducation)\b/i.test(
      message + (docContext || "")
    )
  ) {
    contexts.push("EDUCATION");
  }

  return contexts.length > 0 ? `DETECTED_CONTEXTS: ${contexts.join(", ")}` : "";
}

// Check if request is for translation and extract target language
function isTranslationRequest(message: string): boolean {
  const translationKeywords = [
    "translate",
    "traduction",
    "traduire",
    "traducir",
    "ترجم",
    "what does this say",
    "que dit",
    "que significa",
    "explain this document",
    "expliquer ce document",
    "convert to",
    "in english",
    "in french",
    "in spanish",
    "in arabic",
    "en anglais",
    "en français",
    "en espagnol",
    "en arabe",
  ];

  return translationKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Extract target language from translation request
function extractTranslationLanguage(message: string): string | null {
  const languagePatterns = {
    // Your 7 supported languages
    english:
      /\b(to english|in english|en anglais|translate.*english|auf englisch)\b/i,
    french:
      /\b(to french|in french|en français|translate.*french|auf französisch)\b/i,
    japanese:
      /\b(to japanese|in japanese|en japonais|translate.*japanese|auf japanisch)\b/i,
    portuguese:
      /\b(to portuguese|in portuguese|en portugais|translate.*portuguese|auf portugiesisch)\b/i,
    georgian:
      /\b(to georgian|in georgian|en géorgien|translate.*georgian|auf georgisch)\b/i,
    arabic:
      /\b(to arabic|in arabic|en arabe|translate.*arabic|auf arabisch)\b/i,
    chinese:
      /\b(to chinese|in chinese|en chinois|translate.*chinese|auf chinesisch)\b/i,

    spanish:
      /\b(to spanish|in spanish|en espagnol|translate.*spanish|en español|auf spanisch)\b/i,
    german:
      /\b(to german|in german|en allemand|translate.*german|auf deutsch)\b/i,
    italian:
      /\b(to italian|in italian|en italien|translate.*italian|auf italienisch)\b/i,
    korean:
      /\b(to korean|in korean|en coréen|translate.*korean|auf koreanisch)\b/i,
    russian:
      /\b(to russian|in russian|en russe|translate.*russian|auf russisch)\b/i,
    hindi: /\b(to hindi|in hindi|translate.*hindi|auf hindi)\b/i,
    urdu: /\b(to urdu|in urdu|translate.*urdu|auf urdu)\b/i,
    turkish:
      /\b(to turkish|in turkish|en turc|translate.*turkish|auf türkisch)\b/i,
    dutch:
      /\b(to dutch|in dutch|en néerlandais|translate.*dutch|auf niederländisch)\b/i,
    polish:
      /\b(to polish|in polish|en polonais|translate.*polish|auf polnisch)\b/i,
  };

  for (const [language, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(message)) {
      return language;
    }
  }

  return null;
}

export async function askOpenAI(
  latest: string,
  context?: ChatMessageItem[],
  responseLanguage?: string,
  docContext?: string
): Promise<string> {
  try {
    const contextAnalysis = analyzeUserContext(latest, docContext);
    const isTranslation = isTranslationRequest(latest);
    const targetLanguage = extractTranslationLanguage(latest);

    // Determine final response language
    const finalLanguage =
      isTranslation && targetLanguage
        ? targetLanguage
        : responseLanguage || "english";


    // Build enhanced system message
    let enhancedSystemContent = FRENCH_BUREAUCRACY_SYSTEM.content;

    if (contextAnalysis) {
      enhancedSystemContent += `\n\nCURRENT CONTEXT: ${contextAnalysis}`;
    }

    // Language instruction based on mode
    if (isTranslation && targetLanguage) {
      enhancedSystemContent += `\n\nTRANSLATION MODE: Translate the document content to ${targetLanguage}. Provide complete, accurate translation and explain important French bureaucratic terms and procedures mentioned in the document.`;
    } else {
      enhancedSystemContent += `\n\nRESPONSE LANGUAGE: Respond in ${finalLanguage}. Include key French bureaucratic terms in parentheses for clarity.`;
    }

    const messages: ChatMessageItem[] = [
      { role: "system", content: enhancedSystemContent },
      ...(context ?? []),
    ];

    // Add document context with better formatting
    if (docContext) {
      const contextMessage = isTranslation
        ? `DOCUMENT TO TRANSLATE/ANALYZE:\n\n${docContext}`
        : `UPLOADED DOCUMENT CONTEXT (use this to answer questions):\n\n${docContext.substring(0, 2000)}${docContext.length > 2000 ? "..." : ""}`;

      messages.push({ role: "system", content: contextMessage });
    }

    messages.push({ role: "user", content: latest });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      temperature: isTranslation ? 0.3 : 0.7, // Lower temperature for translations
      max_tokens: isTranslation ? 1500 : 400, // More tokens for translations
    });

    const response = completion.choices?.[0]?.message?.content?.trim();

    if (!response) {
      return "I cannot respond right now. Can you rephrase your question?";
    }

    return response;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "Sorry, a technical error occurred. Please try again in a few moments.";
  }
}

export async function translateService(text: string, from: string, to: string) {
  try {
    const [translation] = await translate.translate(text, {
      from: from,
      to: to,
    });

    return {
      success: true,
      translatedText: translation,
    };
  } catch (error: any) {
    console.error("Translation error:", error);

    if (error.code === 400) {
      return {
        success: false,
        error:
          "Invalid translation request. Please check language codes and text.",
      };
    }

    if (error.code === 403) {
      return {
        success: false,
        error: "API key invalid or quota exceeded.",
      };
    }

    return {
      success: false,
      error: "Translation service temporarily unavailable",
    };
  }
}
