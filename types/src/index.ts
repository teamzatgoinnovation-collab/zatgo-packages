/** Shared domain / API types. Expand from OpenAPI as contracts stabilize. */

export type CompanyId = string;

export interface PaginatedMeta {
  page?: number;
  page_size?: number;
  total?: number;
}
