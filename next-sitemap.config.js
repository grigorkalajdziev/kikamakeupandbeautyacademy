/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.kikamakeupandbeautyacademy.com",
  generateRobotsTxt: true,
  exclude: ["/other/my-account", "/other/checkout", "/other/cart"],
};
