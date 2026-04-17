import { rawSeedRules } from "@/registry/seed";
import { buildVerificationQueue } from "@/registry/verification";

export const sourceVerificationQueue = buildVerificationQueue(rawSeedRules);
