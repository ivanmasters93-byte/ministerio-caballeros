/**
 * Bible data utilities for the integrated Bible module.
 * Verses are fetched from bible-api.com (free, no key required).
 * The Reina-Valera 1960 (RVR60) version is public domain.
 */

export const BIBLE_API_BASE = 'https://bible-api.com'
export const DEFAULT_VERSION = 'rvr1960'

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
 * Maps Spanish book names to bible-api.com URL-safe names.
 * bible-api.com accepts English book names in URLs.
 */
export const LIBRO_API_MAP: Record<string, string> = {
  'Génesis': 'genesis',
  'Éxodo': 'exodus',
  'Levítico': 'leviticus',
  'Números': 'numbers',
  'Deuteronomio': 'deuteronomy',
  'Josué': 'joshua',
  'Jueces': 'judges',
  'Rut': 'ruth',
  '1 Samuel': '1+samuel',
  '2 Samuel': '2+samuel',
  '1 Reyes': '1+kings',
  '2 Reyes': '2+kings',
  '1 Crónicas': '1+chronicles',
  '2 Crónicas': '2+chronicles',
  'Esdras': 'ezra',
  'Nehemías': 'nehemiah',
  'Ester': 'esther',
  'Job': 'job',
  'Salmos': 'psalms',
  'Proverbios': 'proverbs',
  'Eclesiastés': 'ecclesiastes',
  'Cantares': 'song+of+solomon',
  'Isaías': 'isaiah',
  'Jeremías': 'jeremiah',
  'Lamentaciones': 'lamentations',
  'Ezequiel': 'ezekiel',
  'Daniel': 'daniel',
  'Oseas': 'hosea',
  'Joel': 'joel',
  'Amós': 'amos',
  'Abdías': 'obadiah',
  'Jonás': 'jonah',
  'Miqueas': 'micah',
  'Nahúm': 'nahum',
  'Habacuc': 'habakkuk',
  'Sofonías': 'zephaniah',
  'Hageo': 'haggai',
  'Zacarías': 'zechariah',
  'Malaquías': 'malachi',
  'Mateo': 'matthew',
  'Marcos': 'mark',
  'Lucas': 'luke',
  'Juan': 'john',
  'Hechos': 'acts',
  'Romanos': 'romans',
  '1 Corintios': '1+corinthians',
  '2 Corintios': '2+corinthians',
  'Gálatas': 'galatians',
  'Efesios': 'ephesians',
  'Filipenses': 'philippians',
  'Colosenses': 'colossians',
  '1 Tesalonicenses': '1+thessalonians',
  '2 Tesalonicenses': '2+thessalonians',
  '1 Timoteo': '1+timothy',
  '2 Timoteo': '2+timothy',
  'Tito': 'titus',
  'Filemón': 'philemon',
  'Hebreos': 'hebrews',
  'Santiago': 'james',
  'Pedro': '1+peter',
  '1 Pedro': '1+peter',
  '2 Pedro': '2+peter',
  '1 Juan': '1+john',
  '2 Juan': '2+john',
  '3 Juan': '3+john',
  'Judas': 'jude',
  'Apocalipsis': 'revelation',
}

export function libroToApiName(nombreEspanol: string): string {
  return LIBRO_API_MAP[nombreEspanol] ?? nombreEspanol.toLowerCase().replace(/\s+/g, '+')
}

/**
 * Builds the bible-api.com URL for a chapter or verse range.
 */
export function buildApiUrl(libro: string, capitulo: number, versiculo?: string): string {
  const apiNombre = libroToApiName(libro)
  const ref = versiculo ? `${apiNombre}+${capitulo}:${versiculo}` : `${apiNombre}+${capitulo}`
  return `${BIBLE_API_BASE}/${ref}?translation=${DEFAULT_VERSION}&verse_numbers=true`
}
