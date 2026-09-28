const TOKEN_URL = "https://oauth2.googleapis.com/token"
const FILES_URL = "https://www.googleapis.com/drive/v3/files"
const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export function getDriveId() {
  return required("GOOGLE_DRIVE_ID")
}

export async function getAccessToken(): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: required("GOOGLE_CLIENT_ID"),
      client_secret: required("GOOGLE_CLIENT_SECRET"),
      refresh_token: required("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Google OAuth failed: ${await response.text()}`)
  }

  const data = await response.json()
  return data.access_token as string
}

async function authHeaders() {
  return { Authorization: `Bearer ${await getAccessToken()}` }
}

function escapeDriveQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

export async function findFolder(name: string, parentId: string) {
  const driveId = getDriveId()
  const q = `name = '${escapeDriveQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`
  const url = new URL(FILES_URL)
  url.searchParams.set("q", q)
  url.searchParams.set("corpora", "drive")
  url.searchParams.set("driveId", driveId)
  url.searchParams.set("includeItemsFromAllDrives", "true")
  url.searchParams.set("supportsAllDrives", "true")
  url.searchParams.set("fields", "files(id,name)")
  const response = await fetch(url, { headers: await authHeaders(), cache: "no-store" })
  if (!response.ok) throw new Error(`Drive folder lookup failed: ${await response.text()}`)
  const data = await response.json()
  return data.files?.[0]?.id as string | undefined
}

export async function createFolder(name: string, parentId: string) {
  const url = new URL(FILES_URL)
  url.searchParams.set("supportsAllDrives", "true")
  url.searchParams.set("fields", "id,name")
  const response = await fetch(url, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  })
  if (!response.ok) throw new Error(`Drive folder create failed: ${await response.text()}`)
  const data = await response.json()
  return data.id as string
}

export async function ensureFolder(name: string, parentId: string) {
  return (await findFolder(name, parentId)) || createFolder(name, parentId)
}

export async function ensureDesignFolder(designType: string, code: string) {
  const category = await ensureFolder(designType, getDriveId())
  return ensureFolder(code, category)
}

export async function uploadDesignFile(file: File, folderId: string, filename: string) {
  const mimeType = file.type || "application/octet-stream"
  const initUrl = new URL(UPLOAD_URL)
  initUrl.searchParams.set("uploadType", "resumable")
  initUrl.searchParams.set("supportsAllDrives", "true")

  const init = await fetch(initUrl, {
    method: "POST",
    headers: {
      ...(await authHeaders()),
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": String(file.size),
    },
    body: JSON.stringify({ name: filename, parents: [folderId] }),
  })
  if (!init.ok) throw new Error(`Drive upload init failed: ${await init.text()}`)

  const uploadUrl = init.headers.get("location")
  if (!uploadUrl) throw new Error("Google Drive did not return resumable upload URL")

  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(file.size),
    },
    body: file,
  })
  if (!uploaded.ok) throw new Error(`Drive upload failed: ${await uploaded.text()}`)
  return uploaded.json() as Promise<{ id: string; name?: string; mimeType?: string }>
}

export async function downloadDesignFile(fileId: string) {
  const url = new URL(`${FILES_URL}/${encodeURIComponent(fileId)}`)
  url.searchParams.set("alt", "media")
  url.searchParams.set("supportsAllDrives", "true")
  return fetch(url, { headers: await authHeaders(), cache: "no-store" })
}
