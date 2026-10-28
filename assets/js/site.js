// Docs behaviors: theme toggle, "Nesta página" list, heading anchors and copy buttons.
(() => {
  'use strict'

  // Theme (light / dark / auto). The initial theme is set by the inline script
  // in <head> so the page never flashes the wrong colors.
  const storageKey = 'theme'

  const getStoredTheme = () => {
    try { return localStorage.getItem(storageKey) } catch { return null }
  }

  const setStoredTheme = theme => {
    try { localStorage.setItem(storageKey, theme) } catch { /* private mode */ }
  }

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

  const applyTheme = theme => {
    const resolved = theme === 'auto' ? (prefersDark() ? 'dark' : 'light') : theme
    document.documentElement.setAttribute('data-bs-theme', resolved)
  }

  const showActiveTheme = theme => {
    const toggle = document.querySelector('#bd-theme')
    if (!toggle) return

    document.querySelectorAll('[data-bs-theme-value]').forEach(button => {
      const isActive = button.getAttribute('data-bs-theme-value') === theme
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-pressed', isActive)
      if (isActive) {
        toggle.querySelector('.theme-icon-active').className =
          `bi ${button.dataset.icon} theme-icon-active`
      }
    })
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const stored = getStoredTheme() || 'auto'
    if (stored === 'auto') applyTheme('auto')
  })

  const initThemeToggle = () => {
    showActiveTheme(getStoredTheme() || 'auto')

    document.querySelectorAll('[data-bs-theme-value]').forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.getAttribute('data-bs-theme-value')
        setStoredTheme(theme)
        applyTheme(theme)
        showActiveTheme(theme)
      })
    })
  }

  // "Nesta página": built from the h2/h3 headings of the post.
  const initToc = () => {
    const toc = document.querySelector('#bdToc')
    const nav = document.querySelector('#TableOfContents')
    const content = document.querySelector('.bd-content')
    if (!toc || !nav || !content) return

    const headings = [...content.querySelectorAll('h2, h3')]
    if (headings.length < 2) return

    const root = document.createElement('ul')
    let lastItem = null

    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `secao-${index + 1}`

      const item = document.createElement('li')
      const link = document.createElement('a')
      link.href = `#${heading.id}`
      link.textContent = heading.textContent.trim()
      item.append(link)

      if (heading.tagName === 'H3' && lastItem) {
        let sublist = lastItem.querySelector('ul')
        if (!sublist) {
          sublist = document.createElement('ul')
          lastItem.append(sublist)
        }
        sublist.append(item)
      } else {
        root.append(item)
        lastItem = item
      }
    })

    nav.append(root)
    toc.classList.remove('d-none')

    // Close the mobile dropdown after picking a section
    nav.addEventListener('click', event => {
      const collapse = document.querySelector('#tocContents')
      if (event.target.closest('a') && collapse?.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(collapse).hide()
      }
    })

    initScrollSpy(nav, headings)
  }

  // Highlights the heading currently in view. Bootstrap's ScrollSpy is not used
  // because it looks sections up with querySelector, which throws on kramdown
  // ids that start with a digit (e.g. "1-solicitar-autorização").
  const initScrollSpy = (nav, headings) => {
    const links = new Map(
      [...nav.querySelectorAll('a')].map(link => [decodeURIComponent(link.hash.slice(1)), link])
    )
    const visible = new Set()

    const setActive = id => {
      links.forEach((link, linkId) => link.classList.toggle('active', linkId === id))
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      })

      // Topmost visible heading wins; above the first one, nothing is active
      const current = headings.find(heading => visible.has(heading))
      if (current) setActive(current.id)
    }, { rootMargin: '0px 0px -60% 0px' })

    headings.forEach(heading => observer.observe(heading))
  }

  // "#" link after each heading so sections can be shared
  const initAnchors = () => {
    document.querySelectorAll('.bd-content :is(h2, h3, h4)[id]').forEach(heading => {
      const anchor = document.createElement('a')
      anchor.className = 'anchor-link'
      anchor.href = `#${heading.id}`
      anchor.setAttribute('aria-label', `Link para esta seção: ${heading.textContent.trim()}`)
      anchor.textContent = '#'
      heading.append(anchor)
    })
  }

  // Copy button on code blocks
  const initCopyButtons = () => {
    if (!navigator.clipboard) return

    document.querySelectorAll('.bd-content pre').forEach(pre => {
      const wrapper = pre.closest('.highlighter-rouge') || pre
      wrapper.classList.add('bd-code-snippet')

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'btn btn-sm btn-clipboard'
      button.setAttribute('aria-label', 'Copiar')
      button.innerHTML = '<i class="bi bi-clipboard"></i>'

      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText)
          button.innerHTML = '<i class="bi bi-check2"></i>'
        } catch {
          button.innerHTML = '<i class="bi bi-x-lg"></i>'
        }
        setTimeout(() => { button.innerHTML = '<i class="bi bi-clipboard"></i>' }, 2000)
      })

      wrapper.prepend(button)
    })
  }

  window.addEventListener('DOMContentLoaded', () => {
    initThemeToggle()
    initToc() // before initAnchors, so the "#" isn't copied into the list
    initAnchors()
    initCopyButtons()
  })
})()
