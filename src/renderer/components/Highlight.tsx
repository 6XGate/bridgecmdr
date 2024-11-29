import { Comment, h, Text } from 'vue'

interface HighlightProps {
  text?: string
  search?: string
}

export default function Highlight({ text, search }: HighlightProps) {
  if (!text) return h(Comment, 'Nothing')
  if (!search) return h(Text, text)
  const start = text.indexOf(search)
  if (start === -1) return h(Text, text)
  const end = start + search.length

  return (
    <>
      <span class="v-autocomplete__unmask">{text.substring(0, start)}</span>
      <span class="v-autocomplete__mask">{text.substring(start, end)}</span>
      <span class="v-autocomplete__unmask">{text.substring(end)}</span>
    </>
  )
}
