export const DEFAULT_APP_NAME = "Vantrex Classroom";

export function getAppName(): string {
  const raw = process.env.APP_NAME;
  const name = typeof raw === "string" ? raw.trim() : "";
  return name.length > 0 ? name : DEFAULT_APP_NAME;
}
