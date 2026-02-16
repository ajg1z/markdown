import { BaseCommand } from ".."
import type { EditorCore } from "../../editor-core"

export class LinkCommand extends BaseCommand {
    id = 'link'

    constructor(private urlProvider?: () => string) {
        super()
    }

    execute(core: EditorCore, options?: { url: string, text: string }) {
        const url = options?.url ?? this.urlProvider?.() ?? ''
        const text = options?.text ?? core.getSelectionText() ?? ''

        core.replaceSelection(`[${text}](${url})`)
    }
}
