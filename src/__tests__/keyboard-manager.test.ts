import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { KeyboardManager } from '../keyboard-manager'
import { EditorController } from '../editor-controller'
import { EditorCore } from '../editor-core'
import { CommandRegistry } from '../commands/command-registry'
import { BoldCommand, ItalicCommand } from '../commands/marks/inline'

describe('KeyboardManager', () => {
    let core: EditorCore
    let registry: CommandRegistry
    let controller: EditorController
    let manager: KeyboardManager

    beforeEach(() => {
        core = new EditorCore('Hello world')
        registry = new CommandRegistry({
            bold: new BoldCommand(),
        })
        controller = new EditorController(core, registry)
        manager = new KeyboardManager(controller, true)
    })

    afterEach(() => {
        manager.unregister()
    })

    describe('registerShortcut()', () => {
        it('should register shortcut', () => {
            manager.registerShortcut('Ctrl+B', 'bold')
            
            expect(manager['shortcuts']['ctrl+b']).toBe('bold')
        })

        it('should convert keyCombo to lowercase', () => {
            manager.registerShortcut('CTRL+SHIFT+B', 'bold')
            
            expect(manager['shortcuts']['ctrl+shift+b']).toBe('bold')
        })

        it('should overwrite existing shortcut', () => {
            manager.registerShortcut('Ctrl+B', 'bold')
            manager.registerShortcut('Ctrl+B', 'italic')
            
            expect(manager['shortcuts']['ctrl+b']).toBe('italic')
        })
    })

    describe('onKeyDown()', () => {
        it('should execute command on registered shortcut', () => {
            manager.registerShortcut('ctrl+b', 'bold')
            core.setSelection({ start: 0, end: 5 })
            
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('bold')
        })

        it('should prevent default and stop propagation', () => {
            manager.registerShortcut('ctrl+b', 'bold')
            
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            })
            
            const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
            const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
            
            manager.onKeyDown(event)
            
            expect(preventDefaultSpy).toHaveBeenCalled()
            expect(stopPropagationSpy).toHaveBeenCalled()
        })

        it('should not execute command for unregistered shortcut', () => {
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).not.toHaveBeenCalled()
        })

        it('should build combo with ctrl key', () => {
            manager.registerShortcut('ctrl+b', 'bold')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('bold')
        })

        it('should build combo with shift key', () => {
            manager.registerShortcut('shift+b', 'bold')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                shiftKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('bold')
        })

        it('should build combo with alt key', () => {
            manager.registerShortcut('alt+b', 'bold')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                altKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('bold')
        })

        it('should build combo with multiple modifiers', () => {
            manager.registerShortcut('ctrl+shift+b', 'bold')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true,
                shiftKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('bold')
        })

        it('should handle key in lowercase', () => {
            manager.registerShortcut('ctrl+b', 'bold')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'B',
                ctrlKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('bold')
        })

        it('should handle special keys', () => {
            manager.registerShortcut('ctrl+z', 'undo')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).toHaveBeenCalledWith('undo')
        })

        it('should not execute if no modifiers match', () => {
            manager.registerShortcut('ctrl+b', 'bold')
            const executeSpy = vi.spyOn(controller, 'executeCommand')
            
            const event = new KeyboardEvent('keydown', {
                key: 'b'
            })
            
            manager.onKeyDown(event)
            
            expect(executeSpy).not.toHaveBeenCalled()
        })
    })

    describe('constructor', () => {
        it('should not add event listener when outerContainer is true', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
            
            new KeyboardManager(controller, true)
            
            expect(addEventListenerSpy).not.toHaveBeenCalled()
        })

        it('should add event listener when outerContainer is false', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
            
            const manager = new KeyboardManager(controller, false)
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
            
            manager.unregister()
        })
    })

    describe('unregister()', () => {
        it('should remove event listener', () => {
            const manager = new KeyboardManager(controller, false)
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
            
            manager.unregister()
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', manager.onKeyDown)
        })

        it('should be safe to call multiple times', () => {
            const manager = new KeyboardManager(controller, false)
            
            expect(() => {
                manager.unregister()
                manager.unregister()
            }).not.toThrow()
        })
    })

    describe('integration', () => {
        it('should execute command and modify editor content', () => {
            core = new EditorCore('Hello world')
            registry = new CommandRegistry({
                bold: new BoldCommand(),
            })
            controller = new EditorController(core, registry)
            manager = new KeyboardManager(controller, true)
            
            manager.registerShortcut('ctrl+b', 'bold')
            core.setSelection({ start: 0, end: 5 })
            
            const event = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true
            })
            
            manager.onKeyDown(event)
            
            expect(core.getValue()).toBe('**Hello** world')
        })

        it('should handle multiple shortcuts', () => {
            core = new EditorCore('Hello world')
            registry = new CommandRegistry({
                bold: new BoldCommand(),
                italic: new ItalicCommand(),
            })
            controller = new EditorController(core, registry)
            manager = new KeyboardManager(controller, true)
            
            manager.registerShortcut('ctrl+b', 'bold')
            manager.registerShortcut('ctrl+i', 'italic')
            
            core.setSelection({ start: 0, end: 5 })
            
            const event1 = new KeyboardEvent('keydown', {
                key: 'b',
                ctrlKey: true
            })
            manager.onKeyDown(event1)
            expect(core.getValue()).toBe('**Hello** world')
            
            core.setSelection({ start: 0, end: 9 })
            const event2 = new KeyboardEvent('keydown', {
                key: 'i',
                ctrlKey: true
            })
            manager.onKeyDown(event2)
            expect(core.getValue()).toBe('_**Hello**_ world')
        })
    })
})
