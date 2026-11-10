export interface Release {
  id: number;
  version: string;
  notes: string;
  createdAt: string;
}

export interface NewRelease {
  version: string;
  notes: string;
}

const SEMVER = /^v\d+\.\d+\.\d+$/;

/** Returns a valid NewRelease, or an error message for the client. */
export function parseNewRelease(body: unknown): NewRelease | string {
  if (typeof body !== "object" || body === null) return "Body must be a JSON object";
  const { version, notes } = body as Record<string, unknown>;
  if (typeof version !== "string" || !SEMVER.test(version)) {
    return "version must look like v1.2.3";
  }
  return { version, notes: typeof notes === "string" ? notes : "" };
}
