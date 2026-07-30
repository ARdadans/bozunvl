import { MetadataRoute } from 'next'
import { BLOG } from '@/config/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BLOG.TITLE,
    short_name: BLOG.TITLE,
    description: BLOG.DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#020817',
    theme_color: '#020817',
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
