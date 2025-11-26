# CommandEditor Component

A fully-featured, jQuery-free React command editor with drag & drop, autocomplete, and live settings. Migrated from robocompass plain JavaScript to modern React.

## Features

- ✅ **Auto-expanding text input** - Input grows dynamically based on content
- ✅ **Autocomplete** - Intelligent command suggestions as you type
- ✅ **Drag & Drop** - Reorder commands using @dnd-kit
- ✅ **Keyboard Navigation** - Arrow keys, Tab, Shift+Tab
- ✅ **Enter to Add** - Press Enter to create new command
- ✅ **Settings Panel** - Color picker, speed slider, label toggle, offset controls
- ✅ **Play Controls** - Execute individual or all commands
- ✅ **Hover Actions** - Delete and settings buttons appear on hover
- ✅ **Live Updates** - Throttled onChange callback (300ms)
- ✅ **No jQuery** - Pure React implementation

## Installation

The component is already included in the robo-math project with all dependencies.

### Dependencies Used

- `@dnd-kit/core` - Drag and drop core
- `@dnd-kit/sortable` - Sortable list support
- `@dnd-kit/utilities` - DnD utilities
- `react` - UI framework
- `react-dom` - React DOM rendering

## Usage

```jsx
import CommandEditor from './components/CommandEditor';

function MyApp() {
  const handleExecute = (command) => {
    console.log('Execute:', command);
  };

  const handleExecuteAll = (commands) => {
    console.log('Execute all:', commands);
  };

  const handleChange = (commands) => {
    console.log('Commands changed:', commands);
  };

  return (
    <CommandEditor
      onExecute={handleExecute}
      onExecuteAll={handleExecuteAll}
      onStop={() => console.log('Stop')}
      onPause={() => console.log('Pause')}
      onResume={() => console.log('Resume')}
      onChange={handleChange}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onExecute` | `(command) => void` | Called when individual command is played (direct play) |
| `onExecuteAll` | `(commands) => void` | Called when Play All is clicked |
| `onStop` | `() => void` | Called when Stop is clicked |
| `onPause` | `() => void` | Called when Pause is clicked |
| `onResume` | `() => void` | Called when Resume is clicked |
| `onChange` | `(commands) => void` | Called when commands change (throttled 300ms) |

## Command Data Model

```javascript
{
  id: number,           // Unique identifier
  expression: string,   // Command expression
  color: string,        // Hex color (e.g., "#DC3912")
  speed: number,        // Speed in seconds (1-10)
  label: boolean,       // Show label flag
  text: string,         // Comment text
  offsetX: number,      // X offset
  offsetY: number       // Y offset
}
```

## Component Architecture

```
CommandEditor/
├── CommandEditor.jsx (Main container)
├── CommandEditor.css (Styles from robocompass)
├── components/
│   ├── CommandList/
│   │   ├── CommandList.jsx
│   │   ├── CommandItem.jsx
│   │   ├── CommandInput.jsx
│   │   ├── DragHandle.jsx
│   │   └── CommandActions.jsx
│   ├── CommandMenuBar/
│   │   └── CommandMenuBar.jsx
│   ├── SettingsPanel/
│   │   ├── SettingsPanel.jsx
│   │   ├── ColorPicker.jsx
│   │   ├── SpeedSlider.jsx
│   │   └── OffsetControls.jsx
│   └── NewCommandButton/
│       └── NewCommandButton.jsx
├── hooks/
│   ├── useAutoResize.js
│   ├── useKeyboardNav.js
│   ├── useAutocomplete.js
│   └── useThrottle.js
├── context/
│   └── CommandContext.jsx
└── utils/
    ├── commandModel.js
    └── validators.js
```

## Keyboard Shortcuts

- **Enter** - Add new command below current
- **Arrow Up/Down** - Navigate between commands
- **Tab** - Move to next command
- **Shift+Tab** - Move to previous command
- **Escape** - Close autocomplete

## Autocomplete Commands

Available commands: `point`, `line`, `arc`, `perp`, `parallel`, `angle`, `polygon`, `findangle`, `dist`, `pos`, `x`, `y`, `intersect`, `reflect`, `rotate`, `project`, `interpolate`, `hide`, `dilate`, `fill`, `trace`, `translate`, `text`, `group`, `and`, `or`, `diff`, `subtract`, `plot`, `para`, `part`, `fade`, `dash`, `pointtype`, `stroke`, `reverse`, `marker`

## Customization

### Styling

All styles are in `CommandEditor.css`, copied from robocompass. Modify CSS classes to customize appearance:

- `.robo-cmd-editor` - Main container
- `.robo-cmditem` - Individual command item
- `.robo-cmditem.selected` - Selected command
- `.cmd-expression` - Input field
- `.cmd-setting` - Settings panel

### Adding New Commands

Update `utils/validators.js`:

```javascript
export const AVAILABLE_TAGS = [
  // ... existing commands
  'myNewCommand',
];
```

## Migration Notes

This component was migrated from robocompass's plain JavaScript implementation:

### jQuery → React Replacements

| jQuery | React |
|--------|-------|
| `$(selector)` | `useRef()` + `ref.current` |
| `.on('click')` | `onClick={handler}` |
| `.addClass()/.removeClass()` | Conditional `className` |
| `.show()/.hide()` | `{condition && <Element>}` |
| jQuery UI Sortable | `@dnd-kit/sortable` |
| jQuery UI Autocomplete | Custom hook + state |
| jQuery UI Slider | Custom SpeedSlider component |
| `.popover()` | React Portal + positioning |

### Key Improvements

1. **Component-based** - Modular, reusable components
2. **Type-safe** - Clear prop interfaces
3. **Hooks** - Custom hooks for reusable logic
4. **Context** - Shared state management
5. **Performance** - Throttled updates, optimized renders
6. **Maintainable** - Clear separation of concerns

## Development

Run the demo:

```bash
cd robo-math
npm run dev
```

Visit `http://localhost:3333` to see the CommandEditor in action.

## License

Part of the Robo Math project.
