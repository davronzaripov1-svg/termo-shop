// Тексты страниц из админки -> безопасный HTML.
// Основной формат — простая разметка:
//   # Заголовок / ## Подзаголовок
//   пустая строка — новый абзац
//   - пункт списка (или 1. пункт)
//   **жирный**, *курсив*, [текст](https://ссылка)
// Старые страницы в HTML (из seed.ts) тоже показываются, но через белый список тегов.

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Разрешаем только свои ссылки, http(s), почту и телефон */
function safeHref(href: string): string | null {
  const h = href.trim()
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(h) ? h : null
}

function inline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    // href уже экранирован escapeHtml — проверяем исходник без &amp;
    const url = safeHref(href.replace(/&amp;/g, "&"))
    if (!url) return label
    const external = /^https?:/i.test(url)
    return `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
  return s
}

function renderMarkup(text: string): string {
  const out: string[] = []
  type List = { tag: "ul" | "ol"; items: string[] }
  let list = null as List | null
  let para: string[] = []

  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join("<br>")}</p>`)
    para = []
  }
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`)
    list = null
  }

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim()
    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    const bullet = line.match(/^[-*•]\s+(.+)$/)
    const numbered = line.match(/^\d+[.)]\s+(.+)$/)

    if (!line) {
      flushPara()
      flushList()
    } else if (heading) {
      flushPara()
      flushList()
      // # на странице -> h2: h1 у страницы — её заголовок
      const level = Math.min(heading[1].length + 1, 4)
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
    } else if (bullet || numbered) {
      flushPara()
      const tag = bullet ? "ul" : "ol"
      // flushList меняет list в замыкании — TS этого не видит, поэтому читаем через переменную
      const current: List | null = list
      if (current?.tag !== tag) flushList()
      const target: List = current?.tag === tag ? current : (list = { tag, items: [] })
      target.items.push((bullet ?? numbered)![1])
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()
  return out.join("\n")
}

const ALLOWED_TAGS = new Set(["h1", "h2", "h3", "h4", "p", "br", "ul", "ol", "li", "b", "strong", "i", "em", "a", "blockquote"])

/** Белый список тегов; все атрибуты, кроме проверенного href у ссылок, выбрасываются */
function sanitizeHtml(html: string): string {
  const withoutDangerous = html.replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1\s*>/gi, "")
  const out: string[] = []
  const tagRe = /<\/?([a-zA-Z0-9]+)([^>]*)>/g
  let last = 0
  for (let m = tagRe.exec(withoutDangerous); m; m = tagRe.exec(withoutDangerous)) {
    // текст между тегами экранируем целиком
    out.push(escapeHtml(withoutDangerous.slice(last, m.index).replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (e) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " })[e]!)))
    last = tagRe.lastIndex
    const tag = m[1].toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) continue
    const closing = m[0].startsWith("</")
    if (closing) {
      if (tag !== "br") out.push(`</${tag}>`)
    } else if (tag === "a") {
      const href = m[2].match(/href\s*=\s*("([^"]*)"|'([^']*)')/i)
      const url = href ? safeHref(href[2] ?? href[3] ?? "") : null
      out.push(url ? `<a href="${escapeHtml(url)}" rel="noopener noreferrer">` : "<a>")
    } else {
      // h1 из старых страниц понижаем: заголовок страницы уже есть
      out.push(tag === "h1" ? "<h2>" : `<${tag}>`)
    }
  }
  out.push(escapeHtml(withoutDangerous.slice(last)))
  return out.join("").replace(/<\/h1>/g, "</h2>")
}

export function renderContent(content: string): string {
  return /^\s*</.test(content) ? sanitizeHtml(content) : renderMarkup(content)
}
