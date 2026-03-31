# Crackd Supabase Domain Model (Student Reference)

## Non-Negotiable Rules

- **DO NOT change or edit any RLS (Row Level Security) policies.**
- Treat the database as **read-only** and authoritative unless the task is explicitly about admin CRUD that already exists in this app.
- Many tables are written by backend services (AI API, Matrix, Admin, etc.) and should be interpreted as **logs of behavior**, not data to be mutated by hand.

## How To Use This Model

Design your views around the core objects users care about: **images**, **captions**, and **people**. Follow relationships outward. For generation lineage, rely on linked metadata (caption requests, prompt chains, humor flavors, model responses). AI-related records are execution history meant to explain results, not to be recreated.

## Table Catalog

Each table below is part of the current `cracked-staging` public schema. These notes were synced against `Crackd Database - Staging` (`qihsgnfjqmkjmoowyfbn`) on March 31, 2026.

## Shared Audit Contract

- For the tables documented here, `created_by_user_id` and `modified_by_user_id` are now non-null UUID columns.
- Most mutable tables also have non-null `modified_datetime_utc` in addition to `created_datetime_utc`.
- Common defaults in staging: audit timestamps default to `now()` and audit actor IDs default to `auth.uid()`.
- Older assumptions that these audit columns are nullable are stale.

## Canonical Row Types

Use these concrete shapes when reasoning about the main admin tables. `profile` in product language maps to the `profiles` table in Supabase.

```ts
type UUID = string;
type TimestampTz = string; // ISO timestamp from timestamptz
type BigIntLike = number;
type SmallIntLike = number;
type NumericLike = number | string;
type VectorLike = string | number[]; // treat pgvector values as opaque unless explicitly needed

type AuditFields = {
  created_datetime_utc: TimestampTz;
  modified_datetime_utc: TimestampTz;
  created_by_user_id: UUID;
  modified_by_user_id: UUID;
};

type ProfileRow = AuditFields & {
  id: UUID;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
};

type ImageRow = AuditFields & {
  id: UUID;
  url: string | null;
  is_common_use: boolean | null;
  profile_id: UUID | null;
  additional_context: string | null;
  is_public: boolean | null;
  image_description: string | null;
  celebrity_recognition: string | null;
  embedding: VectorLike | null;
};

type CaptionRow = AuditFields & {
  id: UUID;
  content: string | null;
  is_public: boolean;
  profile_id: UUID;
  image_id: UUID;
  humor_flavor_id: BigIntLike | null;
  is_featured: boolean;
  caption_request_id: BigIntLike | null;
  like_count: BigIntLike;
  llm_prompt_chain_id: BigIntLike | null;
};

type CaptionVoteRow = AuditFields & {
  id: BigIntLike;
  vote_value: 1 | -1;
  profile_id: UUID;
  caption_id: UUID;
  is_from_study: boolean;
};

type HumorFlavorRow = AuditFields & {
  id: BigIntLike;
  description: string | null;
  slug: string;
};

type HumorFlavorStepRow = AuditFields & {
  id: BigIntLike;
  humor_flavor_id: BigIntLike;
  llm_temperature: NumericLike | null;
  order_by: SmallIntLike;
  llm_input_type_id: SmallIntLike;
  llm_output_type_id: SmallIntLike;
  llm_model_id: SmallIntLike;
  humor_flavor_step_type_id: SmallIntLike;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
};

type HumorFlavorMixRow = AuditFields & {
  id: BigIntLike;
  humor_flavor_id: BigIntLike;
  caption_count: SmallIntLike;
};

type TermRow = AuditFields & {
  id: BigIntLike;
  term: string;
  definition: string;
  example: string;
  priority: SmallIntLike;
  term_type_id: SmallIntLike | null;
};

type WhitelistEmailAddressRow = AuditFields & {
  id: BigIntLike;
  email_address: string;
};

type CaptionRequestRow = AuditFields & {
  id: BigIntLike;
  profile_id: UUID;
  image_id: UUID;
};

type CaptionExampleRow = AuditFields & {
  id: BigIntLike;
  image_description: string;
  caption: string;
  explanation: string;
  priority: SmallIntLike;
  image_id: UUID | null;
};

type LlmModelRow = AuditFields & {
  id: SmallIntLike;
  name: string;
  llm_provider_id: SmallIntLike;
  provider_model_id: string;
  is_temperature_supported: boolean;
};

type LlmProviderRow = AuditFields & {
  id: SmallIntLike;
  name: string;
};

type LlmPromptChainRow = AuditFields & {
  id: BigIntLike;
  caption_request_id: BigIntLike;
};

type LlmModelResponseRow = AuditFields & {
  id: UUID;
  llm_model_response: string | null;
  processing_time_seconds: SmallIntLike;
  llm_model_id: SmallIntLike;
  profile_id: UUID;
  caption_request_id: BigIntLike;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: NumericLike | null;
  humor_flavor_id: BigIntLike;
  llm_prompt_chain_id: BigIntLike | null;
  humor_flavor_step_id: BigIntLike | null;
};

type AllowedSignupDomainRow = AuditFields & {
  id: BigIntLike;
  apex_domain: string;
};
```

### Core People & Identity

- `profiles`: Central Crackd user record (1:1 with `auth.users`) plus audit actor columns.
- `dorms`: Dorm reference records.
- `universities`: University reference records.
- `university_majors`: Major reference records.
- `university_major_mappings`: University-to-major join records.
- `profile_dorm_mappings`: Joins profiles to dorms.
- `profile_university_mappings`: Joins profiles to universities.
- `profile_university_major_mappings`: Joins profiles to university-major mappings.

### Images

- `images`: Hosted visual assets with ownership/visibility, cached semantic metadata, embeddings, and audit actor columns.
- `common_use_categories`: Curated image category definitions for consistent study pools.
- `common_use_category_image_mappings`: Links images into curated common-use categories.

### Captions

- `captions`: Generated captions tied to an image, owning profile, visibility flags, humor flavor, prompt-chain lineage, and audit actor columns.

### Caption Interactions (Behavioral Logs)

- `caption_likes`: Likes recorded via almostcrackd.ai.
- `caption_votes`: Up/down votes via slightlyhumorous.org; includes `is_from_study`.
- `caption_saved`: Personal bookmarking via almostcrackd.ai.
- `shares`: Share events.
- `share_to_destinations`: Target destinations for shares.
- `screenshots`: Screenshot events.

### Moderation

- `reported_captions`: User-flagged captions for review.
- `reported_images`: User-flagged images for review.

### Generation Requests & Lineage

- `caption_requests`: User-initiated generation entry point for an image; parent for AI activity.
- `caption_examples`: Curated example captions with explanations and optional linked image.
- `llm_prompt_chains`: Ordered LLM steps for a single caption request.
- `llm_model_responses`: Low-level log of each LLM call (prompts, model/provider, timing, temperature, humor-step context).

### Humor System (The Matrix)

- `humor_flavors`: Named, reusable generation strategies (slug + description).
- `humor_flavor_steps`: Ordered steps for each humor flavor with prompts, model, I/O types, temperature, and role.
- `humor_flavor_mix`: Mix recipe tying humor flavors to caption counts.
- `humor_flavor_step_types`: Classification of step types.
- `llm_models`: Normalized model metadata.
- `llm_providers`: Normalized provider metadata.
- `llm_input_types`: Normalized model input types.
- `llm_output_types`: Normalized model output types.
- `humor_flavor_theme_mappings`: Mappings between humor flavors and themes.
- `humor_themes`: Theme taxonomy for humor flavors.

### Community Context

- `communities`: Bounded social groups.
- `community_contexts`: Insider cultural knowledge and context, optionally with embeddings.
- `community_context_tags`: Tag definitions.
- `community_context_tag_mappings`: Tag-to-context mappings.
- `sidechat_posts`: Imported or mirrored sidechat-style post records.

### Studies & Research

- `studies`: Bounded experiment definitions with time windows.
- `study_caption_mappings`: Joins captions to studies.
- `study_caption_vote_events`: Granular study vote-event log with richer vote values and client metadata.
- `study_image_sets`: Grouped sets of images for studies.
- `study_image_set_image_mappings`: Joins images into study image sets.

### Gen-Z & Style References

- `terms`: Gen-Z vocabulary terms.
- `term_types`: Term classification.
- `news_snippets`: Real-world grounding snippets.
- `news_entities`: Entities linked to news snippets.
- `personalities`: Voice/style profiles.
- `transcripts`: Source text for styles/voices.
- `transcript_personality_mappings`: Links transcripts to personalities.

### Invitations, Access Control, and Safety

- `allowed_signup_domains`: Domains allowed to register.
- `whitelist_email_addresses`: Explicitly allowed email addresses for controlled access.
- `invitations`: Controlled onboarding.
- `bug_reports`: Operational feedback from users.
- `testflight_errors`: Testflight crash/error reports.

### Utility Relations

- `link_redirects`: Managed short-link / redirect records.
- `v_richest_image_dedup`: Read-only deduplicated image view, not a writable base table.
