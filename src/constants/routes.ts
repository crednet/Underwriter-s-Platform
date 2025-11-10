export const ROUTES = {
  LOGIN: "/login",

  DASHBOARD: "/",

  BVN: "/bvn",
  BVN_SEARCH: "/bvn/search",
  BVN_DETAILS: "/bvn/:id",

  SELFIE: "/selfie",
  SELFIE_DETAILS: "/selfie/:id",

  LOCATION: "/location",
  LOCATION_DETAILS: "/location/:id",

  BANK_STATEMENT: "/bank-statement",
  BANK_STATEMENT_DETAILS: "/bank-statement/:id",

  APPLICATIONS: "/applications",
  APPLICATION_DETAILS: "/applications/:id",

  USER_PROFILE: "/users/:userId",

  AUDIT: "/audit",

  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const getApplicationDetailsRoute = (id: string) =>
  ROUTES.APPLICATION_DETAILS.replace(":id", id);

export const getBVNDetailsRoute = (id: string) =>
  ROUTES.BVN_DETAILS.replace(":id", id);

export const getSelfieDetailsRoute = (id: string) =>
  ROUTES.SELFIE_DETAILS.replace(":id", id);

export const getLocationDetailsRoute = (id: string) =>
  ROUTES.LOCATION_DETAILS.replace(":id", id);

export const getBankStatementDetailsRoute = (id: string) =>
  ROUTES.BANK_STATEMENT_DETAILS.replace(":id", id);

export const getUserProfileRoute = (userId: string) =>
  ROUTES.USER_PROFILE.replace(":userId", userId);
