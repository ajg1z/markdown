import { describe, it, expect, beforeEach } from 'vitest'
import { EditorCore } from '../../../editor-core'
import { QuoteCommand } from '../../blocks/quote'

describe('QuoteCommand', () => {
    let core: EditorCore

    beforeEach(() => {
        core = new EditorCore('Line 1\nLine 2\nLine 3')
    })

    it('should add > prefix to lines', () => {
        core.setSelection({ start: 0, end: 12 })
        const cmd = new QuoteCommand()
        
        cmd.execute(core)
        
        expect(core.getValue()).toBe('>Line 1\n>Line 2\nLine 3')
    })

    it('should remove > prefix if already present', () => {
        core = new EditorCore('>Line 1\n>Line 2\nLine 3')
        core.setSelection({ start: 0, end: 14 })
        const cmd = new QuoteCommand()
        
        cmd.execute(core)
        
        expect(core.getValue()).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should toggle quote on single line', () => {
        core = new EditorCore('Line 1\nLine 2')
        core.setSelection({ start: 0, end: 6 })
        const cmd = new QuoteCommand()
        
        cmd.execute(core)
        expect(core.getValue()).toBe('>Line 1\nLine 2')
        
        cmd.execute(core)
        expect(core.getValue()).toBe('Line 1\nLine 2')
    })

    it('should use custom wrapper if provided', () => {
        core.setSelection({ start: 0, end: 6 })
        const cmd = new QuoteCommand('|')
        
        cmd.execute(core)
        
        expect(core.getValue()).toBe('|Line 1\nLine 2\nLine 3')
    })
})
