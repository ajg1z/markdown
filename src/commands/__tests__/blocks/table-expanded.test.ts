import { describe, it, expect, beforeEach } from 'vitest'
import { EditorCore } from '../../../editor-core'
import { TableCommand } from '../../blocks/table'
import { ExpandedSectionCommand } from '../../blocks/expanded-section'

describe('Table and Expanded Section Commands', () => {
    let core: EditorCore

    beforeEach(() => {
        core = new EditorCore('Hello world')
    })

    describe('TableCommand', () => {
        it('should create 2x2 table by default', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new TableCommand()
            
            cmd.execute(core)
            
            const value = core.getValue()
            expect(value).toContain('| Header | Header |')
            expect(value).toContain('| --- | --- |')
            expect(value).toContain('| Cell | Cell |')
        })

        it('should create table with custom dimensions', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new TableCommand(3, 4)
            
            cmd.execute(core)
            
            const lines = core.getValue().split('\n')
            const headerLine = lines.find(line => line.includes('Header'))
            const cellCount = (headerLine?.match(/\|/g) || []).length - 1
            expect(cellCount).toBe(4)
            
            const cellLines = lines.filter(line => line.includes('Cell'))
            expect(cellLines.length).toBe(3)
        })

        it('should insert table at selection position', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new TableCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toContain('Hello| Header')
        })
    })

    describe('ExpandedSectionCommand', () => {
        it('should wrap selected text with +++ markers', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new ExpandedSectionCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('+++Hello\n+++ world')
        })

        it('should insert empty section when no selection', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new ExpandedSectionCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('Hello+++\n+++ world')
        })

        it('should handle empty text selection', () => {
            core = new EditorCore('')
            core.setSelection({ start: 0, end: 0 })
            const cmd = new ExpandedSectionCommand()
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('+++\n+++')
        })

        it('should handle multiline selection', () => {
            core = new EditorCore('Line 1\nLine 2\nLine 3')
            // Выделяем "Line 1\nLine 2" (0 до начала "Line 3" = 13 символов)
            core.setSelection({ start: 0, end: 13 })
            const cmd = new ExpandedSectionCommand()
            
            cmd.execute(core)
            
            // getSelectionText() возвращает "Line 1\nLine 2", команда вставляет +++ в начало и \n+++ в конец
            // replaceSelection заменяет выделенный текст на +++Line 1\nLine 2\n+++
            expect(core.getValue()).toBe('+++Line 1\nLine 2\n+++\nLine 3')
        })
    })
})
