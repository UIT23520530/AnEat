import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/staff/*',
          '/manager/*',
          '/logistics-staff/*',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://aneat.shop/sitemap.xml',
  }
}
