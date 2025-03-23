import { createFlagsmithInstance } from "flagsmith/isomorphic";

// For Next.js 13.4+ with built-in React cache()
export const getServerFlags = async () => {
  const flagsmith = createFlagsmithInstance();
  await flagsmith.init({
    environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID || "",
    // Add any other config options
  });

  return {
    flagsmith,
    getState: () => flagsmith.getState(),
    hasFeature: (key: string) => flagsmith.hasFeature(key),
    getValue: (
      key: string,
      fallback?: string | number | boolean  | null
    ) => flagsmith.getValue(key, { fallback }),
  };
};
