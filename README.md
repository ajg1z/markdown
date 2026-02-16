# Markdown Editor

Библиотека для создания markdown редакторов с поддержкой команд форматирования, истории изменений и горячих клавиш.

## Возможности

- 📝 Редактирование markdown текста с поддержкой выделения
- 🔄 История изменений (undo/redo)
- ⌨️ Горячие клавиши для команд
- 🎨 Система команд для форматирования:
  - **Inline marks**: жирный, курсив, код, зачеркивание
  - **Block commands**: цитаты, списки (нумерованные, маркированные, с чекбоксами), таблицы, ссылки, изображения, сворачиваемые секции
- 📊 Preview режим с рендерингом markdown
- 🔌 Подписка на изменения (reactive API)
- 🧪 Полное покрытие тестами (126+ тестов)

## Установка

```bash
npm install
```

## Использование

### Базовый пример

```typescript
import { EditorCore } from './src/editor-core'
import { EditorController } from './src/editor-controller'
import { CommandRegistry } from './src/commands/command-registry'
import { BoldCommand } from './src/commands/marks/inline'

const core = new EditorCore('Hello world')
const commands = new CommandRegistry({
  bold: new BoldCommand()
})
const controller = new EditorController(core, commands)

core.subscribe((snapshot) => {
  console.log('Value:', snapshot.value)
  console.log('Selection:', snapshot.selection)
})

core.setSelection({ start: 0, end: 5 })
controller.executeCommand('bold')
// Результат: **Hello** world
```

### С горячими клавишами

```typescript
import { KeyboardManager } from './src/keyboard-manager'

const keyboardManager = new KeyboardManager(controller)
keyboardManager.registerShortcut('Ctrl+B', 'bold')
keyboardManager.registerShortcut('Ctrl+I', 'italic')

// Теперь Ctrl+B применяет жирный текст
```

## Структура проекта

```
src/
├── editor-core.ts          # Ядро редактора
├── editor-controller.ts    # Контроллер для выполнения команд
├── keyboard-manager.ts     # Менеджер горячих клавиш
├── history/
│   └── history.ts         # История изменений
├── commands/
│   ├── marks/             # Inline команды (bold, italic, code, etc.)
│   ├── blocks/            # Block команды (quote, lists, table, etc.)
│   └── command-registry.ts # Реестр команд
├── demo/                   # Demo приложение
└── __tests__/              # Тесты
```

## API

### EditorCore

Основной класс для работы с текстом и выделением.

```typescript
const core = new EditorCore('initial text')

// Получение значения и выделения
core.getValue()
core.getSelection()
core.getSelectionText()

// Установка значения и выделения
core.setSelection({ start: 0, end: 5 })
core.input('new text', { start: 0, end: 8 })

// Операции с текстом
core.replaceSelection('text')
core.wrapSelection('**')
core.insertTextToSelection('text')
core.mapSelectedLines(line => `> ${line}`)

// История
core.undo()
core.redo()
core.canUndo()
core.canRedo()

// Подписка на изменения
core.subscribe((snapshot) => {
  // snapshot.value - текущее значение
  // snapshot.selection - текущее выделение
})
```

### EditorController

Контроллер для выполнения команд через реестр.

```typescript
const controller = new EditorController(core, commands)

controller.executeCommand('bold', options)
controller.undo()
controller.redo()
```

### CommandRegistry

Реестр команд для регистрации и выполнения.

```typescript
const registry = new CommandRegistry({
  bold: new BoldCommand(),
  italic: new ItalicCommand(),
  // ...
})

registry.register(new CustomCommand())
registry.get('bold')
```

### KeyboardManager

Менеджер для регистрации и обработки горячих клавиш.

```typescript
const keyboardManager = new KeyboardManager(controller, false)

keyboardManager.registerShortcut('Ctrl+B', 'bold')
keyboardManager.registerShortcut('Ctrl+Shift+I', 'italic')

keyboardManager.unregister() // Удаление listeners
```

## Доступные команды

### Inline Marks

- `bold` - Жирный текст (`**text**`)
- `italic` - Курсив (`_text_`)
- `code` - Инлайн код (`` `text` ``)
- `strikethrough` - Зачеркивание (`~~text~~`)

### Block Commands

- `quote` - Цитата (`> text`)
- `ordered-list` - Нумерованный список (`1. text`)
- `unordered-list` - Маркированный список (`- text`)
- `control-list` - Список с чекбоксами (`- [ ] text`)
- `table` - Таблица
- `link` - Ссылка (`[text](url)`)
- `image` - Изображение (`![alt](src)`)
- `expanded-section` - Сворачиваемая секция (`+++text+++`)

## Разработка

### Запуск demo

```bash
npm run dev:demo
```

Откроется demo приложение с редактором и preview режимом.

### Сборка библиотеки

```bash
npm run build
```

### Запуск тестов

```bash
npm test              # Watch режим
npm run test:run      # Однократный запуск
npm run test:ui       # С UI интерфейсом
```

## Тестирование

Проект имеет полное покрытие тестами:

- ✅ EditorCore (44 теста)
- ✅ History (23 теста)
- ✅ Commands (40 тестов)
- ✅ KeyboardManager (19 тестов)

**Всего: 126+ тестов**

## Технологии

- **TypeScript** - типизация
- **Vite** - сборка
- **Vitest** - тестирование
- **markdown-it** - рендеринг markdown
- **markdown-it-task-lists** - поддержка списков задач
- **markdown-it-collapsible** - поддержка сворачиваемых секций

## Лицензия

MIT
