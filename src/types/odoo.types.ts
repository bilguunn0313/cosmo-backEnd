// Type definitions for Odoo entities

export interface OdooUser {
  id: number;
  name: string;
  login: string;
  email: string;
  partner_id: [number, string]; // Odoo returns relations as [id, name]
  company_id: [number, string];
  active: boolean;
  create_date?: string;
  write_date?: string;
}

export interface OdooConfig {
  baseUrl: string;
  db: string;
  username: string;
  password: string;
}

export interface OdooSearchDomain {
  field: string;
  operator: string;
  value: any;
}

export type OdooSearchCondition = [string, string, any];

export interface OdooSearchParams {
  model: string;
  domain?: OdooSearchCondition[];
  fields?: string[];
  limit?: number;
  offset?: number;
}

export interface OdooResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
