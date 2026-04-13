import { cn } from "@/lib/utils"

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border-subtle)]">
      <table className={cn("w-full text-sm", className)} {...props}>{children}</table>
    </div>
  )
}

export function TableHead({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-[var(--color-bg-elevated)]", className)} {...props}>{children}</thead>
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[var(--color-border-subtle)]", className)} {...props}>{children}</tbody>
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-[var(--color-bg-elevated)] transition-colors", className)} {...props}>{children}</tr>
}

export function TableTh({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider", className)} {...props}>{children}</th>
}

export function TableTd({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-[var(--color-text-secondary)]", className)} {...props}>{children}</td>
}
