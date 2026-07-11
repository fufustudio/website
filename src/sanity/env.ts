import { publicEnv } from "../config/env";

export const apiVersion = publicEnv.sanityApiVersion;

export const dataset = publicEnv.sanityDataset;

export const projectId = publicEnv.sanityProjectId ?? "unconfigured";

export const isSanityConfigured = Boolean(publicEnv.sanityProjectId);

export const studioUrl = publicEnv.sanityStudioUrl;
