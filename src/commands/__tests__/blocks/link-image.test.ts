import { describe, it, expect, beforeEach } from 'vitest'
import { EditorCore } from '../../../editor-core'
import { LinkCommand } from '../../blocks/link'
import { ImageCommand } from '../../blocks/image'

describe('Link and Image Commands', () => {
    let core: EditorCore

    beforeEach(() => {
        core = new EditorCore('Hello world')
    })

    describe('LinkCommand', () => {
        it('should create link from selected text', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new LinkCommand()
            
            cmd.execute(core, { url: 'https://example.com' , text: 'Hello' })
            
            expect(core.getValue()).toBe('[Hello](https://example.com) world')
        })

        it('should use provided text in options', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new LinkCommand()
            
            cmd.execute(core, { url: 'https://example.com', text: 'Click here' })
            
            expect(core.getValue()).toBe('[Click here](https://example.com) world')
        })

        it('should use urlProvider if no url in options', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new LinkCommand(() => 'https://default.com')
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('[Hello](https://default.com) world')
        })

        it('should use empty text if no selection', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new LinkCommand()
            
            cmd.execute(core, { url: 'https://example.com' , text: '' })
            
            expect(core.getValue()).toBe('Hello[](https://example.com) world')
        })
    })

    describe('ImageCommand', () => {
        it('should create image from selected text as alt', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new ImageCommand()
            
            cmd.execute(core, { src: 'https://example.com/image.jpg' , alt: 'Hello' })
            
            expect(core.getValue()).toBe('![Hello](https://example.com/image.jpg) world')
        })

        it('should use provided alt in options', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new ImageCommand()
            
            cmd.execute(core, { src: 'https://example.com/image.jpg', alt: 'Image description' })
            
            expect(core.getValue()).toBe('![Image description](https://example.com/image.jpg) world')
        })

        it('should use srcProvider if no src in options', () => {
            core.setSelection({ start: 0, end: 5 })
            const cmd = new ImageCommand(() => 'https://default.com/image.jpg')
            
            cmd.execute(core)
            
            expect(core.getValue()).toBe('![Hello](https://default.com/image.jpg) world')
        })

        it('should use empty alt if no selection', () => {
            core.setSelection({ start: 5, end: 5 })
            const cmd = new ImageCommand()
            
            cmd.execute(core, { src: 'https://example.com/image.jpg' , alt: '' })
            
            expect(core.getValue()).toBe('Hello![](https://example.com/image.jpg) world')
        })
    })
})
