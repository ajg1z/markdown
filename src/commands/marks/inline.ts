import { WrapCommand } from "../marks/wrap"

export class BoldCommand extends WrapCommand {
    id = 'bold'
    protected wrapper = '**'

    constructor(wrapper?: string) {
        super()
        this.wrapper = wrapper || '**'
    }
}   

export class ItalicCommand extends WrapCommand {
    id = 'italic'
    protected wrapper = '_'

    constructor(wrapper?: string) {
        super()
        this.wrapper = wrapper || '_'
    }
}

export class StrikethroughCommand extends WrapCommand {
    id = 'strikethrough'
    protected wrapper = "~~"

    constructor(wrapper?: string) {
        super()
        this.wrapper = wrapper || "~~"
    }
}

export class CodeCommand extends WrapCommand {
    id = 'code'
    protected wrapper = '`'

    constructor(wrapper?: string) {
        super()
        this.wrapper = wrapper || '`'
    }
}



