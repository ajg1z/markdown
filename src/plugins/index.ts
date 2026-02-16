import type { CommandRegistry } from "../commands/command-registry";
import type { EditorCore } from "../editor-core";
import type { KeyboardManager } from "../keyboard-manager";

export interface EditorPlugin {
    install(core: EditorCore, registry: CommandRegistry, keyboard: KeyboardManager): void
}