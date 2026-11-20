import type { CollectionBeforeValidateHook } from 'payload'

const PRESET_TO_CODE: Record<string, number> = {
  permanent: 301,
  temporary: 302,
  gone: 410,
}

/**
 * Keeps `statusCode` in sync with the friendly `statusPreset` selector. When
 * the preset is "advanced" the admin sets the code manually, so it's left
 * untouched.
 */
export const derivePathDefaults: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  const preset = data.statusPreset as string | undefined
  if (preset && preset !== 'advanced' && PRESET_TO_CODE[preset]) {
    data.statusCode = PRESET_TO_CODE[preset]
  }
  return data
}
