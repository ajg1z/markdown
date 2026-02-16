import type { EditorSnapshot } from "../types"

class History {
    private undoStack: EditorSnapshot[] = []
    private redoStack: EditorSnapshot[] = []

    push(snapshot: EditorSnapshot) {
        this.undoStack.push(snapshot)
        this.redoStack = []
    }

    undo(current: EditorSnapshot): EditorSnapshot | null {
        const prev = this.undoStack.pop()
        if (!prev) return null
        this.redoStack.push(current)
        return prev
    }

    redo(current: EditorSnapshot): EditorSnapshot | null {
        const next = this.redoStack.pop()
        if (!next) return null
        this.undoStack.push(current)
        return next
    }

    canUndo() {
        return this.undoStack.length > 0
    }

    canRedo() {
        return this.redoStack.length > 0
    }
}


export { History }