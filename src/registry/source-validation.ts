import type { SourceFamily } from "@/shared/constants";

export interface SourceFieldValidation {
  field: string;
  value: string | null;
  valid: boolean;
  hint: string;
  required: boolean;
}

const URL_PATTERN = /^https?:\/\/.+/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OJ_PATTERN = /^OJ\s/;

const OJ_REQUIRED_FAMILIES = new Set<SourceFamily>([
  "EUR-Lex",
  "European Commission",
  "Commission legal act",
]);

const DEPRECATED_SOURCE_FAMILIES = new Set<SourceFamily>([
  "European Commission",
]);

export function isDeprecatedSourceFamily(sourceFamily: SourceFamily): boolean {
  return DEPRECATED_SOURCE_FAMILIES.has(sourceFamily);
}

export function getDeprecationHint(sourceFamily: SourceFamily): string | null {
  if (sourceFamily === "European Commission") {
    return 'Deprecated. Use "Commission legal act" (for adopted acts with OJ) or "Commission guidance" (for proposals/guidance without OJ) instead.';
  }
  return null;
}

export function requiresOjReference(sourceFamily: SourceFamily): boolean {
  return OJ_REQUIRED_FAMILIES.has(sourceFamily);
}

export function getReferenceLabel(sourceFamily: SourceFamily): string {
  if (OJ_REQUIRED_FAMILIES.has(sourceFamily)) {
    return "OJ reference";
  }

  switch (sourceFamily) {
    case "Commission guidance":
      return "Commission page / document reference";
    case "UNECE":
      return "UNECE document reference";
    case "EDPB":
      return "EDPB guideline reference";
    case "ECHA":
      return "ECHA reference";
    case "National legislation":
      return "National gazette / legislation reference";
    case "UK Parliament":
      return "UK Act reference";
    default:
      return "Authoritative reference";
  }
}

export function validateOfficialUrl(value: string | null): SourceFieldValidation {
  if (!value || !value.trim()) {
    return {
      field: "official_url",
      value,
      valid: false,
      required: true,
      hint: "Required. Must be a full URL starting with https://",
    };
  }

  if (!URL_PATTERN.test(value.trim())) {
    return {
      field: "official_url",
      value,
      valid: false,
      required: true,
      hint: "Must start with http:// or https://",
    };
  }

  return {
    field: "official_url",
    value,
    valid: true,
    required: true,
    hint: "URL format is valid. Verify it resolves to the correct official document.",
  };
}

export function validateOjReference(
  value: string | null,
  sourceFamily: SourceFamily,
): SourceFieldValidation {
  const required = requiresOjReference(sourceFamily);
  const label = getReferenceLabel(sourceFamily);

  if (!value || !value.trim()) {
    if (!required) {
      return {
        field: "oj_reference",
        value,
        valid: true,
        required: false,
        hint: `Optional for ${sourceFamily}. The primary reference field is used instead.`,
      };
    }

    return {
      field: "oj_reference",
      value,
      valid: false,
      required: true,
      hint: `Required. Format: OJ L NNN, DD.MM.YYYY or OJ L, YYYY/NNNN, DD Month YYYY`,
    };
  }

  if (required && !OJ_PATTERN.test(value.trim())) {
    return {
      field: "oj_reference",
      value,
      valid: false,
      required: true,
      hint: "Should start with 'OJ ' (Official Journal reference)",
    };
  }

  return {
    field: "oj_reference",
    value,
    valid: true,
    required,
    hint: `${label} format accepted.`,
  };
}

export function validateLastVerifiedOn(value: string | null): SourceFieldValidation {
  if (!value || !value.trim()) {
    return {
      field: "last_verified_on",
      value,
      valid: false,
      required: true,
      hint: "Required. ISO date format: YYYY-MM-DD",
    };
  }

  if (!ISO_DATE_PATTERN.test(value.trim())) {
    return {
      field: "last_verified_on",
      value,
      valid: false,
      required: true,
      hint: "Must be ISO date format: YYYY-MM-DD",
    };
  }

  return {
    field: "last_verified_on",
    value,
    valid: true,
    required: true,
    hint: "Date format is valid.",
  };
}

export interface PromotionChecklistItem {
  label: string;
  passed: boolean;
  detail: string;
}

export function buildPromotionChecklist(
  officialUrl: string | null,
  ojReference: string | null,
  lastVerifiedOn: string | null,
  reviewerIdentity: string,
  reviewerDecision: string,
  sourceFamily: SourceFamily,
): PromotionChecklistItem[] {
  const ojRequired = requiresOjReference(sourceFamily);
  const urlValid = Boolean(officialUrl && /^https?:\/\/.+/.test(officialUrl));
  const ojValid = ojRequired
    ? Boolean(ojReference && /^OJ\s/.test(ojReference))
    : true;
  const dateValid = Boolean(lastVerifiedOn && /^\d{4}-\d{2}-\d{2}$/.test(lastVerifiedOn));
  const identityValid = Boolean(reviewerIdentity.trim());
  const decisionReady = reviewerDecision === "promote_now";

  return [
    {
      label: "Official source page found",
      passed: urlValid,
      detail: urlValid
        ? `URL: ${officialUrl}`
        : "Enter a valid https:// URL to the official source document.",
    },
    {
      label: ojRequired ? "OJ reference valid" : "Reference field valid (OJ not required)",
      passed: ojValid,
      detail: ojValid
        ? ojRequired
          ? `OJ: ${ojReference}`
          : `Source family "${sourceFamily}" does not require OJ reference.`
        : "Enter OJ reference in format: OJ L NNN, DD.MM.YYYY",
    },
    {
      label: "Verification date entered",
      passed: dateValid,
      detail: dateValid
        ? `Verified on: ${lastVerifiedOn}`
        : "Enter the date you verified the source (YYYY-MM-DD).",
    },
    {
      label: "Reviewer identity entered",
      passed: identityValid,
      detail: identityValid
        ? `Reviewer: ${reviewerIdentity}`
        : "Enter your name or email as reviewer identity.",
    },
    {
      label: "Promotable now",
      passed: urlValid && ojValid && dateValid && identityValid && decisionReady,
      detail:
        urlValid && ojValid && dateValid && identityValid && decisionReady
          ? "All gates pass. Rule will be promoted to ACTIVE on next evaluation."
          : decisionReady
            ? "Some fields are still missing — see above."
            : 'Set reviewer decision to "promote_now" when ready.',
    },
  ];
}

export function validateAllSourceFields(
  officialUrl: string | null,
  ojReference: string | null,
  lastVerifiedOn: string | null,
  sourceFamily: SourceFamily = "EUR-Lex",
): {
  validations: SourceFieldValidation[];
  allValid: boolean;
  validCount: number;
  totalRequired: number;
} {
  const validations = [
    validateOfficialUrl(officialUrl),
    validateOjReference(ojReference, sourceFamily),
    validateLastVerifiedOn(lastVerifiedOn),
  ];

  const requiredValidations = validations.filter((v) => v.required);
  const validCount = requiredValidations.filter((v) => v.valid).length;

  return {
    validations,
    allValid: validCount === requiredValidations.length,
    validCount,
    totalRequired: requiredValidations.length,
  };
}
