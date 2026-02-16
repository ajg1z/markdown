import { BaseCommand } from ".."
import type { EditorCore } from "../../editor-core"

export class ImageCommand extends BaseCommand {
    id = 'image'

    constructor(private srcProvider?: () => string) {
        super()
    }

    execute(core: EditorCore, options?: { src: string, alt: string, width?: number, height?: number }) {
        const src = options?.src ?? this.srcProvider?.() ?? ''
        const alt = options?.alt ?? core.getSelectionText() ?? ''

        core.replaceSelection(`![${alt}](${src})`)
    }
}
