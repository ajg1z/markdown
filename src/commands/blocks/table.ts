import type { EditorCore } from "../../editor-core"
import { BaseCommand } from "../index"

export class TableCommand extends BaseCommand {
    id = 'table'

    constructor(private rows = 2, private cols = 2) {
        super()
    }

    execute(core: EditorCore) {
        const header = `| ${Array(this.cols).fill('Header').join(' | ')} |`
        const divider = `| ${Array(this.cols).fill('---').join(' | ')} |`
        const body = Array(this.rows).fill(`| ${Array(this.cols).fill('Cell').join(' | ')} |`).join('\n')
        
        core.insertTextToSelection(`${header}\n${divider}\n${body}\n`)
    }
}
