export type Selection = {
    start: number
    end: number
}

export type EditorSnapshot = {
    value: string
    selection: Selection
}

export type EditorMode = 'editor' | 'preview'

export type EditorSubscriber = (snapshot: EditorSnapshot) => void

