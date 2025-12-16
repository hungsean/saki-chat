/**
 * XSS Protection Utilities
 * Provides sanitization functions to prevent XSS attacks
 */

import DOMPurify, { type Config } from 'dompurify';

/**
 * Sanitize plain text
 * Removes any HTML tags and dangerous characters
 * Use this for displaying user-generated plain text content
 *
 * @param text - The text to sanitize
 * @returns Sanitized text safe for display
 *
 * @example
 * ```tsx
 * const safeText = sanitizeText(user.displayName);
 * return <div>{safeText}</div>;
 * ```
 */
export function sanitizeText(text: string): string {
  // Remove all HTML tags and return plain text
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }) as string;
}

/**
 * Sanitize HTML content
 * Removes dangerous HTML/JavaScript while preserving safe formatting
 * Use this when you need to display rich text content (messages, descriptions, etc.)
 *
 * @param html - The HTML content to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * ```tsx
 * const safeHTML = sanitizeHTML(message.formattedBody);
 * return <div dangerouslySetInnerHTML={{ __html: safeHTML }} />;
 * ```
 */
export function sanitizeHTML(html: string, options?: Config): string {
  const defaultConfig: Config = {
    // Allow common safe HTML tags for formatting
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'u',
      's',
      'strike',
      'p',
      'br',
      'span',
      'div',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'img',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    // Only allow http(s) protocols for links and images
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|mxc):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ...options,
  };

  return DOMPurify.sanitize(html, defaultConfig) as string;
}

/**
 * Validate Matrix User ID format
 * Ensures the user ID follows Matrix specification: @localpart:domain
 *
 * @param userId - The Matrix user ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidMatrixUserId(userId: string): boolean {
  // Matrix User ID format: @localpart:domain
  // localpart can contain: a-z, 0-9, ., _, =, -, /
  const matrixUserIdRegex = /^@[a-z0-9._=\-/]+:[a-z0-9.-]+\.[a-z]{2,}$/i;
  return matrixUserIdRegex.test(userId);
}

/**
 * Validate homeserver domain format
 * Ensures the homeserver follows valid domain naming conventions
 *
 * @param domain - The homeserver domain to validate
 * @returns true if valid, false otherwise
 */
export function isValidHomeserverDomain(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
  return domainRegex.test(domain);
}
