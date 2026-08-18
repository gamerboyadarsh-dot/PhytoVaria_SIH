import clsx from "clsx";

/**
 * columns: [{ key, header, render?(row), mono?: boolean, align?: 'left'|'right' }]
 */
export default function DataTable({ columns, rows, rowKey = "id" }) {
  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "text-left font-medium text-ink-muted uppercase tracking-wide text-xs px-6 py-3",
                  col.align === "right" && "text-right"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-border last:border-0 hover:bg-surface-alt/60 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(
                    "px-6 py-3.5 text-ink",
                    col.mono && "font-mono text-[13px]",
                    col.align === "right" && "text-right"
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
