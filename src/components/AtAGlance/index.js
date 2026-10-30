import React from "react";
import Link from "@docusaurus/Link";
import Status from "@site/src/components/Status";
import styles from "./styles.module.css";

const WEBSITE = {
  wired: ["built", "Connected"],
  screen: ["screen", "Screen, not connected"],
  none: ["none", "No screen"],
};

/**
 * The "At a glance" card, shaped like the price box on a BachelorHouse listing page.
 * Rendered from a page's `glance` front matter by the swizzled DocItem/TOC wrappers, so it
 * sits above the table of contents on desktop and above the content on phones.
 *
 * glance:
 *   headline: "1 Free listing"      big line, like a price
 *   unit: "per phone number"        small text after it
 *   rows: [["Who", "Owners"], ...]  label / value pairs
 *   backend: built | partial | none
 *   website: wired | screen | none
 *   journey: /journeys/owner-lists-a-flat   optional link
 */
export default function AtAGlance({ glance, className = "" }) {
  if (!glance) return null;
  const { headline, unit, rows = [], backend, website, journey } = glance;
  const site = WEBSITE[website];
  return (
    <aside className={`${styles.card} ${className}`} aria-label="At a glance">
      <div className={styles.head}>At a glance</div>
      {headline && (
        <div className={styles.headline}>
          {headline} {unit && <small>{unit}</small>}
        </div>
      )}
      <dl className={styles.kv}>
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </React.Fragment>
        ))}
        {backend && (
          <>
            <dt>Backend</dt>
            <dd>
              <Status s={backend} />
            </dd>
          </>
        )}
        {site && (
          <>
            <dt>Website</dt>
            <dd>
              <Status s={site[0]}>{site[1]}</Status>
            </dd>
          </>
        )}
      </dl>
      {journey && (
        <Link className={`button button--secondary button--sm ${styles.cta}`} to={journey}>
          See the journey
        </Link>
      )}
    </aside>
  );
}
