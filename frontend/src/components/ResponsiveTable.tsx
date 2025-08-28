import type { PropsWithChildren } from 'react'
import './ResponsiveTable.css'

interface ResponsiveTableProps {
  className?: string
}

const ResponsiveTable = ({ className, children }: PropsWithChildren<ResponsiveTableProps>) => (
  <div className="responsive-table-wrapper">
    <table className={`responsive-table ${className ?? ''}`.trim()}>
      {children}
    </table>
  </div>
)

export default ResponsiveTable
