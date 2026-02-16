import type { EditorCore } from "../editor-core"

export interface EditorCommand {
    id: string
    execute(core: EditorCore, options?: any): void
    isEnabled?(core: EditorCore): boolean
    isActive?(core: EditorCore): boolean
}

export abstract class BaseCommand implements EditorCommand {
    abstract id: string
    abstract execute(core: EditorCore, options?: any): void

    isEnabled(core: EditorCore) {
        return  true
    }

    isActive(core: EditorCore) {
        return false
    }
}


