import type { CommandRegistry } from "./commands/command-registry"
import type { EditorCore } from "./editor-core"

class EditorController {
    constructor(
        private core: EditorCore,
        private commands: CommandRegistry
    ) { }

    executeCommand(id: string, options?: any) {
        const cmd = this.commands.get(id)
        if (!cmd) return

        this.core.run(() => {
            cmd.execute(this.core, options)
        })
    }

    undo() {
        this.core.undo()
    }

    redo() {
        this.core.redo()
    }
}

export { EditorController }