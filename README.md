# react-text-row-count

Adds a `data-row-count` attribute to a React element with text inside, reflecting how many visual text rows it currently spans.

- **Accurate measurement**: Computes rows by measuring the element height (minus padding and borders) divided by its line height.
- **Auto-updates**: Reacts to mutations, element resizes, window resizes, and font loading changes.
- **Zero wrapper**: Does not render an extra DOM node; it clones its only child and sets the data attribute.

## Install

```bash
npm i react-text-row-count
```

Peer dependency: `react` (>=17).

## Usage

```tsx
import { RowCount } from "react-text-row-count";

export function Example() {
  return (
    <RowCount onRowCountChanged={(rows) => console.log("Rows:", rows)}>
      <div style={{ lineHeight: 1.5 }}>
        This text will receive a data-row-count attribute that updates when its
        content or size changes.
      </div>
    </RowCount>
  );
}
```

The inner element will receive the `data-row-count` attribute in the DOM and a `rowcountchanged` DOM event will be dispatched when it changes.

## API

- **`<RowCount>`**
  - **children**: `ReactElement` (required). Must be a single element; the component clones it to inject a ref.
  - **onRowCountChanged**: `(rows: number) => void`. Called whenever the computed row count changes.

- **`calculateRowCount(element: HTMLElement): number`**
  - Utility that computes the visible row count using the element’s measured height minus padding/borders and the computed line-height. Falls back to `1.2 * fontSize` if line-height is `normal`.

## DOM event

A `rowcountchanged` event is also emitted on the child element:

```tsx
useEffect(() => {
  const el = document.querySelector('[data-row-count]');
  const handler = (e: any) => console.log('DOM rows:', e.detail.rowCount);
  el?.addEventListener('rowcountchanged', handler);
  return () => el?.removeEventListener('rowcountchanged', handler);
}, []);
```

## Notes

- The measurement runs on animation frames and coalesces rapid changes.
- The component attaches `ResizeObserver`, `MutationObserver`, and a `resize` listener. These are cleaned up on unmount.
- For best accuracy, ensure your element has a known/computed `line-height` and is not subject to transforms that affect layout without affecting layout boxes.

## License

MIT
