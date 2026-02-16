import type { EditorCore } from "../../editor-core"
import { BaseCommand } from "../index"

export class OrderedListCommand extends BaseCommand {
    id = 'ordered-list'

    execute(core: EditorCore) {
        core.mapSelectedLines((line, idx) => {
            const trimmed = line.trimStart()
            const prefixLen = line.length - trimmed.length

            return ' '.repeat(prefixLen) + `${idx + 1}. ${trimmed}`
        })
    }

}
