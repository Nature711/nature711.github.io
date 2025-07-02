export const SITE = {
  website: "https://nature711.github.io/", 
  author: "Nature",
  profile: "https://github.com/Nature711",
  desc: "Personal website",
  title: "Nature's Journal",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, 
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/nature711/nature711.github.io/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", 
  lang: "en", 
  timezone: "Asia/Singapore", 
} as const;
