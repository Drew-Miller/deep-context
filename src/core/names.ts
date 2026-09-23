export function normalizeTaskName(value: string): string {
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!normalized) throw new Error("Task name must contain letters or numbers");
  return normalized;
}
