import type { EditorCore } from "../../editor-core"
import { BaseCommand } from "../index"

export class ControlListCommand extends BaseCommand {
    id = 'control-list'

    execute(core: EditorCore) {
        core.mapSelectedLines(line => {
            const trimmed = line.trimStart()
            const prefixLen = line.length - trimmed.length
            
            return ' '.repeat(prefixLen) + '- [ ] ' + trimmed
        })
    }
}
