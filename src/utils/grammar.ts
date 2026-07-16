/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export type GuideStyle = 'gentle' | 'challenger' | 'strategic' | 'inspirational';

/**
 * Resolves any stored/undefined guideStyle preference down to a real value.
 * Defaults to 'inspirational' since that's the tone the app opens with today.
 */
export function resolveGuideStyle(pref?: GuideStyle): GuideStyle {
  return pref ?? 'inspirational';
}

export type ToneVariants = Record<GuideStyle, string>;

/**
 * Picks the right tone variant of a Renata-voice string (guidance, letters,
 * SOS comfort text, milestone copy) for the user's guideStyle preference.
 * This is a full-string swap (each style is a differently-written message),
 * unlike adaptMessage's inline [bracket] word swap for grammar gender.
 * The two compose: pickTone() first, then adaptMessage() on the result.
 */
export function pickTone(
  content: Record<Language, ToneVariants>,
  lang: Language,
  style: GuideStyle
): string {
  const variants = content[lang] || content.pt;
  return variants[style] ?? variants.inspirational;
}

/**
 * The 'neutral' grammar forms (e.g. "pronte", "preparade") aren't standard
 * Portuguese/Spanish words, so the Neutral option is hidden from Settings.
 * This resolves any stored preference — including legacy 'neutral' values —
 * down to a real word choice, defaulting to feminine.
 */
export function resolveGrammarPreference(
  pref?: 'feminine' | 'masculine' | 'neutral'
): 'feminine' | 'masculine' {
  return pref === 'masculine' ? 'masculine' : 'feminine';
}

/**
 * Automatically adapts grammar in text based on user preference (feminine, masculine, neutral).
 * Supports the [feminine/masculine/neutral] bracket notation.
 * Example: "Você está [pronta/pronto/preparade] para voar."
 * - Feminine: "Você está pronta para voar."
 * - Masculine: "Você está pronto para voar."
 * - Neutral: "Você está preparade para voar."
 */
export function adaptMessage(
  text: string,
  grammar: 'feminine' | 'masculine' | 'neutral' = 'feminine',
  lang: Language = 'pt'
): string {
  if (!text) return '';

  // 1. Process bracketed variations: [fem/masc/neut]
  let result = text.replace(/\[([^\]]+)\]/g, (match, choicesStr) => {
    const choices = choicesStr.split('/');
    if (choices.length >= 3) {
      if (grammar === 'feminine') return choices[0].trim();
      if (grammar === 'masculine') return choices[1].trim();
      return choices[2].trim(); // neutral
    } else if (choices.length === 2) {
      if (grammar === 'feminine') return choices[0].trim();
      // For 2 options, we check if neutral can fallback to choice[1] (masculine) or choice[0]
      if (grammar === 'masculine') return choices[1].trim();
      return choices[1].trim(); // default fallback for neutral
    }
    return choices[0] || match;
  });

  // 2. Perform subtle auto-replacements for common words if brackets aren't explicitly provided,
  // to ensure adaptive grammar is applied even on legacy/unmarked administrator content.
  if (lang === 'pt') {
    if (grammar === 'neutral') {
      // replace common feminine/masculine suffixes safely
      result = result
        .replace(/\b(bem-vinda|bem-vindo)\b/gi, 'bem-vinde')
        .replace(/\b(preparada|preparado)\b/gi, 'preparade')
        .replace(/\b(segura|seguro)\b/gi, 'segure')
        .replace(/\b(estimulada|estimulado)\b/gi, 'estimulade')
        .replace(/\b(comprometida|comprometido)\b/gi, 'comprometide')
        .replace(/\b(conectada|conectado)\b/gi, 'conectade')
        .replace(/\b(inspirada|inspirado)\b/gi, 'inspirade')
        .replace(/\b(orgulhosa|orgulhoso)\b/gi, 'orgulhose');
    } else if (grammar === 'feminine') {
      result = result
        .replace(/\b(bem-vindo|bem-vinde)\b/gi, 'bem-vinda')
        .replace(/\b(preparado|preparade)\b/gi, 'preparada')
        .replace(/\b(seguro|segure)\b/gi, 'segura')
        .replace(/\b(estimulado|estimulade)\b/gi, 'estimulada')
        .replace(/\b(comprometido|comprometide)\b/gi, 'comprometida')
        .replace(/\b(conectado|conectade)\b/gi, 'conectada')
        .replace(/\b(inspirado|inspirade)\b/gi, 'inspirada')
        .replace(/\b(orgulhoso|orgulhose)\b/gi, 'orgulhosa');
    } else {
      result = result
        .replace(/\b(bem-vinda|bem-vinde)\b/gi, 'bem-vindo')
        .replace(/\b(preparada|preparade)\b/gi, 'preparado')
        .replace(/\b(segura|segure)\b/gi, 'seguro')
        .replace(/\b(estimulada|estimulade)\b/gi, 'estimulado')
        .replace(/\b(comprometida|comprometide)\b/gi, 'comprometido')
        .replace(/\b(conectada|conectade)\b/gi, 'conectado')
        .replace(/\b(inspirada|inspirade)\b/gi, 'inspirado')
        .replace(/\b(orgulhosa|orgulhose)\b/gi, 'orgulhoso');
    }
  } else if (lang === 'es') {
    if (grammar === 'neutral') {
      result = result
        .replace(/\b(bienvenida|bienvenido)\b/gi, 'bienvenide')
        .replace(/\b(preparada|preparado)\b/gi, 'preparade')
        .replace(/\b(segura|seguro)\b/gi, 'segure')
        .replace(/\b(comprometida|comprometido)\b/gi, 'comprometide')
        .replace(/\b(conectada|conectado)\b/gi, 'conectade')
        .replace(/\b(inspirada|inspirado)\b/gi, 'inspirade')
        .replace(/\b(orgullosa|orgulloso)\b/gi, 'orgullose');
    } else if (grammar === 'feminine') {
      result = result
        .replace(/\b(bienvenido|bienvenide)\b/gi, 'bienvenida')
        .replace(/\b(preparado|preparade)\b/gi, 'preparada')
        .replace(/\b(seguro|segure)\b/gi, 'segura')
        .replace(/\b(comprometido|comprometide)\b/gi, 'comprometida')
        .replace(/\b(conectado|conectade)\b/gi, 'conectada')
        .replace(/\b(inspirado|inspirade)\b/gi, 'inspirada')
        .replace(/\b(orgulloso|orgullose)\b/gi, 'orgullosa');
    } else {
      result = result
        .replace(/\b(bienvenida|bienvenide)\b/gi, 'bienvenido')
        .replace(/\b(preparada|preparade)\b/gi, 'preparado')
        .replace(/\b(segura|segure)\b/gi, 'seguro')
        .replace(/\b(comprometida|comprometide)\b/gi, 'comprometido')
        .replace(/\b(conectada|conectade)\b/gi, 'conectado')
        .replace(/\b(inspirada|inspirade)\b/gi, 'inspirado')
        .replace(/\b(orgullosa|orgullose)\b/gi, 'orgulloso');
    }
  }

  return result;
}
