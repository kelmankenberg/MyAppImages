export interface AppImageEntry {
  id: string;
  name: string;
  path: string;
  icon?: string;
  customIconPath?: string;
  size: number;
  version?: string;
  lastLaunched?: string;
  launchCount: number;
  customArgs?: string;
  workingDirectory?: string;
  envVars?: Record<string, string>;
  elevated?: boolean;
  sandboxMode?: boolean;
  dateAdded: string;
  lastMtimeCheck?: number;
}
