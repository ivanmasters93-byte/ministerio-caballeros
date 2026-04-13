export interface LibroBiblia {
  id: number
  nombre: string
  abreviatura: string
  testamento: 'AT' | 'NT'
  capitulos: number
}

export const LIBROS_BIBLIA: LibroBiblia[] = [
  // Antiguo Testamento
  { id: 1, nombre: 'Génesis', abreviatura: 'Gn', testamento: 'AT', capitulos: 50 },
  { id: 2, nombre: 'Éxodo', abreviatura: 'Ex', testamento: 'AT', capitulos: 40 },
  { id: 3, nombre: 'Levítico', abreviatura: 'Lv', testamento: 'AT', capitulos: 27 },
  { id: 4, nombre: 'Números', abreviatura: 'Nm', testamento: 'AT', capitulos: 36 },
  { id: 5, nombre: 'Deuteronomio', abreviatura: 'Dt', testamento: 'AT', capitulos: 34 },
  { id: 6, nombre: 'Josué', abreviatura: 'Jos', testamento: 'AT', capitulos: 24 },
  { id: 7, nombre: 'Jueces', abreviatura: 'Jue', testamento: 'AT', capitulos: 21 },
  { id: 8, nombre: 'Rut', abreviatura: 'Rt', testamento: 'AT', capitulos: 4 },
  { id: 9, nombre: '1 Samuel', abreviatura: '1 S', testamento: 'AT', capitulos: 31 },
  { id: 10, nombre: '2 Samuel', abreviatura: '2 S', testamento: 'AT', capitulos: 24 },
  { id: 11, nombre: '1 Reyes', abreviatura: '1 R', testamento: 'AT', capitulos: 22 },
  { id: 12, nombre: '2 Reyes', abreviatura: '2 R', testamento: 'AT', capitulos: 25 },
  { id: 13, nombre: '1 Crónicas', abreviatura: '1 Cr', testamento: 'AT', capitulos: 29 },
  { id: 14, nombre: '2 Crónicas', abreviatura: '2 Cr', testamento: 'AT', capitulos: 36 },
  { id: 15, nombre: 'Esdras', abreviatura: 'Esd', testamento: 'AT', capitulos: 10 },
  { id: 16, nombre: 'Nehemías', abreviatura: 'Neh', testamento: 'AT', capitulos: 13 },
  { id: 17, nombre: 'Ester', abreviatura: 'Est', testamento: 'AT', capitulos: 10 },
  { id: 18, nombre: 'Job', abreviatura: 'Job', testamento: 'AT', capitulos: 42 },
  { id: 19, nombre: 'Salmos', abreviatura: 'Sal', testamento: 'AT', capitulos: 150 },
  { id: 20, nombre: 'Proverbios', abreviatura: 'Pr', testamento: 'AT', capitulos: 31 },
  { id: 21, nombre: 'Eclesiastés', abreviatura: 'Ec', testamento: 'AT', capitulos: 12 },
  { id: 22, nombre: 'Cantares', abreviatura: 'Cnt', testamento: 'AT', capitulos: 8 },
  { id: 23, nombre: 'Isaías', abreviatura: 'Is', testamento: 'AT', capitulos: 66 },
  { id: 24, nombre: 'Jeremías', abreviatura: 'Jer', testamento: 'AT', capitulos: 52 },
  { id: 25, nombre: 'Lamentaciones', abreviatura: 'Lm', testamento: 'AT', capitulos: 5 },
  { id: 26, nombre: 'Ezequiel', abreviatura: 'Ez', testamento: 'AT', capitulos: 48 },
  { id: 27, nombre: 'Daniel', abreviatura: 'Dn', testamento: 'AT', capitulos: 12 },
  { id: 28, nombre: 'Oseas', abreviatura: 'Os', testamento: 'AT', capitulos: 14 },
  { id: 29, nombre: 'Joel', abreviatura: 'Jl', testamento: 'AT', capitulos: 3 },
  { id: 30, nombre: 'Amós', abreviatura: 'Am', testamento: 'AT', capitulos: 9 },
  { id: 31, nombre: 'Abdías', abreviatura: 'Abd', testamento: 'AT', capitulos: 1 },
  { id: 32, nombre: 'Jonás', abreviatura: 'Jon', testamento: 'AT', capitulos: 4 },
  { id: 33, nombre: 'Miqueas', abreviatura: 'Mi', testamento: 'AT', capitulos: 7 },
  { id: 34, nombre: 'Nahúm', abreviatura: 'Nah', testamento: 'AT', capitulos: 3 },
  { id: 35, nombre: 'Habacuc', abreviatura: 'Hab', testamento: 'AT', capitulos: 3 },
  { id: 36, nombre: 'Sofonías', abreviatura: 'Sof', testamento: 'AT', capitulos: 3 },
  { id: 37, nombre: 'Hageo', abreviatura: 'Hag', testamento: 'AT', capitulos: 2 },
  { id: 38, nombre: 'Zacarías', abreviatura: 'Zac', testamento: 'AT', capitulos: 14 },
  { id: 39, nombre: 'Malaquías', abreviatura: 'Mal', testamento: 'AT', capitulos: 4 },
  // Nuevo Testamento
  { id: 40, nombre: 'Mateo', abreviatura: 'Mt', testamento: 'NT', capitulos: 28 },
  { id: 41, nombre: 'Marcos', abreviatura: 'Mr', testamento: 'NT', capitulos: 16 },
  { id: 42, nombre: 'Lucas', abreviatura: 'Lc', testamento: 'NT', capitulos: 24 },
  { id: 43, nombre: 'Juan', abreviatura: 'Jn', testamento: 'NT', capitulos: 21 },
  { id: 44, nombre: 'Hechos', abreviatura: 'Hch', testamento: 'NT', capitulos: 28 },
  { id: 45, nombre: 'Romanos', abreviatura: 'Ro', testamento: 'NT', capitulos: 16 },
  { id: 46, nombre: '1 Corintios', abreviatura: '1 Co', testamento: 'NT', capitulos: 16 },
  { id: 47, nombre: '2 Corintios', abreviatura: '2 Co', testamento: 'NT', capitulos: 13 },
  { id: 48, nombre: 'Gálatas', abreviatura: 'Gá', testamento: 'NT', capitulos: 6 },
  { id: 49, nombre: 'Efesios', abreviatura: 'Ef', testamento: 'NT', capitulos: 6 },
  { id: 50, nombre: 'Filipenses', abreviatura: 'Fil', testamento: 'NT', capitulos: 4 },
  { id: 51, nombre: 'Colosenses', abreviatura: 'Col', testamento: 'NT', capitulos: 4 },
  { id: 52, nombre: '1 Tesalonicenses', abreviatura: '1 Ts', testamento: 'NT', capitulos: 5 },
  { id: 53, nombre: '2 Tesalonicenses', abreviatura: '2 Ts', testamento: 'NT', capitulos: 3 },
  { id: 54, nombre: '1 Timoteo', abreviatura: '1 Ti', testamento: 'NT', capitulos: 6 },
  { id: 55, nombre: '2 Timoteo', abreviatura: '2 Ti', testamento: 'NT', capitulos: 4 },
  { id: 56, nombre: 'Tito', abreviatura: 'Tit', testamento: 'NT', capitulos: 3 },
  { id: 57, nombre: 'Filemón', abreviatura: 'Flm', testamento: 'NT', capitulos: 1 },
  { id: 58, nombre: 'Hebreos', abreviatura: 'He', testamento: 'NT', capitulos: 13 },
  { id: 59, nombre: 'Santiago', abreviatura: 'Stg', testamento: 'NT', capitulos: 5 },
  { id: 60, nombre: '1 Pedro', abreviatura: '1 P', testamento: 'NT', capitulos: 5 },
  { id: 61, nombre: '2 Pedro', abreviatura: '2 P', testamento: 'NT', capitulos: 3 },
  { id: 62, nombre: '1 Juan', abreviatura: '1 Jn', testamento: 'NT', capitulos: 5 },
  { id: 63, nombre: '2 Juan', abreviatura: '2 Jn', testamento: 'NT', capitulos: 1 },
  { id: 64, nombre: '3 Juan', abreviatura: '3 Jn', testamento: 'NT', capitulos: 1 },
  { id: 65, nombre: 'Judas', abreviatura: 'Jud', testamento: 'NT', capitulos: 1 },
  { id: 66, nombre: 'Apocalipsis', abreviatura: 'Ap', testamento: 'NT', capitulos: 22 },
]

export const LIBROS_AT = LIBROS_BIBLIA.filter((l) => l.testamento === 'AT')
export const LIBROS_NT = LIBROS_BIBLIA.filter((l) => l.testamento === 'NT')

export function getLibroPorId(id: number): LibroBiblia | undefined {
  return LIBROS_BIBLIA.find((l) => l.id === id)
}

export function getLibroPorNombre(nombre: string): LibroBiblia | undefined {
  const lower = nombre.toLowerCase()
  return LIBROS_BIBLIA.find(
    (l) =>
      l.nombre.toLowerCase() === lower ||
      l.abreviatura.toLowerCase() === lower
  )
}
