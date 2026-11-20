/**
 * Minimal builders for Lexical rich-text JSON, so seed content can be written
 * as plain strings instead of hand-written editor state.
 */
type TextNode = {
  type: 'text'
  text: string
  format: number
  detail: 0
  mode: 'normal'
  style: ''
  version: 1
}

const text = (value: string): TextNode => ({
  type: 'text',
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const element = (type: string, children: TextNode[], extra: Record<string, unknown> = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

export const heading = (value: string, tag: 'h2' | 'h3' = 'h2') =>
  element('heading', [text(value)], { tag })

export const paragraph = (value: string) =>
  element('paragraph', [text(value)], { textFormat: 0, textStyle: '' })

export const richText = (...children: ReturnType<typeof element>[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
