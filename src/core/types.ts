export const CONTEXT_LEVELS = ["none", "contract", "feature", "deep"] as const;
export type ContextLevel = (typeof CONTEXT_LEVELS)[number];

export interface Diagnostic {
  level: "error" | "warning";
  code: string;
  message: string;
  path?: string;
}

export interface ProjectState {
  schemaVersion: 1;
  name: string;
  projectRoot: string;
  repositoryPath?: string;
  createdAt: string;
  updatedAt: string;
  import?: {
    head?: string;
    branch?: string;
    dirty: boolean;
    capturedAt: string;
  };
}

export interface SourceRecord {
  id: string;
  path: string;
  kind: string;
  tracking: "tracked" | "untracked" | "missing" | "not-applicable";
  disposition: "referenced" | "imported" | "excluded" | "review" | "missing";
  reason: string;
  sha256?: string;
  origin: "confirmed" | "inferred";
  targets: string[];
}

export interface IndexRecord {
  file: string;
  data: Record<string, unknown>;
}
