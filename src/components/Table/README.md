# Table

Report table built on Ant Design's `Table`, with the Figma toolbar, totals
row, footer, density toggle and paged child rows. Import everything from
`components/Table`; the folders below are internal.

## Where things live

| Path             | What it holds                                                                   |
| ---------------- | ------------------------------------------------------------------------------- |
| `Table.tsx`      | The component. Wires props, store and Ant Design together; no logic of its own. |
| `types.ts`       | Public prop and column types.                                                   |
| `constants.ts`   | Default sizes and copy.                                                         |
| `store/`         | Per-table state: reducer, contexts, `useTableState` / `useTableActions`.        |
| `hooks/`         | `useTableController`: merges controlled props with the store.                   |
| `components/`    | Toolbar, Group by, search, total row, expand caret, checkbox, pagers.           |
| `utils/`         | Pure helpers (columns, rows, sorting, child paging, pagination). Unit tested.   |
| `TableCells.tsx` | Cell renderers: `TableRowLabel`, `TableValue`, `TableTag`.                      |
| `format.ts`      | Number formatting shared by cells and stories.                                  |

## State

Each `Table` creates its own store (nested tables never share one). It holds
density, Group by, expanded rows, selected rows, the last sort and the child
pager pages.

Every value works both ways:

- **Uncontrolled:** pass `defaultDensity`, `groupBy.defaultValue`,
  `rowSelection.defaultSelectedRowKeys`, `expandable.defaultExpandedRowKeys`,
  and the store keeps the value.
- **Controlled:** pass `density`, `groupBy.value`,
  `rowSelection.selectedRowKeys`, `expandable.expandedRowKeys`, and the
  store follows the prop.

Either way, the matching `on…Change` prop is called.

Content rendered inside the table (`toolbar`, `actions`, cell `render`) can
use the store directly:

```tsx
function SelectedCount() {
  const { selectedRowKeys } = useTableState()
  const { clearSelection } = useTableActions()
  return <button onClick={clearSelection}>{selectedRowKeys.length} selected</button>
}

<Table rowSelection={{}} toolbar={<SelectedCount />} … />
```

## One or many

Props typed `OneOrMany<T>` take a single value or a list:
`activeRowKey`, `loadingRowKeys`, `columnsControl.hiddenKeys`,
`groupBy.value` / `defaultValue`. The store actions `setGroupBy`,
`setSelectedRowKeys` and `setExpandedRowKeys` do the same. For single
selection use `rowSelection={{ type: 'radio' }}`.

## Adding a feature

1. Put the pure logic in `utils/` with a test next to it.
2. If it needs state shared across the table, add a field and an action in
   `store/types.ts`, handle it in `store/reducer.ts`, and expose a write in
   `hooks/useTableController.ts`.
3. Put the UI in `components/` and read the store with `useTableState`.
4. Add a story in `__storybook/Table.stories.tsx`.

Run `npm test` (Vitest) and `npm run typecheck`.
