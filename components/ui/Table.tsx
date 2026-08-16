import React from "react";
import styles from "./Table.module.css";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={styles["table-container"]}>
      <table className={`${styles.table} ${className || ""}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => <thead className={`${styles.thead} ${className || ""}`} {...props}>{children}</thead>;

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => <tbody className={`${styles.tbody} ${className || ""}`} {...props}>{children}</tbody>;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => <tr className={`${styles.tr} ${className || ""}`} {...props}>{children}</tr>;

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className,
  ...props
}) => <th className={`${styles.th} ${className || ""}`} {...props}>{children}</th>;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className,
  ...props
}) => <td className={`${styles.td} ${className || ""}`} {...props}>{children}</td>;
