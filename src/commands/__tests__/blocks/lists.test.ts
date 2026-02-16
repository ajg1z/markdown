import { describe, it, expect, beforeEach } from 'vitest'
import { EditorCore } from '../../../editor-core'
import { OrderedListCommand } from '../../blocks/ordered-list'
import { UnorderedListCommand } from '../../blocks/unordered-list'
import { ControlListCommand } from '../../blocks/control-list'

describe('List Commands', () => {
    let core: EditorCore

    beforeEach(() => {
        core = new EditorCore('Line 1\nLine 2\nLine 3')
    })

    describe('UnorderedListCommand', () => {
        it('should add - prefix to lines', () => {
            core.setSelection({ start: 0, end: 12 })
            const cmd = new UnorderedListCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('- Line 1\n- Line 2\nLine 3')
        })

        it('should preserve indentation', () => {
            core = new EditorCore('  Line 1\n    Line 2')
            core.setSelection({ start: 0, end: 18 })
            const cmd = new UnorderedListCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('  - Line 1\n    - Line 2')
        })
    })

    describe('OrderedListCommand', () => {
        it('should add numbered prefix to lines', () => {
            core.setSelection({ start: 0, end: 12 })
            const cmd = new OrderedListCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('1. Line 1\n2. Line 2\nLine 3')
        })

        it('should preserve indentation', () => {
            core = new EditorCore('  Line 1\n    Line 2')
            core.setSelection({ start: 0, end: 18 })
            const cmd = new OrderedListCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('  1. Line 1\n    2. Line 2')
        })

        it('should number lines sequentially', () => {
            core = new EditorCore('First\nSecond\nThird')
            core.setSelection({ start: 0, end: 18 })
            const cmd = new OrderedListCommand()
            
            cmd.execute(core)
            
            const lines = core.getValue().split('\n')
            expect(lines[0]).toBe('1. First')
            expect(lines[1]).toBe('2. Second')
            expect(lines[2]).toBe('3. Third')
        })
    })

    describe('ControlListCommand', () => {
        it('should add - [ ] prefix to lines', () => {
            core.setSelection({ start: 0, end: 12 })
            const cmd = new ControlListCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('- [ ] Line 1\n- [ ] Line 2\nLine 3')
        })

        it('should preserve indentation', () => {
            core = new EditorCore('  Line 1\n    Line 2')
            core.setSelection({ start: 0, end: 18 })
            const cmd = new ControlListCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('  - [ ] Line 1\n    - [ ] Line 2')
        })
    })
})
