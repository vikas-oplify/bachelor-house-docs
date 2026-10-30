// Wraps the desktop table of contents so a page's "At a glance" card (front matter `glance`)
// sits above it in the right-hand column, and both stay in view while reading.
import React from "react";
import TOCDesktop from "@theme-original/DocItem/TOC/Desktop";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import AtAGlance from "@site/src/components/AtAGlance";
import styles from "./styles.module.css";

export default function TOCDesktopWrapper(props) {
  const { frontMatter } = useDoc();
  if (!frontMatter.glance) return <TOCDesktop {...props} />;
  return (
    <div className={styles.sticky}>
      <AtAGlance glance={frontMatter.glance} />
      <TOCDesktop {...props} />
    </div>
  );
}
