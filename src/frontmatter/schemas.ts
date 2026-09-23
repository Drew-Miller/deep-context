import { z } from "zod";
import { CONTEXT_LEVELS } from "../core/types.js";

const stringList = z.array(z.string()).default([]);

export const featureSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  status: z.string().default("active"),
  owns: stringList,
  tokens: stringList,
  contracts: stringList,
  requirements: stringList.optional(),
  depends_on: z.record(z.string(), z.enum(CONTEXT_LEVELS)).default({}),
  related_features: stringList.optional(),
  origin: z.enum(["confirmed", "inferred"]).optional(),
}).passthrough();

export const requirementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  feature: z.string().optional(),
  origin: z.enum(["confirmed", "inferred"]),
  source: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  code_patterns: stringList.optional(),
}).passthrough();

export const backlogSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  pitch: z.string().min(1),
  status: z.enum(["proposed", "planned", "active", "done", "deferred", "superseded"]),
  features: stringList,
  tokens: stringList,
  provenance: z.string().min(1),
  related: stringList,
  conflicts: stringList,
}).passthrough();

// External-format projects remain readable until their Shelf records are migrated.
export const shelfSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), status: z.string().min(1),
  type: z.string().min(1), features: stringList, tokens: stringList,
  consideration: z.literal("light").default("light"),
}).passthrough();

export const activeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  status: z.enum(["active", "done", "superseded"]),
  features: stringList,
  backlog: stringList,
  tasks: stringList,
}).passthrough();

export const decisionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  features: stringList,
}).passthrough();

export const reportSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  features: stringList,
}).passthrough();

export const sourceSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  kind: z.string().min(1),
  tracking: z.enum(["tracked", "untracked", "missing", "not-applicable"]),
  disposition: z.enum(["referenced", "imported", "excluded", "review", "missing"]),
  reason: z.string(),
  sha256: z.string().optional(),
  origin: z.enum(["confirmed", "inferred"]),
  targets: stringList,
}).passthrough();
