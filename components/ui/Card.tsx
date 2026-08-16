import React from "react";
import styles from "./Card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};
