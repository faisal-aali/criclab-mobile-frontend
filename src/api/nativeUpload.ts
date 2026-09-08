/**
 * Binary uploads for Expo 57 / RN 0.86.
 *
 * Global `fetch` FormData cannot carry `{ uri, name, type }` file parts
 * (`Unsupported FormDataPart implementation`). Native `uploadAsync` can.
 */
import * as FileSystem from 'expo-file-system/legacy'
import { ApiError } from './http'

function localFileUri(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://') || uri.startsWith('assets-library://')) {
    return uri
  }
  if (uri.startsWith('/')) return `file://${uri}`
  return uri
}

function messageFromBody(body: string, status: number): string {
  try {
    const data = JSON.parse(body) as { detail?: unknown; message?: unknown }
    const detail = data.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const first = detail[0] as { msg?: string } | undefined
      if (first?.msg) return first.msg.replace(/^Value error,\s*/, '')
    }
    if (typeof data.message === 'string') return data.message
  } catch {
    /* not JSON */
  }
  return status ? `Upload failed (${status})` : 'Upload failed'
}

export async function nativeMultipartUpload(opts: {
  url: string
  fileUri: string
  fieldName?: string
  mimeType?: string
  parameters?: Record<string, string>
  headers?: Record<string, string>
}): Promise<string> {
  const result = await FileSystem.uploadAsync(opts.url, localFileUri(opts.fileUri), {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: opts.fieldName ?? 'file',
    mimeType: opts.mimeType,
    parameters: opts.parameters,
    headers: opts.headers,
    sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
  })
  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(messageFromBody(result.body, result.status), result.status)
  }
  return result.body
}
