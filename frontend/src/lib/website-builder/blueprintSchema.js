
import { z } from "zod";

// Schema for individual event/activity
const EventItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
}).passthrough();

// Schema for schedule items
const ScheduleItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional(),
  speaker: z.string().optional(),
}).passthrough();

// Schema for speakers (research-powered)
const SpeakerSchema = z.object({
  name: z.string(),
  role: z.string(),
  company: z.string().optional(),
  bio: z.string().optional(),
}).passthrough();

// Schema for sponsors (research-powered)
const SponsorSchema = z.object({
  name: z.string(),
  tier: z.string().optional(),
}).passthrough();

// Schema for registration fields
const RegistrationFieldSchema = z.object({
  label: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
}).passthrough();

// Schema for social links
const SocialLinksSchema = z.object({
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
}).passthrough();

// Main Blueprint Schema — lenient to accept extra LLM fields
export const BlueprintSchema = z.object({
  event_name: z.string(),
  tagline: z.string(),
  date: z.string().optional(),
  location: z.string().optional(),

  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta_text: z.string(),
    background_style: z.string().optional(),
  }).passthrough(),

  about: z.object({
    title: z.string(),
    description: z.string(),
    highlights: z.array(z.string()).optional(),
  }).passthrough(),

  events: z.array(EventItemSchema).optional(),
  schedule: z.array(ScheduleItemSchema).optional(),
  speakers: z.array(SpeakerSchema).optional(),
  sponsors: z.array(SponsorSchema).optional(),

  registration: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    fields: z.array(RegistrationFieldSchema).optional(),
  }).passthrough().optional(),

  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    social_links: SocialLinksSchema.optional(),
  }).passthrough().optional(),

  theme_style: z.string().optional(),
  mood: z.string().optional(),
}).passthrough();

/**
 * Validate a blueprint JSON against the schema.
 * Returns { valid: true, data } on success,
 * or { valid: false, errors } on failure.
 */
export function validateBlueprint(json) {
  try {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    const result = BlueprintSchema.safeParse(parsed);

    if (result.success) {
      return { valid: true, data: result.data };
    }

    return {
      valid: false,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      ),
    };
  } catch (e) {
    return { valid: false, errors: [`Invalid JSON: ${e.message}`] };
  }
}
