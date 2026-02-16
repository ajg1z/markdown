import { BaseCommand } from "../index"
import type { EditorCore } from "../../editor-core"

export class QuoteCommand extends BaseCommand {
    id = 'quote'

    constructor(private wrapper: string = '>') {
        super()
    }

    execute(core: EditorCore) {
        core.mapSelectedLines(line => {
            return line.startsWith(this.wrapper) ? line.slice(this.wrapper.length) : this.wrapper + line
        })
    }
}
