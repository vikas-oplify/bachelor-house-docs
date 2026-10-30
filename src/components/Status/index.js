import React from "react";
import styles from "./styles.module.css";

/**
 * Build-status pill used across the guide. One vocabulary everywhere:
 *   built   - works end to end in the backend (branch chore/scaffold-from-reference)
 *   partial - some of it works; the page says which part
 *   screen  - a website screen exists but is not connected to the backend
 *   none    - not built
 */
export const STATUS_LABEL = {
  built: "Built",
  partial: "Partly built",
  screen: "Screen only",
  none: "Not built",
};

export default function Status({ s = "none", children }) {
  return (
    <span className={`${styles.pill} ${styles[s] || ""}`}>
      <i className={styles.dot} aria-hidden="true" />
      {children || STATUS_LABEL[s] || s}
    </span>
  );
}
