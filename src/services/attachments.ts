import { API_URL } from "./config";

export type Attachment = {
  id: number;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export async function uploadProjectAttachment(
  token: string,
  projectId: number,
  file: File
): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/projects/${projectId}/attachments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listProjectAttachments(
  token: string,
  projectId: number
): Promise<Attachment[]> {
  const res = await fetch(`${API_URL}/projects/${projectId}/attachments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadTaskAttachment(
  token: string,
  taskId: number,
  file: File
): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/tasks/${taskId}/attachments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listTaskAttachments(
  token: string,
  taskId: number
): Promise<Attachment[]> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/attachments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadTaskCommentAttachment(
  token: string,
  taskId: number,
  commentId: number,
  file: File
): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${API_URL}/tasks/${taskId}/comments/${commentId}/attachments`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listTaskCommentAttachments(
  token: string,
  taskId: number,
  commentId: number
): Promise<Attachment[]> {
  const res = await fetch(
    `${API_URL}/tasks/${taskId}/comments/${commentId}/attachments`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function toAbsoluteUrl(relativeUrl: string): string {
  if (!relativeUrl.startsWith("/")) return `${API_URL}${relativeUrl}`;
  return `${API_URL}${relativeUrl}`;
}

export async function deleteProjectAttachment(
  token: string,
  projectId: number,
  attachmentId: number
): Promise<void> {
  const res = await fetch(
    `${API_URL}/projects/${projectId}/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteTaskAttachment(
  token: string,
  taskId: number,
  attachmentId: number
): Promise<void> {
  const res = await fetch(
    `${API_URL}/tasks/${taskId}/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteTaskCommentAttachment(
  token: string,
  taskId: number,
  commentId: number,
  attachmentId: number
): Promise<void> {
  const res = await fetch(
    `${API_URL}/tasks/${taskId}/comments/${commentId}/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error(await res.text());
}
