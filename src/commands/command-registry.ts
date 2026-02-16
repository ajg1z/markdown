import type { EditorCommand } from "."
import type { EditorCore } from "../editor-core"

export class CommandRegistry {
    private commands = new Map<string, EditorCommand>()

    constructor(commands?: Record<string, EditorCommand>) {
        if (commands) {
            this.commands = new Map(Object.entries(commands))
        } else {
            this.commands = new Map<string, EditorCommand>()
        }
    }

    register(command: EditorCommand) {
        if (this.commands.has(command.id)) {
            throw new Error(`Command "${command.id}" already registered`)
        }
        this.commands.set(command.id, command)
    }

    execute(id: string, core: EditorCore) {
        const command = this.commands.get(id)
        if (!command) {
            throw new Error(`Command "${id}" not found`)
        }

        if (command.isEnabled && !command.isEnabled(core)) {
            return
        }

        command.execute(core)
    }

    get(id: string): EditorCommand | undefined {
        return this.commands.get(id)
    }
}
