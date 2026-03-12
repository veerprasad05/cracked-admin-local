const BASE_URL = "https://api.almostcrackd.ai";

type PresignedUrlResponse = {
  presignedUrl: string;
  cdnUrl: string;
};

type RegisterImageResponse = {
  imageId: string;
};

async function readJsonSafe(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function postJson<T>(
  path: string,
  token: string,
  body: Record<string, unknown>
) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message ?? response.statusText)
        : response.statusText;

    throw new Error(`Request failed (${response.status}): ${message}`);
  }

  return data as T;
}

export async function generatePresignedUrl(
  token: string,
  contentType: string
) {
  return postJson<PresignedUrlResponse>("/pipeline/generate-presigned-url", token, {
    contentType,
  });
}

export async function uploadImageToPresignedUrl(
  presignedUrl: string,
  file: File,
  contentType: string
) {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}).`);
  }
}

export async function registerImageUrl(
  token: string,
  imageUrl: string,
  isCommonUse = false
) {
  return postJson<RegisterImageResponse>(
    "/pipeline/upload-image-from-url",
    token,
    {
      imageUrl,
      isCommonUse,
    }
  );
}
