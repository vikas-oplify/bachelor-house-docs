import React, { useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useHistory } from "@docusaurus/router";
import Status from "@site/src/components/Status";
import styles from "./index.module.css";

const CHIPS = [
  ["Free listing", "/product/listing/free-listing"],
  ["Listing lifecycle", "/product/listing/listing-lifecycle"],
  ["Plans & GST", "/product/money/plans-and-pricing"],
  ["PG KYC", "/product/listing/pg-kyc"],
  ["Contact credits", "/product/tenants/contacting-a-lister"],
];

const AUDIENCES = [
  {
    key: "tenants",
    label: "Tenants",
    gradient: styles.gBlue,
    title: "Find a flat or PG",
    text: "Bachelors looking for a home in Pune: search, shortlist, contact listers with credits.",
    links: [
      ["Contacting a lister", "/product/tenants/contacting-a-lister"],
      ["PG room alerts", "/product/tenants/pg-room-alerts"],
      ["Search & places", "/product/tenants/search-and-places"],
    ],
  },
  {
    key: "owners",
    label: "Owners",
    gradient: styles.gPurple,
    title: "List a flat",
    text: "Owners renting out a flat: a 5-step form, a staff review, then enquiries.",
    links: [
      ["Posting a flat", "/product/listing/posting-a-flat"],
      ["Free listing", "/product/listing/free-listing"],
      ["Listing lifecycle", "/product/listing/listing-lifecycle"],
    ],
  },
  {
    key: "pg",
    label: "PGs & agents",
    gradient: styles.gGreen,
    title: "Run rooms or many listings",
    text: "PG listers with rooms and beds, and agents who list for owners on city plans.",
    links: [
      ["Posting a PG", "/product/listing/posting-a-pg"],
      ["PG KYC", "/product/listing/pg-kyc"],
      ["Agent listings", "/product/agents/agent-listings"],
    ],
  },
  {
    key: "staff",
    label: "Staff",
    gradient: styles.gGold,
    title: "Operate the platform",
    text: "The BachelorHouse team: review listings and KYC, run plans, coupons and content.",
    links: [
      ["Moderation", "/product/platform/moderation"],
      ["Staff roles", "/product/platform/staff-roles"],
      ["Configurable rules", "/product/platform/configurable-rules"],
    ],
  },
];

const JOURNEYS = [
  ["Owner lists a flat", "/journeys/owner-lists-a-flat", "Sign in, 5 steps, review, live for 30 days", "built"],
  ["PG lists a PG", "/journeys/pg-lists-a-pg", "6 steps with KYC, review, room upkeep", "built"],
  ["Tenant finds a home", "/journeys/tenant-finds-a-home", "Sign in works; search and contact are not built", "partial"],
  ["Agent lists for owners", "/journeys/agent-lists-for-owners", "Blocked at submit until agent approval exists", "partial"],
  ["Buying a plan", "/journeys/buying-a-plan", "Razorpay checkout, GST, coupons", "partial"],
  ["Staff review a listing", "/journeys/staff-review-a-listing", "Queue, claim, decide, lister is told", "built"],
];

function HeroSearch() {
  const [q, setQ] = useState("");
  const history = useHistory();
  const searchPath = useBaseUrl("/search");
  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        history.push(`${searchPath}?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <label htmlFor="hero-search" className="sr-only">
        Search the docs
      </label>
      <input
        id="hero-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Try "free listing", "GSTIN", "room alert"'
        className={styles.searchInput}
      />
      <button type="submit" className="button button--primary">
        Search
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <Layout
      title="Home"
      description="How BachelorHouse works today: product rules, journeys and what is built, for tenants, owners, PGs, agents and staff."
    >
      <header className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>Pune · Flats &amp; PGs for bachelors</span>
          <h1 className={styles.title}>How BachelorHouse works, for every side of the rental</h1>
          <p className={styles.lead}>
            The rules the platform enforces, what each person can do, what it costs, and exactly
            how much of it is built today.
          </p>
          <HeroSearch />
          <div className={styles.chips}>
            {CHIPS.map(([label, to]) => (
              <Link key={to} to={to} className={styles.chip}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className={`container ${styles.section}`}>
          <h2 className={styles.h2}>Read by who you're building for</h2>
          <div className={styles.cards}>
            {AUDIENCES.map((a) => (
              <article key={a.key} className={styles.card}>
                <div className={`${styles.cardTop} ${a.gradient}`}>{a.label}</div>
                <div className={styles.cardBody}>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                  <ul>
                    {a.links.map(([label, to]) => (
                      <li key={to}>
                        <Link to={to}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>Journeys, step by step</h2>
            <Link to="/journeys">All journeys</Link>
          </div>
          <p className={styles.sub}>
            Each journey walks every step a person goes through today and marks which steps work.
          </p>
          <div className={styles.journeys}>
            {JOURNEYS.map(([title, to, text, s]) => (
              <Link key={to} to={to} className={styles.journey}>
                <span className={styles.journeyTitle}>{title}</span>
                <span className={styles.journeyText}>{text}</span>
                <Status s={s} />
              </Link>
            ))}
          </div>
        </section>

        <section className={`container ${styles.section}`}>
          <div className={styles.statusBand}>
            <div>
              <h2 className={styles.h2}>Where things stand</h2>
              <p className={styles.sub}>
                The backend for listing, review, KYC, plans checkout and accounts is built. Tenant
                search, enquiries and chat are not. The website has every main screen, but none of
                them are connected to the backend yet.
              </p>
            </div>
            <div className={styles.legend}>
              <Status s="built" />
              <span>Works end to end in the backend</span>
              <Status s="partial" />
              <span>Some of it works; the page says which part</span>
              <Status s="screen" />
              <span>A website screen exists, not connected</span>
              <Status s="none" />
              <span>Not built</span>
            </div>
            <Link className="button button--primary" to="/product/build-status">
              What's built today
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
