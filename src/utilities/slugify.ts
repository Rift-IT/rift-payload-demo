// Maps Danish letters to ASCII so slugs stay readable for da content
// (æ→ae, ø→oe, å→aa). Harmless for English input.
const DANISH_MAP: Record<string, string> = {
  æ: 'ae',
  ø: 'oe',
  å: 'aa',
  Æ: 'ae',
  Ø: 'oe',
  Å: 'aa',
}

export const replaceDanishChars = (input: string): string =>
  input.replace(/[æøåÆØÅ]/g, (ch) => DANISH_MAP[ch] || ch)

const slugifyAscii = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugify = (input: string): string => {
  if (!input) return ''
  return slugifyAscii(replaceDanishChars(input))
}

// Returns `undefined` for nullish/empty input to match Payload's default
// slugify behaviour. An autosave draft on /admin/.../create has no title yet —
// returning '' would set data.slug = '' and trip the required-field validator.
export const slugifyForPayload = ({
  valueToSlugify,
}: {
  valueToSlugify?: string | null
}): string | undefined => {
  if (valueToSlugify == null || valueToSlugify === '') return undefined
  return slugify(valueToSlugify)
}
