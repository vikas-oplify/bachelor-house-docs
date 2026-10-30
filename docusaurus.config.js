// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "BachelorHouse Docs",
  tagline: "How BachelorHouse works today, for every side of the rental",
  favicon: "img/favicon.svg",

  future: {
    v4: true,
    faster: true,
  },

  url: "https://vikas-oplify.github.io",
  baseUrl: "/bachelor-house-docs/",
  trailingSlash: false,
  organizationName: "vikas-oplify",
  projectName: "bachelor-house-docs",

  // Internal handbook: keep it out of search engines.
  noIndex: true,

  onBrokenLinks: "throw",
  markdown: {
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: "throw" },
  },

  i18n: { defaultLocale: "en", locales: ["en"] },

  headTags: [
    { tagName: "link", attributes: { rel: "preconnect", href: "https://fonts.googleapis.com" } },
    {
      tagName: "link",
      attributes: { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          breadcrumbs: true,
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      }),
    ],
  ],

  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        docsRouteBasePath: "/",
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        searchBarShortcutHint: true,
        explicitSearchResultPath: true,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: { respectPrefersColorScheme: true },
      docs: { sidebar: { hideable: true, autoCollapseCategories: true } },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      navbar: {
        title: "BachelorHouse",
        items: [
          { type: "docSidebar", sidebarId: "product", position: "left", label: "Product guide" },
          { type: "docSidebar", sidebarId: "journeys", position: "left", label: "Journeys" },
          {
            to: "/product/build-status",
            label: "What's built",
            position: "left",
            activeBaseRegex: "/product/build-status$",
          },
          { type: "search", position: "right" },
          {
            type: "dropdown",
            label: "Repos",
            position: "right",
            items: [
              {
                label: "bachelor-house-backend",
                href: "https://github.com/oplifyterminal/bachelor-house-backend",
              },
              {
                label: "bachelor-house-client",
                href: "https://github.com/oplifyterminal/bachelor-house-client",
              },
            ],
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Product guide",
            items: [
              { label: "How BachelorHouse works", to: "/product" },
              { label: "Plans & pricing", to: "/product/money/plans-and-pricing" },
              { label: "What's built today", to: "/product/build-status" },
              { label: "Known limitations", to: "/product/known-limitations" },
            ],
          },
          {
            title: "Journeys",
            items: [
              { label: "All journeys", to: "/journeys" },
              { label: "Owner lists a flat", to: "/journeys/owner-lists-a-flat" },
              { label: "PG operator lists a PG", to: "/journeys/pg-lists-a-pg" },
              { label: "Tenant finds a home", to: "/journeys/tenant-finds-a-home" },
            ],
          },
          {
            title: "For staff",
            items: [
              { label: "Staff roles", to: "/product/platform/staff-roles" },
              { label: "Moderation", to: "/product/platform/moderation" },
              { label: "Configurable rules", to: "/product/platform/configurable-rules" },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Oplify Solutions Pvt. Ltd. · Internal documentation`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ["bash", "json"],
      },
      // Node, edge and label colours come from the theme tokens in custom.css,
      // so diagrams follow light and dark mode.
      mermaid: {
        theme: { light: "base", dark: "base" },
        options: { fontFamily: "Figtree, system-ui, sans-serif" },
      },
    }),
};

export default config;
