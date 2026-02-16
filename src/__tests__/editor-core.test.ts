import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EditorCore } from '../editor-core'

describe('EditorCore', () => {
    let core: EditorCore

    beforeEach(() => {
        core = new EditorCore('')
    })

    describe('Constructor and Basic Getters', () => {
        it('should initialize with empty value', () => {
            expect(core.getValue()).toBe('')
            expect(core.getSelection()).toEqual({ start: 0, end: 0 })
        })

        it('should initialize with provided value', () => {
            const coreWithValue = new EditorCore('Hello world')
            expect(coreWithValue.getValue()).toBe('Hello world')
        })

        it('should return copy of selection', () => {
            core.setSelection({ start: 5, end: 10 })
            const selection1 = core.getSelection()
            const selection2 = core.getSelection()
            
            expect(selection1).toEqual({ start: 5, end: 10 })
            expect(selection1).not.toBe(selection2)
        })

        it('should get selected text', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 0, end: 5 })
            expect(core.getSelectionText()).toBe('Hello')
        })

        it('should return empty string when no selection', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 5, end: 5 })
            expect(core.getSelectionText()).toBe('')
        })
    })

    describe('input()', () => {
        it('should update value and selection', () => {
            core.input('New text', { start: 4, end: 8 })
            
            expect(core.getValue()).toBe('New text')
            expect(core.getSelection()).toEqual({ start: 4, end: 8 })
        })

        it('should save to history', () => {
            core.input('Initial', { start: 0, end: 0 })
            core.input('Updated', { start: 0, end: 0 })
            
            expect(core.canUndo()).toBe(true)
            core.undo()
            expect(core.getValue()).toBe('Initial')
        })
    })

    describe('initValue()', () => {
        it('should set value and selection', () => {
            core.initValue('New value', { start: 3, end: 6 })
            
            expect(core.getValue()).toBe('New value')
            expect(core.getSelection()).toEqual({ start: 3, end: 6 })
        })

        it('should use default selection if not provided', () => {
            core.initValue('New value')
            
            expect(core.getValue()).toBe('New value')
            expect(core.getSelection()).toEqual({ start: 0, end: 0 })
        })

        it('should notify subscribers', () => {
            const subscriber = vi.fn()
            core.subscribe(subscriber)
            
            core.initValue('New value')
            
            expect(subscriber).toHaveBeenCalledTimes(1)
            expect(subscriber).toHaveBeenCalledWith({
                value: 'New value',
                selection: { start: 0, end: 0 }
            })
        })
    })

    describe('setSelection()', () => {
        it('should update selection', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 2, end: 7 })
            
            expect(core.getSelection()).toEqual({ start: 2, end: 7 })
        })

        it('should create copy of selection', () => {
            const selection = { start: 5, end: 10 }
            core.setSelection(selection)
            selection.start = 0
            
            expect(core.getSelection()).toEqual({ start: 5, end: 10 })
        })
    })

    describe('run() - Transactions', () => {
        it('should execute action', () => {
            core.run(() => {
                core.replaceSelection('test')
            })
            
            expect(core.getValue()).toBe('test')
        })

        it('should save to history when value changes', () => {
            core = new EditorCore('initial')
            core.run(() => {
                core.replaceSelection('changed')
            })
            
            expect(core.canUndo()).toBe(true)
            core.undo()
            expect(core.getValue()).toBe('initial')
        })

        it('should not save to history when nothing changes', () => {
            core = new EditorCore('test')
            core.run(() => {
                // ничего не меняем
            })
            
            expect(core.canUndo()).toBe(false)
        })

        it('should handle nested run calls', () => {
            const subscriber = vi.fn()
            core.subscribe(subscriber)
            
            core.run(() => {
                core.run(() => {
                    core.replaceSelection('nested')
                })
            })
            
            expect(core.getValue()).toBe('nested')
            expect(subscriber).toHaveBeenCalledTimes(1)
        })

        it('should notify subscribers after change', () => {
            const subscriber = vi.fn()
            core.subscribe(subscriber)
            
            core.run(() => {
                core.replaceSelection('test')
            })
            
            expect(subscriber).toHaveBeenCalledTimes(1)
            expect(subscriber).toHaveBeenCalledWith({
                value: 'test',
                selection: { start: 4, end: 4 }
            })
        })
    })

    describe('undo() / redo()', () => {
        it('should undo last change', () => {
            core = new EditorCore('initial')
            core.input('first', { start: 0, end: 0 })
            core.input('second', { start: 0, end: 0 })
            
            core.undo()
            expect(core.getValue()).toBe('first')
            
            core.undo()
            expect(core.getValue()).toBe('initial')
        })

        it('should not undo when history is empty', () => {
            core = new EditorCore('test')
            core.undo()
            
            expect(core.getValue()).toBe('test')
        })

        it('should redo after undo', () => {
            core = new EditorCore('initial')
            core.input('first', { start: 0, end: 0 })
            core.input('second', { start: 0, end: 0 })
            
            core.undo()
            expect(core.getValue()).toBe('first')
            
            core.redo()
            expect(core.getValue()).toBe('second')
        })

        it('should not redo when no undo was done', () => {
            core = new EditorCore('test')
            core.input('changed', { start: 0, end: 0 })
            
            expect(core.canRedo()).toBe(false)
            core.redo()
            expect(core.getValue()).toBe('changed')
        })

        it('should clear redo stack on new change', () => {
            core = new EditorCore('initial')
            core.input('first', { start: 0, end: 0 })
            core.input('second', { start: 0, end: 0 })
            
            core.undo()
            expect(core.canRedo()).toBe(true)
            
            core.input('third', { start: 0, end: 0 })
            expect(core.canRedo()).toBe(false)
        })

        it('should restore selection on undo', () => {
            core = new EditorCore('initial')
            core.input('first', { start: 2, end: 4 })
            core.input('second', { start: 0, end: 0 })
            
            core.undo()
            expect(core.getSelection()).toEqual({ start: 2, end: 4 })
        })
    })

    describe('canUndo() / canRedo()', () => {
        it('should return false initially', () => {
            expect(core.canUndo()).toBe(false)
            expect(core.canRedo()).toBe(false)
        })

        it('should return true after change', () => {
            core.input('test', { start: 0, end: 0 })
            expect(core.canUndo()).toBe(true)
        })

        it('should return true after undo', () => {
            core.input('test', { start: 0, end: 0 })
            core.undo()
            expect(core.canRedo()).toBe(true)
        })
    })

    describe('replaceSelection()', () => {
        it('should replace selected text', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 6, end: 11 })
            core.replaceSelection('universe')
            
            expect(core.getValue()).toBe('Hello universe')
            expect(core.getSelection()).toEqual({ start: 14, end: 14 })
        })

        it('should insert text at cursor position', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 5, end: 5 })
            core.replaceSelection(' beautiful')
            
            expect(core.getValue()).toBe('Hello beautiful world')
        })

        it('should handle empty selection', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 0, end: 0 })
            core.replaceSelection('Hi ')
            
            expect(core.getValue()).toBe('Hi Hello world')
        })
    })

    describe('wrapSelection()', () => {
        it('should wrap selected text', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 0, end: 5 })
            core.wrapSelection('**')
            
            expect(core.getValue()).toBe('**Hello** world')
            expect(core.getSelection()).toEqual({ start: 9, end: 9 })
        })

        it('should wrap with different left and right', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 0, end: 5 })
            core.wrapSelection('[', ']')
            
            expect(core.getValue()).toBe('[Hello] world')
        })

        it('should insert wrapper at cursor when no selection', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 5, end: 5 })
            core.wrapSelection('**')
            
            expect(core.getValue()).toBe('Hello**** world')
            expect(core.getSelection()).toEqual({ start: 9, end: 9 })
        })
    })

    describe('insertTextToSelection()', () => {
        it('should insert text at selection', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 5, end: 5 })
            core.insertTextToSelection(' beautiful')
            
            expect(core.getValue()).toBe('Hello beautiful world')
            expect(core.getSelection()).toEqual({ start: 15, end: 15 })
        })

        it('should replace selected text', () => {
            core = new EditorCore('Hello world')
            core.setSelection({ start: 0, end: 5 })
            core.insertTextToSelection('Hi')
            
            expect(core.getValue()).toBe('Hi world')
            expect(core.getSelection()).toEqual({ start: 2, end: 2 })
        })
    })

    describe('subscribe() / notify()', () => {
        it('should call subscriber on change', () => {
            const subscriber = vi.fn()
            core.subscribe(subscriber)
            
            core.input('test', { start: 0, end: 0 })
            
            expect(subscriber).toHaveBeenCalledTimes(1)
        })

        it('should call multiple subscribers', () => {
            const subscriber1 = vi.fn()
            const subscriber2 = vi.fn()
            
            core.subscribe(subscriber1)
            core.subscribe(subscriber2)
            
            core.input('test', { start: 0, end: 0 })
            
            expect(subscriber1).toHaveBeenCalledTimes(1)
            expect(subscriber2).toHaveBeenCalledTimes(1)
        })

        it('should return unsubscribe function', () => {
            const subscriber = vi.fn()
            const unsubscribe = core.subscribe(subscriber)
            
            core.input('first', { start: 0, end: 0 })
            expect(subscriber).toHaveBeenCalledTimes(1)
            
            unsubscribe()
            core.input('second', { start: 0, end: 0 })
            expect(subscriber).toHaveBeenCalledTimes(1)
        })

        it('should pass snapshot to subscriber', () => {
            const subscriber = vi.fn()
            core.subscribe(subscriber)
            
            core.input('test', { start: 2, end: 4 })
            
            expect(subscriber).toHaveBeenCalledWith({
                value: 'test',
                selection: { start: 2, end: 4 }
            })
        })
    })

    describe('getSelectedLines()', () => {
        it('should return selected lines', () => {
            core = new EditorCore('Line 1\nLine 2\nLine 3')
            core.setSelection({ start: 0, end: 12 })
            
            const result = core.getSelectedLines()
            
            expect(result.lines).toEqual(['Line 1', 'Line 2'])
            expect(result.startLine).toBe(0)
            expect(result.endLine).toBe(1)
        })

        it('should handle single line selection', () => {
            core = new EditorCore('Line 1\nLine 2\nLine 3')
            core.setSelection({ start: 0, end: 6 })
            
            const result = core.getSelectedLines()
            
            expect(result.lines).toEqual(['Line 1'])
            expect(result.startLine).toBe(0)
            expect(result.endLine).toBe(0)
        })

        it('should handle empty selection', () => {
            core = new EditorCore('Line 1\nLine 2')
            core.setSelection({ start: 3, end: 3 })
            
            const result = core.getSelectedLines()
            
            expect(result.lines).toEqual(['Line 1'])
            expect(result.startLine).toBe(0)
            expect(result.endLine).toBe(0)
        })
    })

    describe('mapSelectedLines()', () => {
        it('should transform selected lines', () => {
            core = new EditorCore('Line 1\nLine 2\nLine 3')
            core.setSelection({ start: 0, end: 12 })
            
            core.mapSelectedLines(line => `> ${line}`)
            
            expect(core.getValue()).toBe('> Line 1\n> Line 2\nLine 3')
        })

        it('should update selection after mapping', () => {
            core = new EditorCore('Line 1\nLine 2')
            core.setSelection({ start: 0, end: 6 })
            
            core.mapSelectedLines(line => `# ${line}`)
            
            const selection = core.getSelection()
            expect(selection.start).toBeGreaterThan(0)
            expect(selection.end).toBe(selection.start)
        })

        it('should handle empty lines', () => {
            core = new EditorCore('Line 1\n\nLine 3')
            core.setSelection({ start: 0, end: 13 })
            
            core.mapSelectedLines(line => line ? `- ${line}` : line)
            
            expect(core.getValue()).toBe('- Line 1\n\n- Line 3')
        })
    })
})
