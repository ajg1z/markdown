
import type { EditorController } from "./editor-controller"

type ShortcutMap = Record<string, string> // 'Ctrl+B' -> 'bold'

export class KeyboardManager {
    private shortcuts: ShortcutMap
    private controller: EditorController

    constructor(controller: EditorController, outerContainer = false) {
        this.controller = controller
        this.shortcuts = {}

        if (!outerContainer) {
            window.addEventListener('keydown', this.onKeyDown)
        }
    }

    unregister() {
        window.removeEventListener('keydown', this.onKeyDown)
    }

    registerShortcut(keyCombo: string, commandId: string) {
        this.shortcuts[keyCombo.toLowerCase()] = commandId
    }

    onKeyDown = (e: KeyboardEvent) => {
        const combo = [
            e.ctrlKey ? 'ctrl' : '',
            e.shiftKey ? 'shift' : '',
            e.altKey ? 'alt' : '',
            e.key.toLowerCase()
        ].filter(Boolean).join('+')

        const cmdId = this.shortcuts[combo]

        if (cmdId) {
            e.preventDefault()
            e.stopPropagation()
            this.controller.executeCommand(cmdId)
        }
    }
}
