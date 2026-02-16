import { BaseCommand } from "../index"
import type { EditorCore } from "../../editor-core"

export abstract class WrapCommand extends BaseCommand {
    protected abstract wrapper: string

    execute(core: EditorCore) {
        core.run(() => {
            core.wrapSelection(this.wrapper)
        })
    }

    isActive(core: EditorCore) {
        const selectionText = core.getSelectionText()
        
        return (
            selectionText.startsWith(this.wrapper) &&
            selectionText.endsWith(this.wrapper)
        )
    }
}