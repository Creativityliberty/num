export type ExternalAgent = {
  slug: string;
  name?: string;
  description?: string;
  roleDefinition?: string;
  whenToUse?: string;
  groups?: string[];
  customInstructions?: string;
  source?: string;
  version?: string;
};

export type ImportWarning = { kind: string; message: string; ref?: string };
