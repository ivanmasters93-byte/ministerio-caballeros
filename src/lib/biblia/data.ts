/**
 * Bible data utilities — reads from local static JSON files (public/biblia/books/).
 * Source: Reina Valera (public domain), split into per-book JSON.
 * NO external API dependency — 100% local, instant, offline-capable.
 */

export interface Versiculo {
  libro: string
  capitulo: number
  versiculo: number
  texto: string
  referencia: string
}

export interface CapituloData {
  libro: string
  capitulo: number
  versiculos: Versiculo[]
  textoCompleto: string
}

/**
 * Maps Spanish book names to the JSON file abbreviations.
 */
export const LIBRO_FILE_MAP: Record<string, string> = {
  'Génesis': 'gn', 'Éxodo': 'ex', 'Levítico': 'lv', 'Números': 'nm',
  'Deuteronomio': 'dt', 'Josué': 'js', 'Jueces': 'jud', 'Rut': 'rt',
  '1 Samuel': '1sm', '2 Samuel': '2sm', '1 Reyes': '1kgs', '2 Reyes': '2kgs',
  '1 Crónicas': '1ch', '2 Crónicas': '2ch', 'Esdras': 'ezr', 'Nehemías': 'ne',
  'Ester': 'et', 'Job': 'job', 'Salmos': 'ps', 'Proverbios': 'prv',
  'Eclesiastés': 'ec', 'Cantares': 'so', 'Isaías': 'is', 'Jeremías': 'jr',
  'Lamentaciones': 'lm', 'Ezequiel': 'ez', 'Daniel': 'dn', 'Oseas': 'ho',
  'Joel': 'jl', 'Amós': 'am', 'Abdías': 'ob', 'Jonás': 'jn',
  'Miqueas': 'mi', 'Nahúm': 'na', 'Habacuc': 'hk', 'Sofonías': 'zp',
  'Hageo': 'hg', 'Zacarías': 'zc', 'Malaquías': 'ml',
  'Mateo': 'mt', 'Marcos': 'mk', 'Lucas': 'lk', 'Juan': 'jo',
  'Hechos': 'act', 'Romanos': 'rm', '1 Corintios': '1co', '2 Corintios': '2co',
  'Gálatas': 'gl', 'Efesios': 'eph', 'Filipenses': 'ph', 'Colosenses': 'cl',
  '1 Tesalonicenses': '1ts', '2 Tesalonicenses': '2ts',
  '1 Timoteo': '1tm', '2 Timoteo': '2tm', 'Tito': 'tt', 'Filemón': 'phm',
  'Hebreos': 'hb', 'Santiago': 'jm', '1 Pedro': '1pe', '2 Pedro': '2pe',
  '1 Juan': '1jo', '2 Juan': '2jo', '3 Juan': '3jo', 'Judas': 'jd',
  'Apocalipsis': 're',
}

// Keep backward compatibility for any code using the old name
export const LIBRO_API_MAP = LIBRO_FILE_MAP

export function libroToApiName(nombreEspanol: string): string {
  return LIBRO_FILE_MAP[nombreEspanol] ?? nombreEspanol.toLowerCase()
}

export function libroToFileName(nombreEspanol: string): string {
  return LIBRO_FILE_MAP[nombreEspanol] ?? nombreEspanol.toLowerCase()
}

/**
 * Returns the URL path to the book's static JSON.
 */
export function getBookJsonPath(libro: string): string {
  const abbrev = libroToFileName(libro)
  return `/biblia/books/${abbrev}.json`
}

/**
 * @deprecated — bible-api.com is down. Use getBookJsonPath() instead.
 */
export function buildApiUrl(libro: string, capitulo: number, versiculo?: string): string {
  return getBookJsonPath(libro)
}
