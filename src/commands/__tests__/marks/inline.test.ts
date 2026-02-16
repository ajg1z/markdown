import { describe, it, expect, beforeEach } from 'vitest'
import { EditorCore } from '../../../editor-core'
import { BoldCommand, ItalicCommand, CodeCommand, StrikethroughCommand } from '../../marks/inline'

describe('Inline Commands', () => {
    let core: EditorCore

    beforeEach(() => {
        core = new EditorCore('Hello world')
    })

    describe('BoldCommand', () => {
        it('should wrap selected text with **', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new BoldCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('**Hello** world')
        })

        it('should insert ** at cursor when no selection', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new BoldCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('Hello**** world')
        })

        it('should detect active state when text is wrapped', () => {
            core = new EditorCore('**Hello** world')
            core.setSelection({ start: 0, end: 9 })
            const cmd = new BoldCommand()
            
            expect(cmd.isActive(core)).toBe(true)
        })

        it('should not detect active state when text is not wrapped', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new BoldCommand()
            
            expect(cmd.isActive(core)).toBe(false)
        })

        it('should use custom wrapper if provided', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new BoldCommand('__')
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('__Hello__ world')
        })
    })

    describe('ItalicCommand', () => {
        it('should wrap selected text with _', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new ItalicCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('_Hello_ world')
        })

        it('should detect active state when text is wrapped', () => {
            core = new EditorCore('_Hello_ world')
            core.setSelection({ start: 0, end: 7 })
            const cmd = new ItalicCommand()
            
            expect(cmd.isActive(core)).toBe(true)
        })

        it('should use custom wrapper if provided', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new ItalicCommand('*')
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('*Hello* world')
        })
    })

    describe('CodeCommand', () => {
        it('should wrap selected text with `', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new CodeCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('`Hello` world')
        })

        it('should detect active state when text is wrapped', () => {
            core = new EditorCore('`Hello` world')
            core.setSelection({ start: 0, end: 7 })
            const cmd = new CodeCommand()
            
            expect(cmd.isActive(core)).toBe(true)
        })

        it('should use custom wrapper if provided', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new CodeCommand('```')
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('```Hello``` world')
        })
    })

    describe('StrikethroughCommand', () => {
        it('should wrap selected text with ~~', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new StrikethroughCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('~~Hello~~ world')
        })

        it('should detect active state when text is wrapped', () => {
            core = new EditorCore('~~Hello~~ world')
            core.setSelection({ start: 0, end: 9 })
            const cmd = new StrikethroughCommand()
            
            expect(cmd.isActive(core)).toBe(true)
        })

        it('should use custom wrapper if provided', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new StrikethroughCommand('--')
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('--Hello-- world')
        })
    })
})
