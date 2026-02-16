import { ControlListCommand } from '../commands/blocks/control-list'
import { ExpandedSectionCommand } from '../commands/blocks/expanded-section'
import { ImageCommand } from '../commands/blocks/image'
import { LinkCommand } from '../commands/blocks/link'
import { OrderedListCommand } from '../commands/blocks/ordered-list'
import { QuoteCommand } from '../commands/blocks/quote'
import { TableCommand } from '../commands/blocks/table'
import { UnorderedListCommand } from '../commands/blocks/unordered-list'
import { CommandRegistry } from '../commands/command-registry'
import { BoldCommand, CodeCommand, ItalicCommand, StrikethroughCommand } from '../commands/marks/inline'
import { EditorController } from '../editor-controller'
import { EditorCore } from '../editor-core'
import MarkdownIt from 'markdown-it'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItExpandedSection from 'markdown-it-collapsible'
import { KeyboardManager } from '../keyboard-manager'

const editor = document.getElementById('editor') as HTMLTextAreaElement
const preview = document.getElementById('preview')!
const toolbar = document.getElementById('toolbar')!
const linkForm = document.getElementById('link-form')!
const linkTextInput = document.getElementById('link-text') as HTMLInputElement
const linkUrlInput = document.getElementById('link-url') as HTMLInputElement
const linkSubmit = document.getElementById('link-submit')!
const linkCancel = document.getElementById('link-cancel')!
const imageForm = document.getElementById('image-form')!
const imageAltInput = document.getElementById('image-alt') as HTMLInputElement
const imageSrcInput = document.getElementById('image-src') as HTMLInputElement
const imageSubmit = document.getElementById('image-submit')!
const imageCancel = document.getElementById('image-cancel')!

const core = new EditorCore(editor.value)

const commands = new CommandRegistry({
    bold: new BoldCommand(),
    italic: new ItalicCommand(),
    code: new CodeCommand(),
    strikethrough: new StrikethroughCommand(),
    link: new LinkCommand(),
    image: new ImageCommand(),
    quote: new QuoteCommand(),
    'ordered-list': new OrderedListCommand(),
    'unordered-list': new UnorderedListCommand(),
    'control-list': new ControlListCommand(),
    'expanded-section': new ExpandedSectionCommand(),
    table: new TableCommand(2, 2),
})

const controller = new EditorController(core, commands)

const keyboardManager = new KeyboardManager(controller)

keyboardManager.registerShortcut('ctrl+shift+b', 'bold')
keyboardManager.registerShortcut('Ctrl+I', 'italic')
keyboardManager.registerShortcut('Ctrl+K', 'code')
keyboardManager.registerShortcut('Ctrl+S', 'strikethrough')
keyboardManager.registerShortcut('Ctrl+Q', 'quote')
keyboardManager.registerShortcut('Ctrl+U', 'unordered-list')
keyboardManager.registerShortcut('Ctrl+O', 'ordered-list')
keyboardManager.registerShortcut('Ctrl+G', 'control-list')

let currentMode: 'editor' | 'preview' = 'editor'

const md = new MarkdownIt({
    breaks: true,
})

md.use(markdownItTaskLists, { enabled: true,  })
md.use(markdownItExpandedSection, { enabled: true,  })


function updatePreview() {
    const value = core.getValue()
    preview.innerHTML = md.render(value)
}

core.subscribe((snapshot) => {
    if (editor.value !== snapshot.value) {
        editor.value = snapshot.value
    }

    if (editor.selectionStart !== snapshot.selection.start || editor.selectionEnd !== snapshot.selection.end) {
        editor.setSelectionRange(snapshot.selection.start, snapshot.selection.end)
    }

    updatePreview()
})

function setMode(mode: 'editor' | 'preview') {
    currentMode = mode

    const editorButton = toolbar.querySelector('[data-mode="editor"]') as HTMLButtonElement
    const previewButton = toolbar.querySelector('[data-mode="preview"]') as HTMLButtonElement

    if (mode === 'editor') {
        editor.classList.remove('hidden')
        preview.classList.remove('visible')
        editorButton.classList.add('active')
        previewButton.classList.remove('active')
        editor.focus()
    } else {
        editor.classList.add('hidden')
        preview.classList.add('visible')
        editorButton.classList.remove('active')
        previewButton.classList.add('active')
        updatePreview()
    }
}

editor.addEventListener('input', () => {
    const newValue = editor.value
    const oldValue = core.getValue()

    const start = editor.selectionStart
    const end = editor.selectionEnd

    if (newValue !== oldValue) {
        core.input(newValue, { start, end })
    }
})

editor.addEventListener('select', () => {
    core.setSelection({ start: editor.selectionStart, end: editor.selectionEnd })
})

editor.addEventListener('click', () => {
    core.setSelection({ start: editor.selectionStart, end: editor.selectionEnd })
})

editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
            e.preventDefault()
            controller.undo()
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
            e.preventDefault()
            controller.redo()
        }
    }
})

function showLinkForm() {
    linkForm.classList.add('visible')
    const selectedText = core.getSelectionText()
    linkTextInput.value = selectedText || ''
    linkUrlInput.value = ''
    linkUrlInput.focus()
}

function hideLinkForm() {
    linkForm.classList.remove('visible')
    linkTextInput.value = ''
    linkUrlInput.value = ''
}

function addLink() {
    const text = linkTextInput.value.trim()
    const url = linkUrlInput.value.trim()

    if (!url) {
        alert('Введите URL')
        return
    }

    if (currentMode === 'preview') {
        setMode('editor')
    }

    editor.focus()


    controller.executeCommand('link', { url, text })

    hideLinkForm()
}

function showImageForm() {
    imageForm.classList.add('visible')
    const selectedText = core.getSelectionText()
    imageAltInput.value = selectedText || ''
    imageSrcInput.value = ''
    imageSrcInput.focus()
}

function hideImageForm() {
    imageForm.classList.remove('visible')
    imageAltInput.value = ''
    imageSrcInput.value = ''
}

function addImage() {
    const alt = imageAltInput.value.trim()
    const src = imageSrcInput.value.trim()

    if (!src) {
        alert('Введите URL изображения')
        return
    }

    if (currentMode === 'preview') {
        setMode('editor')
    }

    editor.focus()

    core.setSelection({ start: editor.selectionStart, end: editor.selectionEnd })

    controller.executeCommand('image', { src, alt })

    hideImageForm()
}

toolbar.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('button')
    if (!button) return

    const action = button.dataset.action
    if (!action) return

    if (action === 'toggle-mode') {
        const mode = button.dataset.mode as 'editor' | 'preview'
        setMode(mode)
        return
    }

    if (action === 'add-link') {
        showLinkForm()
        return
    }

    if (action === 'add-image') {
        showImageForm()
        return
    }

    if (currentMode === 'preview') {
        setMode('editor')
    }

    editor.focus()

    core.setSelection({ start: editor.selectionStart, end: editor.selectionEnd })

    if (action === 'bold' || action === 'italic' || action === 'code' || action === 'strikethrough' ||
        action === 'quote' || action === 'ordered-list' || action === 'unordered-list' || action === 'control-list' ||
        action === 'expanded-section' || action === 'table') {
        controller.executeCommand(action)
    } else if (action === 'undo') {
        controller.undo()
    } else if (action === 'redo') {
        controller.redo()
    }
})

linkSubmit.addEventListener('click', addLink)

linkCancel.addEventListener('click', hideLinkForm)

linkForm.addEventListener('submit', (e) => {
    e.preventDefault()
    addLink()
})

linkUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        addLink()
    } else if (e.key === 'Escape') {
        hideLinkForm()
    }
})

imageSubmit.addEventListener('click', addImage)

imageCancel.addEventListener('click', hideImageForm)

imageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    addImage()
})

imageSrcInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        addImage()
    } else if (e.key === 'Escape') {
        hideImageForm()
    }
})

setMode('editor')
