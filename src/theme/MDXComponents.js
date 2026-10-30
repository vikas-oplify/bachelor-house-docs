// Makes the docs' custom components available in every .md/.mdx file
// without an import line.
import MDXComponents from "@theme-original/MDXComponents";
import Status from "@site/src/components/Status";
import JourneyRail from "@site/src/components/JourneyRail";

export default {
  ...MDXComponents,
  Status,
  JourneyRail,
};
