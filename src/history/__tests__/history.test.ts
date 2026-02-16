import { describe, it, expect, beforeEach } from 'vitest'
import { History } from '../history'
import type { EditorSnapshot } from '../../types'

describe('History', () => {
    let history: History

    beforeEach(() => {
        history = new History()
    })

    describe('push()', () => {
        it('should add snapshot to undo stack', () => {
            const snapshot: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            history.push(snapshot)

            expect(history['canUndo']()).toBe(true)
        })

        it('should clear redo stack', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.undo(snapshot2)
            expect(history['canRedo']()).toBe(true)

            const snapshot3: EditorSnapshot = {
                value: 'third',
                selection: { start: 0, end: 5 }
            }
            history.push(snapshot3)

            expect(history['canRedo']()).toBe(false)
        })

        it('should allow multiple pushes', () => {
            const snapshots: EditorSnapshot[] = [
                { value: 'first', selection: { start: 0, end: 5 } },
                { value: 'second', selection: { start: 0, end: 6 } },
                { value: 'third', selection: { start: 0, end: 5 } }
            ]

            snapshots.forEach(snapshot => history.push(snapshot))

            expect(history['canUndo']()).toBe(true)
        })
    })

    describe('undo()', () => {
        it('should return previous snapshot', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)

            const result = history.undo(snapshot2)

            expect(result).toEqual(snapshot2)
        })

        it('should add current snapshot to redo stack', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)

            history.undo(snapshot2)

            expect(history['canRedo']()).toBe(true)
        })

        it('should return null when undo stack is empty', () => {
            const current: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            const result = history.undo(current)

            expect(result).toBeNull()
        })

        it('should not add to redo stack when undo stack is empty', () => {
            const current: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            history.undo(current)

            expect(history['canRedo']()).toBe(false)
        })

        it('should handle multiple undos', () => {
            const snapshots: EditorSnapshot[] = [
                { value: 'first', selection: { start: 0, end: 5 } },
                { value: 'second', selection: { start: 0, end: 6 } },
                { value: 'third', selection: { start: 0, end: 5 } }
            ]

            snapshots.forEach(snapshot => history.push(snapshot))

            const result1 = history.undo(snapshots[2])
            expect(result1).toEqual(snapshots[2])

            const result2 = history.undo(snapshots[1])
            expect(result2).toEqual(snapshots[1])

            const result3 = history.undo(snapshots[0])
            expect(result3).toEqual(snapshots[0])

            const result4 = history.undo(snapshots[0])
            expect(result4).toBeNull()
        })
    })

    describe('redo()', () => {
        it('should return next snapshot', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.undo(snapshot2)

            const result = history.redo(snapshot1)

            expect(result).toEqual(snapshot2)
        })

        it('should add current snapshot to undo stack', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.undo(snapshot2)

            history.redo(snapshot1)

            expect(history['canUndo']()).toBe(true)
        })

        it('should return null when redo stack is empty', () => {
            const current: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            const result = history.redo(current)

            expect(result).toBeNull()
        })

        it('should not add to undo stack when redo stack is empty', () => {
            const current: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            history.redo(current)

            expect(history['canUndo']()).toBe(false)
        })

        it('should handle multiple redos', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }
            const snapshot3: EditorSnapshot = {
                value: 'third',
                selection: { start: 0, end: 5 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.push(snapshot3)

            const undo1 = history.undo(snapshot3)
            expect(undo1).toEqual(snapshot3)
            
            const undo2 = history.undo(snapshot2)
            expect(undo2).toEqual(snapshot2)
            
            const undo3 = history.undo(snapshot1)
            expect(undo3).toEqual(snapshot1)

            const result1 = history.redo(snapshot1)
            expect(result1).toEqual(snapshot1)

            const result2 = history.redo(snapshot1)
            expect(result2).toEqual(snapshot2)

            const result3 = history.redo(snapshot2)
            expect(result3).toEqual(snapshot3)

            const result4 = history.redo(snapshot3)
            expect(result4).toBeNull()
        })
    })

    describe('canUndo()', () => {
        it('should return false initially', () => {
            expect(history['canUndo']()).toBe(false)
        })

        it('should return true after push', () => {
            const snapshot: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            history.push(snapshot)

            expect(history['canUndo']()).toBe(true)
        })

        it('should return false after undo when stack is empty', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)

            history.undo(snapshot2)
            history.undo(snapshot1)

            expect(history['canUndo']()).toBe(false)
        })

        it('should return true after redo', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.undo(snapshot2)
            history.redo(snapshot1)

            expect(history['canUndo']()).toBe(true)
        })
    })

    describe('canRedo()', () => {
        it('should return false initially', () => {
            expect(history['canRedo']()).toBe(false)
        })

        it('should return false after push', () => {
            const snapshot: EditorSnapshot = {
                value: 'test',
                selection: { start: 0, end: 4 }
            }

            history.push(snapshot)

            expect(history['canRedo']()).toBe(false)
        })

        it('should return true after undo', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.undo(snapshot2)

            expect(history['canRedo']()).toBe(true)
        })

        it('should return false after redo when stack is empty', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.undo(snapshot2)
            history.redo(snapshot1)

            expect(history['canRedo']()).toBe(false)
        })
    })

    describe('integration', () => {
        it('should handle full undo/redo cycle', () => {
            const snapshots: EditorSnapshot[] = [
                { value: 'initial', selection: { start: 0, end: 7 } },
                { value: 'first change', selection: { start: 0, end: 12 } },
                { value: 'second change', selection: { start: 0, end: 13 } },
                { value: 'third change', selection: { start: 0, end: 12 } }
            ]

            history.push(snapshots[0])
            history.push(snapshots[1])
            history.push(snapshots[2])
            history.push(snapshots[3])

            expect(history['canUndo']()).toBe(true)
            expect(history['canRedo']()).toBe(false)

            const undo1 = history.undo(snapshots[3])
            expect(undo1).toEqual(snapshots[3])
            expect(history['canRedo']()).toBe(true)

            const undo2 = history.undo(snapshots[2])
            expect(undo2).toEqual(snapshots[2])
            expect(history['canRedo']()).toBe(true)

            const undo3 = history.undo(snapshots[1])
            expect(undo3).toEqual(snapshots[1])
            expect(history['canRedo']()).toBe(true)

            const redo1 = history.redo(snapshots[0])
            expect(redo1).toEqual(snapshots[1])
            expect(history['canUndo']()).toBe(true)

            const redo2 = history.redo(snapshots[1])
            expect(redo2).toEqual(snapshots[2])
            expect(history['canUndo']()).toBe(true)

            const redo3 = history.redo(snapshots[2])
            expect(redo3).toEqual(snapshots[3])
            expect(history['canUndo']()).toBe(true)
            expect(history['canRedo']()).toBe(false)
        })

        it('should clear redo stack on new push after undo', () => {
            const snapshot1: EditorSnapshot = {
                value: 'first',
                selection: { start: 0, end: 5 }
            }
            const snapshot2: EditorSnapshot = {
                value: 'second',
                selection: { start: 0, end: 6 }
            }
            const snapshot3: EditorSnapshot = {
                value: 'third',
                selection: { start: 0, end: 5 }
            }

            history.push(snapshot1)
            history.push(snapshot2)
            history.undo(snapshot2)
            expect(history['canRedo']()).toBe(true)

            history.push(snapshot3)
            expect(history['canRedo']()).toBe(false)
        })
    })
})
