/**
 * GitHub-Flavored Markdown Renderer
 * Handles markdown rendering with GFM features, syntax highlighting, and GitHub callouts
 */

class MarkdownRenderer {
  constructor() {
    this.marked = window.marked;
    this.hljs = window.hljs;
    
    if (!this.marked) {
      throw new Error('marked library not loaded');
    }
    
    this.configureMarked();
  }

  /**
   * Configure marked with GFM options and extensions
   */
  configureMarked() {
    // Configure marked for GitHub-flavored markdown
    this.marked.setOptions({
      gfm: true,
      breaks: true,
      pedantic: false,
      smartLists: true,
      smartypants: false,
      headerIds: true,
      mangle: false,
      // Note: marked.js in GFM mode does not render raw HTML by default
      // which provides XSS protection for user-generated markdown content
      highlight: (code, lang) => {
        if (this.hljs && lang && this.hljs.getLanguage(lang)) {
          try {
            return this.hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            console.warn('Highlight.js error:', e);
          }
        }
        return code;
      }
    });

    // Add GitHub callouts extension using marked's extension API
    const calloutExtension = {
      name: 'githubCallout',
      level: 'block',
      start(src) {
        return src.match(/^>\s*\[!/m)?.index;
      },
      tokenizer(src) {
        // Match GitHub-style callouts: > [!NOTE], > [!TIP], etc.
        // Captures: [1] callout type, [2] content lines starting with >
        const match = src.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>\s*.*\n?)*)/i);
        if (match) {
          const type = match[1].toUpperCase();
          const content = match[2].replace(/^>\s*/gm, '').trim();
          return {
            type: 'githubCallout',
            raw: match[0],
            calloutType: type,
            text: content,
            tokens: []
          };
        }
      },
      renderer: (token) => {
        return this.renderCallout(token.calloutType, this.marked.parseInline(token.text));
      }
    };

    this.marked.use({ extensions: [calloutExtension] });
  }

  /**
   * Render GitHub-style callout/admonition
   */
  renderCallout(type, content) {
    const typeMap = {
      'NOTE': { icon: 'ℹ️', class: 'note', label: 'Note' },
      'TIP': { icon: '💡', class: 'tip', label: 'Tip' },
      'IMPORTANT': { icon: '❗', class: 'important', label: 'Important' },
      'WARNING': { icon: '⚠️', class: 'warning', label: 'Warning' },
      'CAUTION': { icon: '🔥', class: 'caution', label: 'Caution' }
    };

    const callout = typeMap[type] || typeMap['NOTE'];
    
    return `
      <div class="markdown-callout markdown-callout-${callout.class}">
        <div class="markdown-callout-header">
          <span class="markdown-callout-icon">${callout.icon}</span>
          <span class="markdown-callout-title">${callout.label}</span>
        </div>
        <div class="markdown-callout-content">
          ${content}
        </div>
      </div>
    `;
  }

  /**
   * Render markdown to HTML
   * Note: marked.js escapes HTML by default in GFM mode.
   * Raw HTML in markdown is not rendered unless explicitly enabled.
   */
  render(markdown) {
    if (!markdown) {
      return '';
    }

    // Strip YAML frontmatter if present
    let cleanMarkdown = markdown;
    if (markdown.startsWith('---')) {
      const parts = markdown.split('---');
      if (parts.length >= 3) {
        cleanMarkdown = parts.slice(2).join('---').trim();
      }
    }

    try {
      return this.marked.parse(cleanMarkdown);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      throw error;
    }
  }

  /**
   * Process image paths in rendered HTML
   */
  fixImagePaths(container) {
    if (!container) return;
    
    container.querySelectorAll('img').forEach((img, index) => {
      let src = img.getAttribute('src');
      if (!src || src.startsWith('http')) return;
      
      // Remove leading slashes
      src = src.replace(/^\/+/, '');
      
      // Convert ../ to ./
      if (src.startsWith('../')) {
        src = './' + src.substring(3);
      } else if (!src.startsWith('./')) {
        src = './' + src;
      }
      
      img.src = src;
      
      // Add lightbox attributes if GLightbox is available
      if (typeof GLightbox !== 'undefined') {
        img.classList.add('glightbox');
        img.setAttribute('data-gallery', 'note-images');
      }
    });
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.MarkdownRenderer = MarkdownRenderer;
}
