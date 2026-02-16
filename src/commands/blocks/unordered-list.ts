import { BaseCommand } from "../index"
import type { EditorCore } from "../../editor-core"

export class UnorderedListCommand extends BaseCommand {
    id = 'unordered-list'

    execute(core: EditorCore) {
        core.mapSelectedLines(line => {
            const trimmed = line.trimStart()
            const prefixLen = line.length - trimmed.length

            return ' '.repeat(prefixLen) + '- ' + trimmed
        })
    }
}
