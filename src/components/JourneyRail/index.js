import React from "react";
import Link from "@docusaurus/Link";
import Status from "@site/src/components/Status";
import styles from "./styles.module.css";

/**
 * A journey drawn as numbered steps, each with its build status.
 *
 * <JourneyRail steps={[
 *   { title: "Sign in", text: "Phone OTP", s: "built", href: "#1-sign-in" },
 *   { title: "Pay", text: "Razorpay", s: "partial", paid: true },
 * ]} />
 *
 * `paid` marks a step where money or a credit changes hands (drawn in gold).
 */
export default function JourneyRail({ steps = [] }) {
  return (
    <ol className={styles.rail}>
      {steps.map((step, i) => {
        const body = (
          <>
            <span className={styles.num} aria-hidden="true">
              {i + 1}
            </span>
            <span className={styles.title}>{step.title}</span>
            {step.text && <span className={styles.text}>{step.text}</span>}
            {step.s && (
              <span className={styles.status}>
                <Status s={step.s} />
              </span>
            )}
          </>
        );
        return (
          <li key={step.title} className={`${styles.step} ${step.paid ? styles.paid : ""}`}>
            {step.href ? (
              <Link to={step.href} className={styles.link}>
                {body}
              </Link>
            ) : (
              <div className={styles.link}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
