// Wraps the phone/tablet table of contents so the "At a glance" card (front matter `glance`)
// shows above the content on narrow screens, where the right-hand column is hidden.
import React from "react";
import TOCMobile from "@theme-original/DocItem/TOC/Mobile";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import AtAGlance from "@site/src/components/AtAGlance";
import styles from "./styles.module.css";

export default function TOCMobileWrapper(props) {
  const { frontMatter } = useDoc();
  return (
    <>
      {frontMatter.glance && (
        <div className={styles.narrowOnly}>
          <AtAGlance glance={frontMatter.glance} />
        </div>
      )}
      <TOCMobile {...props} />
    </>
  );
}
