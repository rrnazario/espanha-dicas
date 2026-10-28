// Client-side search over /search.json with MiniSearch, opened from the navbar or Ctrl+K.
(() => {
  'use strict'

  const minisearchUrl = 'https://cdn.jsdelivr.net/npm/minisearch@6.3.0/dist/umd/index.min.js'
  const maxResults = 10

  const modalElement = document.querySelector('#searchModal')
  if (!modalElement) return

  const input = modalElement.querySelector('#searchInput')
  const results = modalElement.querySelector('#searchResults')
  const status = modalElement.querySelector('#searchStatus')
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement)

  // Lowercase and drop accents so "nacionalidade" matches "Nacionalidade" and "residencia" matches "residência"
  const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

  const escapeHtml = text => text.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char])

  const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Wraps matched terms in <mark>, comparing without accents
  const highlight = (text, terms) => {
    const escaped = escapeHtml(text)
    if (!terms.length) return escaped

    const normalized = normalize(escaped)
    const pattern = new RegExp(terms.map(escapeRegExp).join('|'), 'g')
    let html = ''
    let last = 0

    for (const match of normalized.matchAll(pattern)) {
      // Precomposed accented letters become one letter, so offsets line up with the original
      html += escaped.slice(last, match.index) +
        `<mark>${escaped.slice(match.index, match.index + match[0].length)}</mark>`
      last = match.index + match[0].length
    }

    return html + escaped.slice(last)
  }

  // A short piece of the post around the first matched term
  const excerpt = (content, terms) => {
    const normalized = normalize(content)
    const positions = terms.map(term => normalized.indexOf(term)).filter(index => index >= 0)
    if (!positions.length) return content.slice(0, 160)

    const start = Math.max(0, Math.min(...positions) - 60)
    const end = Math.min(content.length, start + 180)
    return `${start > 0 ? '…' : ''}${content.slice(start, end).trim()}${end < content.length ? '…' : ''}`
  }

  let indexPromise = null

  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.append(script)
  })

  // Loads MiniSearch and the index on first use
  const loadIndex = () => {
    indexPromise ??= Promise.all([
      window.MiniSearch ? null : loadScript(minisearchUrl),
      fetch(modalElement.dataset.index).then(response => response.json())
    ]).then(([, documents]) => {
      const index = new MiniSearch({
        fields: ['title', 'description', 'section', 'content'],
        storeFields: ['title', 'url', 'section', 'description', 'content'],
        processTerm: term => normalize(term),
        searchOptions: {
          boost: { title: 3, description: 2, section: 1.5 },
          prefix: true,
          fuzzy: 0.2,
          combineWith: 'AND'
        }
      })
      index.addAll(documents)
      return index
    })

    indexPromise.catch(() => { indexPromise = null })
    return indexPromise
  }

  let activeIndex = -1

  const setActive = index => {
    const items = [...results.querySelectorAll('a')]
    if (!items.length) return

    activeIndex = (index + items.length) % items.length
    items.forEach((item, i) => {
      item.classList.toggle('active', i === activeIndex)
      item.setAttribute('aria-selected', i === activeIndex)
    })
    items[activeIndex].scrollIntoView({ block: 'nearest' })
  }

  const render = (query, hits) => {
    activeIndex = -1
    const terms = [...new Set(normalize(query).split(/\s+/).filter(Boolean))]

    if (!query.trim()) {
      results.innerHTML = ''
      status.textContent = 'Digite para pesquisar.'
      return
    }

    if (!hits.length) {
      results.innerHTML = ''
      status.textContent = `Nenhum resultado para "${query.trim()}".`
      return
    }

    status.textContent = hits.length === 1 ? '1 resultado' : `${hits.length} resultados`
    results.innerHTML = hits.slice(0, maxResults).map(hit => `
      <li>
        <a class="bd-search-result d-block rounded p-2 text-decoration-none" href="${escapeHtml(hit.url)}" role="option" aria-selected="false">
          ${hit.section ? `<small class="d-block text-body-secondary">${escapeHtml(hit.section)}</small>` : ''}
          <span class="d-block fw-semibold">${highlight(hit.title, terms)}</span>
          <small class="d-block text-body-secondary">${highlight(excerpt(hit.content, terms), terms)}</small>
        </a>
      </li>`).join('')
    setActive(0)
  }

  let searchToken = 0

  const search = async () => {
    const query = input.value
    const token = ++searchToken

    if (!query.trim()) {
      render(query, [])
      return
    }

    try {
      const index = await loadIndex()
      if (token !== searchToken) return // a newer search already started
      render(query, index.search(query))
    } catch {
      results.innerHTML = ''
      status.textContent = 'Não foi possível carregar a pesquisa. Tente novamente.'
    }
  }

  input.addEventListener('input', search)

  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(activeIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(activeIndex - 1)
    } else if (event.key === 'Enter') {
      const active = results.querySelectorAll('a')[activeIndex]
      if (active) {
        event.preventDefault()
        window.location.href = active.href
      }
    }
  })

  modalElement.addEventListener('show.bs.modal', loadIndex)
  modalElement.addEventListener('shown.bs.modal', () => {
    input.focus()
    input.select()
  })

  // Ctrl+K / Cmd+K, and "/" when not typing somewhere else
  document.addEventListener('keydown', event => {
    const typing = event.target instanceof Element &&
      event.target.closest('input, textarea, select, [contenteditable="true"]')
    const shortcut = (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) ||
      (event.key === '/' && !typing)

    if (shortcut) {
      event.preventDefault()
      modal.show()
    }
  })
})()
