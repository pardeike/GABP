import { ErrorObject, ValidateFunction } from 'ajv';

export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
}

export interface GabpMessage {
  v: string;
  id: string;
  type: 'request' | 'response' | 'event';
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  channel?: string;
  seq?: number;
  payload?: any;
}

export interface SchemaCollection {
  envelope: any;
  methods: { [key: string]: any };
  events: { [key: string]: any };
  common: { [key: string]: any };
}

export function validateMessage(message: any): ValidationResult;
export function validateWithSchema(schemaName: string, data: any): ValidationResult;
export function getValidator(schemaName: string): ValidateFunction;

export function validateRequest(message: any): ValidationResult;
export function validateResponse(message: any): ValidationResult;
export function validateEvent(message: any): ValidationResult;

export const schemas: SchemaCollection;
export const ajv: any;