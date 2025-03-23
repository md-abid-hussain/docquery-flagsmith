"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useFlags, useFlagsmith, FlagsmithProvider } from "flagsmith/react";
import { createFlagsmithInstance } from "flagsmith/isomorphic";
import { IState } from "flagsmith/types";

interface FeatureFlags {
  max_files_limit: number | null;
  disable_ingestion: boolean;
  refreshFlags: () => Promise<void>;
  lastUpdated: Date | null;
  isRefreshing: boolean;
}

const defaultFlags = {
  max_files_limit: 5,
  disable_ingestion: false,
  refreshFlags: async () => {},
  lastUpdated: null,
  isRefreshing: false,
};

const FeatureFlagContext = createContext<FeatureFlags>(defaultFlags);

export const useFeatureFlags = () => useContext(FeatureFlagContext);

const FlagProvider = ({ children }: { children: ReactNode }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const flagsmith = useFlagsmith();

  let flagData;

  try {
    // ⚠️ IMPORTANT: Include refreshCounter in the dependency array
    flagData = useFlags(["max_files_limit", "disable_ingestion"], [refreshCounter.toString()]);
  } catch (e) {
    console.error("Error fetching flags", e);
    flagData = {
      max_files_limit: { value: defaultFlags.max_files_limit, enabled:true },
      disable_ingestion: { enabled: defaultFlags.disable_ingestion },
    };
  }

  const refreshFlags = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Force SDK to re-fetch flags from the server (not from cache)
      await flagsmith.getFlags(); 
      
      // Update refresh counter to trigger a re-render with the new flags
      setRefreshCounter((prev) => prev + 1);
      setLastUpdated(new Date());
      console.log("Flags refreshed at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error refreshing flags:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [flagsmith]);

  // Initial flag fetch on component mount
  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  // More reliable fallback handling
  const value: FeatureFlags = {
    max_files_limit:
      flagData?.max_files_limit?.enabled 
        ? Number(flagData.max_files_limit.value) 
        : null,
    disable_ingestion:
      Boolean(flagData?.disable_ingestion?.enabled ?? defaultFlags.disable_ingestion),
    refreshFlags,
    lastUpdated,
    isRefreshing,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const FeatureFlagProvider = ({
  children,
  serverState,
}: {
  children: ReactNode;
  serverState?: IState;
}) => {
  const flagsmithInstance = useRef(createFlagsmithInstance());

  // Use a default environment ID for development if needed
  const environmentID =
    process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID ||
    (process.env.NODE_ENV === "development" ? "YOUR_DEV_ENV_ID" : "");

  useEffect(() => {
    // Initialize Flagsmith in useEffect to avoid SSR issues
    flagsmithInstance.current.init({
      environmentID,
      cacheFlags: false, // Disable caching for development
    });
  }, [environmentID]);

  return (
    <FlagsmithProvider
      flagsmith={flagsmithInstance.current}
      serverState={serverState}
      options={{
        environmentID,
        // Disable cache for more reliable updates
        cacheFlags: false,
      }}
    >
      <FlagProvider>{children}</FlagProvider>
    </FlagsmithProvider>
  );
};