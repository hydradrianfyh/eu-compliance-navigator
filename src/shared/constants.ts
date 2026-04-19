import { z } from "zod";

export const jurisdictionLevels = [
  "EU",
  "UNECE",
  "MEMBER_STATE",
  "NON_EU_MARKET",
] as const;

export const frameworkGroups = ["MN", "L", "O", "AGRI"] as const;

export const ruleDomains = [
  "type_approval_framework",
  "vehicle_safety_passive",
  "vehicle_safety_active",
  "lighting_visibility",
  "emissions_environment",
  "noise",
  "emc",
  "ev_battery_safety",
  "cybersecurity_software",
  "automated_driving",
  "privacy_data",
  "ai_ml",
  "materials_chemicals_circular",
  "consumer_protection",
  "insurance_registration_tax",
  "market_access_import",
  "market_surveillance_enforcement",
  "consumer_information_labelling",
  "member_state_national",
  "non_eu_jurisdiction",
] as const;

export const artifactTypes = [
  "framework_regulation",
  "technical_requirement",
  "delegated_implementing_act",
  "horizontal_obligation",
  "national_overlay",
  "guidance_standard",
  "placeholder_gap",
] as const;

export const legalFamilies = [
  "vehicle_approval",
  "general_safety",
  "unece_technical",
  "cybersecurity",
  "dcas_automated",
  "privacy_connected",
  "data_access",
  "ai_governance",
  "materials_chemicals",
  "emissions_co2",
  "consumer_liability",
  "member_state_overlay",
  "non_eu_market",
  "insurance_registration",
  "market_surveillance",
  "import_customs",
  "consumer_information",
] as const;

export const uiPackages = [
  "wvta_core",
  "market_access",
  "country_overlay",
  "horizontal",
] as const;

export const processStages = [
  "pre_ta",
  "type_approval",
  "sop",
  "post_market",
] as const;

export const ruleLifecycleStates = [
  "PLACEHOLDER",
  "DRAFT",
  "SEED_UNVERIFIED",
  /**
   * Sprint 7: new rule undergoing 4-week gray release before graduation.
   * Capped at CONDITIONAL applicability like SEED_UNVERIFIED/DRAFT; UI
   * filters it out of the "Verified" Rules-tab section by default so
   * stakeholders never see unverified content promoted. Engine behaviour
   * is identical to SEED_UNVERIFIED; only the UI label + maintainer
   * workflow differs.
   */
  "SHADOW",
  "ACTIVE",
  "ARCHIVED",
] as const;

export const applicabilityResults = [
  "APPLICABLE",
  "NOT_APPLICABLE",
  "CONDITIONAL",
  "UNKNOWN",
  "FUTURE",
] as const;

export const sourceFamilies = [
  "EUR-Lex",
  "UNECE",
  "European Commission",
  "Commission legal act",
  "Commission guidance",
  "EDPB",
  "ECHA",
  "National legislation",
  "UK Parliament",
  "Other official",
] as const;

export const outputKinds = ["obligation", "planning_item", "information"] as const;

export const ownerHints = [
  "homologation",
  "safety_engineering",
  "cybersecurity",
  "software_ota",
  "privacy_data_protection",
  "ai_governance",
  "sustainability_materials",
  "legal",
  "aftersales",
  "regulatory_affairs",
  "powertrain_emissions",
  "connected_services",
  "other",
] as const;

export const salesModels = [
  "dealer",
  "direct",
  "leasing",
  "subscription",
  "mixed",
] as const;

export const consumerOrFleetOptions = ["consumer", "fleet", "mixed"] as const;

export const approvalTypes = [
  "new_type",
  "carry_over",
  "facelift",
  "major_update",
] as const;

export const steeringPositions = ["LHD", "RHD", "both"] as const;

export const completionStates = ["complete", "incomplete", "multi_stage"] as const;

export const powertrains = ["ICE", "HEV", "PHEV", "BEV", "FCEV"] as const;

export const batteryCapacityBands = ["small", "medium", "large"] as const;

export const automationLevels = [
  "none",
  "basic_adas",
  "l2",
  "l2plus",
  "l3",
  "l4",
  "l4_driverless",
] as const;

export const aiLevels = [
  "none",
  "conventional",
  "ai_perception",
  "ai_dms",
  "ai_analytics",
  "ai_safety",
  "foundation_model",
] as const;

export const ruleStatusValues = [
  "todo",
  "in_progress",
  "done",
  "not_relevant",
] as const;

export const matchModes = ["all", "any"] as const;

export const conditionOperators = [
  "eq",
  "neq",
  "in",
  "not_in",
  "includes",
  "includes_any",
  "gt",
  "gte",
  "lt",
  "lte",
  "is_true",
  "is_false",
  "is_null",
  "is_not_null",
] as const;

export const fallbackModes = ["unknown", "not_applicable"] as const;

export const verificationStatuses = [
  "PENDING_SOURCE_FIELDS",
  "READY_FOR_REVIEW",
  "VERIFIED_READY_FOR_PROMOTION",
  "BLOCKED",
] as const;

export const verificationWorkflowStatuses = [
  "blocked",
  "partially_verified",
  "promotable",
  "promoted",
] as const;

export const reviewerDecisions = [
  "pending",
  "request_changes",
  "approve_for_promotion",
  "promote_now",
] as const;

export const brakingTypes = ["conventional", "regen", "mixed"] as const;
export const steeringTypes = ["mechanical", "electric", "steer_by_wire"] as const;
export const headlampTypes = ["halogen", "led", "matrix_led"] as const;
export const fuelTypes = ["petrol", "diesel", "lpg", "cng", "lng", "h2", "none"] as const;

export const missingSourceFieldValues = [
  "official_url",
  "oj_reference",
  "last_verified_on",
] as const;

export const targetCountryOptions = {
  eu: [
    { code: "AT", label: "Austria" },
    { code: "BE", label: "Belgium" },
    { code: "BG", label: "Bulgaria" },
    { code: "CY", label: "Cyprus" },
    { code: "CZ", label: "Czech Republic" },
    { code: "DE", label: "Germany" },
    { code: "DK", label: "Denmark" },
    { code: "EE", label: "Estonia" },
    { code: "ES", label: "Spain" },
    { code: "FI", label: "Finland" },
    { code: "FR", label: "France" },
    { code: "GR", label: "Greece" },
    { code: "HR", label: "Croatia" },
    { code: "HU", label: "Hungary" },
    { code: "IE", label: "Ireland" },
    { code: "IT", label: "Italy" },
    { code: "LT", label: "Lithuania" },
    { code: "LU", label: "Luxembourg" },
    { code: "LV", label: "Latvia" },
    { code: "MT", label: "Malta" },
    { code: "NL", label: "Netherlands" },
    { code: "PL", label: "Poland" },
    { code: "PT", label: "Portugal" },
    { code: "RO", label: "Romania" },
    { code: "SE", label: "Sweden" },
    { code: "SI", label: "Slovenia" },
    { code: "SK", label: "Slovakia" },
  ],
  nonEu: [
    { code: "UK", label: "United Kingdom" },
    { code: "CH", label: "Switzerland" },
    { code: "NO", label: "Norway" },
    { code: "IS", label: "Iceland" },
    { code: "LI", label: "Liechtenstein" },
    { code: "TR", label: "Turkey" },
  ],
} as const;

export const connectivityOptions = [
  { value: "telematics", label: "Telematics" },
  { value: "mobile_app", label: "Mobile app" },
  { value: "remote_control", label: "Remote control" },
  { value: "ota", label: "OTA updates" },
] as const;

export const dataFlagOptions = [
  { value: "cabin_camera", label: "Cabin camera" },
  { value: "driver_profiling", label: "Driver profiling" },
  { value: "biometric_data", label: "Biometric data" },
  { value: "location_tracking", label: "Location tracking" },
] as const;

export const adasFeatureOptions = [
  { value: "lane_keeping", label: "Lane keeping assist" },
  { value: "adaptive_cruise", label: "Adaptive cruise control" },
  { value: "blind_spot", label: "Blind spot detection" },
  { value: "cross_traffic", label: "Cross traffic alert" },
  { value: "traffic_sign", label: "Traffic sign recognition" },
  { value: "night_vision", label: "Night vision" },
  { value: "surround_view", label: "Surround view" },
] as const;

export const bodyTypeOptions = [
  "sedan", "suv", "hatchback", "wagon", "coupe", "convertible",
  "van", "pickup", "bus", "truck", "chassis_cab", "other",
] as const;

export const frameworkDefinitions = {
  MN: {
    label: "M/N categories (cars, buses, trucks)",
    primary_framework: "Regulation (EU) 2018/858",
    categories: ["M1", "M2", "M3", "N1", "N2", "N3"],
  },
  L: {
    label: "L-category (two/three-wheelers, quadricycles)",
    primary_framework: "Regulation (EU) No 168/2013",
    categories: ["L1e", "L2e", "L3e", "L4e", "L5e", "L6e", "L7e"],
  },
  O: {
    label: "O-category (trailers)",
    primary_framework: "Regulation (EU) 2018/858",
    categories: ["O1", "O2", "O3", "O4"],
  },
  AGRI: {
    label: "Agricultural/forestry vehicles",
    primary_framework: "Regulation (EU) No 167/2013",
    categories: ["T1", "T2", "T3", "T4", "T5", "C", "R", "S"],
  },
} as const;

export const jurisdictionLevelSchema = z.enum(jurisdictionLevels);
export const frameworkGroupSchema = z.enum(frameworkGroups);
export const legalFamilySchema = z.enum(legalFamilies);
export const uiPackageSchema = z.enum(uiPackages);
export const processStageSchema = z.enum(processStages);
export const ruleLifecycleStateSchema = z.enum(ruleLifecycleStates);
export const applicabilityResultSchema = z.enum(applicabilityResults);
export const sourceFamilySchema = z.enum(sourceFamilies);
export const outputKindSchema = z.enum(outputKinds);
export const ownerHintSchema = z.enum(ownerHints);
export const salesModelSchema = z.enum(salesModels);
export const consumerOrFleetSchema = z.enum(consumerOrFleetOptions);
export const approvalTypeSchema = z.enum(approvalTypes);
export const steeringPositionSchema = z.enum(steeringPositions);
export const completionStateSchema = z.enum(completionStates);
export const powertrainSchema = z.enum(powertrains);
export const batteryCapacityBandSchema = z.enum(batteryCapacityBands);
export const automationLevelSchema = z.enum(automationLevels);
export const aiLevelSchema = z.enum(aiLevels);
export const ruleStatusSchema = z.enum(ruleStatusValues);
export const matchModeSchema = z.enum(matchModes);
export const conditionOperatorSchema = z.enum(conditionOperators);
export const fallbackModeSchema = z.enum(fallbackModes);
export const verificationStatusSchema = z.enum(verificationStatuses);
export const verificationWorkflowStatusSchema = z.enum(verificationWorkflowStatuses);
export const reviewerDecisionSchema = z.enum(reviewerDecisions);
export const brakingTypeSchema = z.enum(brakingTypes);
export const steeringTypeSchema = z.enum(steeringTypes);
export const headlampTypeSchema = z.enum(headlampTypes);
export const fuelTypeSchema = z.enum(fuelTypes);
export const missingSourceFieldSchema = z.enum(missingSourceFieldValues);
export const ruleDomainSchema = z.enum(ruleDomains);
export const artifactTypeSchema = z.enum(artifactTypes);

export type JurisdictionLevel = z.infer<typeof jurisdictionLevelSchema>;
export type FrameworkGroup = z.infer<typeof frameworkGroupSchema>;
export type LegalFamily = z.infer<typeof legalFamilySchema>;
export type UIPackage = z.infer<typeof uiPackageSchema>;
export type ProcessStage = z.infer<typeof processStageSchema>;
export type RuleLifecycleState = z.infer<typeof ruleLifecycleStateSchema>;
export type ApplicabilityResult = z.infer<typeof applicabilityResultSchema>;
export type SourceFamily = z.infer<typeof sourceFamilySchema>;
export type OutputKind = z.infer<typeof outputKindSchema>;
export type OwnerHint = z.infer<typeof ownerHintSchema>;
export type ApprovalType = z.infer<typeof approvalTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type VerificationWorkflowStatus = z.infer<typeof verificationWorkflowStatusSchema>;
export type ReviewerDecision = z.infer<typeof reviewerDecisionSchema>;
export type MissingSourceField = z.infer<typeof missingSourceFieldSchema>;
export type RuleDomain = z.infer<typeof ruleDomainSchema>;
export type ArtifactType = z.infer<typeof artifactTypeSchema>;
