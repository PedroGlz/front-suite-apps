export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  groupName: string;
}

export interface Version {
  id: string;
  applicationId: string;
  applicationName: string;
  versionName: string;
  versionCode: number;
  sha256: string;
  fileSize: number;
  releaseNotes: string | null;
  minimumAndroid: string | null;
  mandatory: boolean;
  published: boolean;
  createdAt: string;
}

export interface PortalApplication {
  id: string;
  code: string;
  name: string;
  latestVersion: Version | null;
}
