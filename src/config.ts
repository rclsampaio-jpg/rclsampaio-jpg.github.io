/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Renata OS backend endpoint.
 *
 * This MUST point to a server you control (e.g. a Cloudflare Worker) that holds
 * the Gemini API key as a secret and proxies the request — never call the
 * Gemini API directly from the browser with an embedded key, since anyone
 * viewing this site's source could copy it and use it on your account.
 *
 * See /renata-os-worker in the project root for the ready-to-deploy Worker.
 * Once deployed, paste its URL here, e.g.:
 *   'https://renata-os.your-subdomain.workers.dev'
 */
export const RENATA_OS_ENDPOINT = 'https://renata-os-worker.renaser.workers.dev';
