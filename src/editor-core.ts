import { History } from "./history/history"
import type { EditorSnapshot, EditorSubscriber, Selection } from "./types"

export class EditorCore {
    private value = ""
    private selection: Selection = { start: 0, end: 0 }

    private history = new History()
    private subscribers = new Set<EditorSubscriber>()

    constructor(value: string) {
        this.value = value
    }

    // защита от вложенных run
    private isRunning = false

    /* =======================
       Public API
    ======================= */

    getValue() {
        return this.value
    }

    getSelection(): Selection {
        return { ...this.selection }
    }

    getSelectionText() {
        return this.value.slice(this.selection.start, this.selection.end)
    }

    input(
        nextValue: string,
        nextSelection: Selection
    ) {
        this.run(() => {
            this.value = nextValue
            this.selection = nextSelection
        })
    }

    initValue(value: string, selection?: Selection) {
        this.value = value
        this.selection = selection || { start: 0, end: 0 }
        this.notify()
    }

    setSelection(selection: Selection) {
        this.selection = { ...selection }
    }

    /* =======================
       Transactions
    ======================= */

    run(action: () => void) {
        if (this.isRunning) {
            action()
            return
        }

        this.isRunning = true
        const before = this.snapshot()

        try {
            action()
        } catch (error) {
            console.error('Error in run', error)
        } finally {
            this.isRunning = false
        }

        const after = this.snapshot()
        this.isRunning = false

        if (!this.equals(before, after)) {
            this.history.push(before)
            this.notify()
        }
    }

    /* =======================
       History
    ======================= */

    undo() {
        const prev = this.history.undo(this.snapshot())
        if (!prev) return
        this.restore(prev)
        this.notify()
    }

    redo() {
        const next = this.history.redo(this.snapshot())
        if (!next) return
        this.restore(next)
        this.notify()
    }

    canUndo() {
        return this.history.canUndo()
    }

    canRedo() {
        return this.history.canRedo()
    }

    /* =======================
       Text operations
    ======================= */

    replaceSelection(text: string) {
        const { start, end } = this.selection

        this.value =
            this.value.slice(0, start) +
            text +
            this.value.slice(end)

        const cursor = start + text.length
        this.selection = { start: cursor, end: cursor }
    }

    wrapSelection(left: string, right = left) {
        const { start, end } = this.selection
        const selected = this.value.slice(start, end)

        this.replaceSelection(`${left}${selected}${right}`)
    }

    insertTextToSelection(text: string) {
        const { start, end } = this.selection
        this.value = this.value.slice(0, start) + text + this.value.slice(end)
        this.selection = { start: start + text.length, end: start + text.length }
    }

    /* =======================
       Subscription
    ======================= */

    subscribe(fn: EditorSubscriber) {
        this.subscribers.add(fn)
        return () => this.subscribers.delete(fn)
    }

    /* =======================
       Internals
    ======================= */

    private snapshot(): EditorSnapshot {
        return {
            value: this.value,
            selection: { ...this.selection }
        }
    }

    private restore(snapshot: EditorSnapshot) {
        this.value = snapshot.value
        this.selection = { ...snapshot.selection }
    }

    private notify() {
        const snap = this.snapshot()
        this.subscribers.forEach(fn => fn(snap))
    }

    private equals(a: EditorSnapshot, b: EditorSnapshot) {
        return (
            a.value === b.value &&
            a.selection.start === b.selection.start &&
            a.selection.end === b.selection.end
        )
    }

     /* =======================
       Lines
    ======================= */
    private getLines(): string[] {
        return this.value.split('\n')
    }

    getSelectedLines(): { lines: string[]; startLine: number; endLine: number } {
        const lines = this.getLines()
        const { start, end } = this.selection

        let charCount = 0
        let startLine = 0
        let endLine = lines.length - 1

        for (let i = 0; i < lines.length; i++) {
            const lineStart = charCount
            const lineEnd = charCount + lines[i].length

            if (start >= lineStart && start <= lineEnd) startLine = i
            if (end >= lineStart && end <= lineEnd) {
                endLine = i
                break
            }

            charCount += lines[i].length + 1 // +1 для \n
        }

        const selectedLines = lines.slice(startLine, endLine + 1)
        return { lines: selectedLines, startLine, endLine }
    }

    mapSelectedLines(fn: (line: string, index: number) => string) {
        const { lines, startLine, endLine } = this.getSelectedLines()
        const allLines = this.getLines()

        const newLines = lines.map(fn)
        allLines.splice(startLine, newLines.length, ...newLines)

        this.value = allLines.join('\n')

        // восстановим selection на этих же строках
        const startChar = allLines.slice(0, startLine).join('\n').length
        const endChar = startChar + newLines.join('\n').length
        this.selection = { start: endChar, end: endChar }
    }
}
