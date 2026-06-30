import 'server-only'

import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { MEDIA_BUCKET, cleanI18nMap, type I18nText, type MediaKind } from './schema'

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const PDF_MIME_TYPES = ['application/pdf'] as const
export const MAX_PDF_UPLOAD_BYTES = 10 * 1024 * 1024

function safeFileName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 90) || 'upload'
  )
}

export function isUploadableImage(file: File) {
  return file.size > 0 && file.size <= MAX_UPLOAD_BYTES && IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])
}

function isUploadablePdf(file: File) {
  return file.size > 0 && file.size <= MAX_PDF_UPLOAD_BYTES && PDF_MIME_TYPES.includes(file.type as (typeof PDF_MIME_TYPES)[number])
}

async function uploadFile(
  supabase: SupabaseClient<Database>,
  file: File,
  kind: MediaKind,
  alt?: I18nText,
) {
  const path = `${kind}/${randomUUID()}-${safeFileName(file.name)}`
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: publicUrl } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  const url = publicUrl.publicUrl

  const { error: catalogError } = await supabase.from('media_assets').insert({
    bucket: MEDIA_BUCKET,
    path,
    url,
    alt: alt ? cleanI18nMap(alt) : {},
    mime_type: file.type,
    size_bytes: file.size,
    kind,
  })
  if (catalogError) throw catalogError

  return url
}

export async function uploadImageFile(
  supabase: SupabaseClient<Database>,
  file: File,
  kind: MediaKind,
  alt?: I18nText,
) {
  if (!isUploadableImage(file)) {
    throw new Error('invalid-image')
  }
  return uploadFile(supabase, file, kind, alt)
}

export async function uploadPdfFile(
  supabase: SupabaseClient<Database>,
  file: File,
  kind: Extract<MediaKind, 'cv'> = 'cv',
  alt?: I18nText,
) {
  if (!isUploadablePdf(file)) {
    throw new Error('invalid-pdf')
  }
  return uploadFile(supabase, file, kind, alt)
}

export async function uploadImageFromForm(
  supabase: SupabaseClient<Database>,
  formData: FormData,
  fieldName: string,
  kind: MediaKind,
  alt?: I18nText,
) {
  const file = formData.get(fieldName)
  if (!(file instanceof File) || file.size === 0) return undefined
  return uploadImageFile(supabase, file, kind, alt)
}

export async function uploadPdfFromForm(
  supabase: SupabaseClient<Database>,
  formData: FormData,
  fieldName: string,
  kind: Extract<MediaKind, 'cv'> = 'cv',
  alt?: I18nText,
) {
  const file = formData.get(fieldName)
  if (!(file instanceof File) || file.size === 0) return undefined
  return uploadPdfFile(supabase, file, kind, alt)
}
