export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Recipewiser",
  url: "https://chef-genie.app",
  ogImage: "https://chef-genie.app/og.png",
  description: "An open-source recipe generator powered by OpenAi and ChatGPT.",
  mainNav: [
    {
      title: "Recipewiser Homepage",
      href: "/",
    },
  ],
  links: {
    twitter: "https://twitter.com/faultyled",
    github: "https://github.com/giacomogaglione",
    docs: "https://chef-genie.app",
  },
}
