import type { DonationsData } from "./types";

const API_URL =
  "https://kpukc066rd.execute-api.us-west-2.amazonaws.com/prod/donations";
const SHARED_SECRET = "MY_SHARED_SECRET";

export async function loadDonations(): Promise<{
  data: DonationsData;
  etag: string;
}> {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "x-api-key": SHARED_SECRET,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load: ${res.status}`);
  }

  const { data, etag } = await res.json();
  return { data: JSON.parse(data), etag };
}

export async function saveDonations(
  newData: DonationsData,
  etag: string,
): Promise<{ etag: string }> {
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SHARED_SECRET,
      "If-Match": etag, // ETag for optimistic concurrency
    },
    body: JSON.stringify(newData),
  });

  if (res.status === 412) {
    throw new Error("ETag mismatch: data has changed on the server.");
  }
  if (!res.ok) {
    throw new Error(`Failed to save: ${res.status}`);
  }

  const { etag: newEtag } = await res.json();
  return { etag: newEtag };
}

export async function deleteDonations(etag: string): Promise<void> {
  const res = await fetch(API_URL, {
    method: "DELETE",
    headers: {
      "x-api-key": SHARED_SECRET,
      "If-Match": etag,
    },
  });

  if (res.status === 412) {
    throw new Error("ETag mismatch: data has changed on the server.");
  }
  if (!res.ok) {
    throw new Error(`Failed to delete: ${res.status}`);
  }
}
