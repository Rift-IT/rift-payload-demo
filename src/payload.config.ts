import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { ActivityLog } from '@/collections/ActivityLog'
import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Products } from '@/collections/Products'
import { Redirects } from '@/collections/Redirects'
import { SeoEntries } from '@/collections/SeoEntries'
import { Users } from '@/collections/Users'
import { createDatabaseAdapter } from '@/db'
import { demoUser, env } from '@/env'
import { i18n } from '@/i18n'
import { seed } from '@/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Pre-fills the login form with the demo user in development.
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? { email: demoUser.email, password: demoUser.password, prefillOnly: true }
        : false,
    dateFormat: 'd MMM yyyy, HH:mm',
    meta: {
      titleSuffix: ' | The Rift',
    },
    avatar: {
      Component: '@/components/admin/branding/UserAvatar#UserAvatar',
    },
    livePreview: {
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
        { name: 'tablet', label: 'Tablet', width: 768, height: 1024 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/branding/RiftLogo#RiftLogo',
        Icon: '@/components/admin/branding/RiftIcon#RiftIcon',
      },
      beforeLogin: ['@/components/admin/branding/BrandedLogin#BrandedLogin'],
      afterNavLinks: ['@/components/admin/nav/AfterNavLinks#AfterNavLinks'],
      beforeDashboard: ['@/components/admin/dashboard/ActivityPulse#ActivityPulse'],
    },
  },
  collections: [Pages, Media, Categories, Products, SeoEntries, Redirects, ActivityLog, Users],
  editor: lexicalEditor(),
  i18n,
  secret: env.payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: createDatabaseAdapter(),
  sharp,
  // Creates the demo user and sample content on first start.
  onInit: seed,
})
