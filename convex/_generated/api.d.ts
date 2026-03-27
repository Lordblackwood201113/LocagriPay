/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib_auth from "../lib/auth.js";
import type * as lib_scoring from "../lib/scoring.js";
import type * as lib_stateMachine from "../lib/stateMachine.js";
import type * as mutations_campaigns from "../mutations/campaigns.js";
import type * as mutations_collections from "../mutations/collections.js";
import type * as mutations_cooperatives from "../mutations/cooperatives.js";
import type * as mutations_decisions from "../mutations/decisions.js";
import type * as mutations_directionValidations from "../mutations/directionValidations.js";
import type * as mutations_payments from "../mutations/payments.js";
import type * as mutations_photos from "../mutations/photos.js";
import type * as mutations_producers from "../mutations/producers.js";
import type * as mutations_quality from "../mutations/quality.js";
import type * as mutations_seed from "../mutations/seed.js";
import type * as mutations_users from "../mutations/users.js";
import type * as queries_audit from "../queries/audit.js";
import type * as queries_campaigns from "../queries/campaigns.js";
import type * as queries_collections from "../queries/collections.js";
import type * as queries_cooperatives from "../queries/cooperatives.js";
import type * as queries_decisions from "../queries/decisions.js";
import type * as queries_payments from "../queries/payments.js";
import type * as queries_photos from "../queries/photos.js";
import type * as queries_producers from "../queries/producers.js";
import type * as queries_reports from "../queries/reports.js";
import type * as queries_users from "../queries/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "lib/auth": typeof lib_auth;
  "lib/scoring": typeof lib_scoring;
  "lib/stateMachine": typeof lib_stateMachine;
  "mutations/campaigns": typeof mutations_campaigns;
  "mutations/collections": typeof mutations_collections;
  "mutations/cooperatives": typeof mutations_cooperatives;
  "mutations/decisions": typeof mutations_decisions;
  "mutations/directionValidations": typeof mutations_directionValidations;
  "mutations/payments": typeof mutations_payments;
  "mutations/photos": typeof mutations_photos;
  "mutations/producers": typeof mutations_producers;
  "mutations/quality": typeof mutations_quality;
  "mutations/seed": typeof mutations_seed;
  "mutations/users": typeof mutations_users;
  "queries/audit": typeof queries_audit;
  "queries/campaigns": typeof queries_campaigns;
  "queries/collections": typeof queries_collections;
  "queries/cooperatives": typeof queries_cooperatives;
  "queries/decisions": typeof queries_decisions;
  "queries/payments": typeof queries_payments;
  "queries/photos": typeof queries_photos;
  "queries/producers": typeof queries_producers;
  "queries/reports": typeof queries_reports;
  "queries/users": typeof queries_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
