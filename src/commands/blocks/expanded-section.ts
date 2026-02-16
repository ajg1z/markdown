import { BaseCommand } from ".."
import type { EditorCore } from "../../editor-core"

export class ExpandedSectionCommand extends BaseCommand {
    id = 'expanded-section'

    execute(core: EditorCore) {
        const selectedText = core.getSelectionText()

        if (!selectedText.trim()) {
            core.replaceSelection('+++\n+++')
            return
        }

        core.replaceSelection(`+++${selectedText}\n+++`)
    }
}
