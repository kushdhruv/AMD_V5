import { AppConfig, AppConfigSchema } from "./configSchema";
import { z } from "zod";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  parsedConfig: AppConfig | null;
}

/**
 * Validates the raw JSON payload against the strict schema
 * and runs business logic / dependency sandbox rules.
 */
export const validateAppConfig = (rawConfig: unknown): ValidationResult => {
  // 1. Structural Validation (Strict Schema + Limits)
  const schemaResult = AppConfigSchema.safeParse(rawConfig);
  
  if (!schemaResult.success) {
    const errorMessages = schemaResult.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { isValid: false, errors: errorMessages, parsedConfig: null };
  }

  const validConfig = schemaResult.data;
  const businessErrors: string[] = [];

  // 2. Guardrails (Limits)
  // Calculate active modules (ignoring default always-on like event_info)
  const activeModuleConfigs = Object.values(validConfig.modules).filter(val => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'object' && val !== null && 'enabled' in val) return val.enabled;
    return false;
  });

  if (activeModuleConfigs.length > 8) {
    businessErrors.push("Maximum of 8 modules can be active simultaneously to ensure app performance.");
  }

  // 3. Dependency Rules Sandbox
  if (validConfig.modules.leaderboard && !validConfig.modules.live_scores) {
    businessErrors.push("Dependency Error: Leaderboard module requires Live Scores module to be enabled.");
  }

  if (validConfig.modules.coupons && !validConfig.modules.commerce.enabled) {
    businessErrors.push("Dependency Error: Coupons module requires the Commerce (Stalls) module to be enabled.");
  }

  // 4. State & Config Freeze Rules
  // If app is GENERATED or LIVE, we shouldn't be running structural patches from the builder UI in an un-restricted way.
  // This rule usually runs at the API level (comparing old state to new state), but we can add a warning here.
  
  if (businessErrors.length > 0) {
    return { isValid: false, errors: businessErrors, parsedConfig: validConfig };
  }

  return { isValid: true, errors: [], parsedConfig: validConfig };
};
