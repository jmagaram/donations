import { useState } from "react";
import {
  type SyncStatus as SyncStatusType,
  type SyncError,
} from "./offlineStore";
import { type Result } from "./result";
import { useInterval } from "./useInterval";

interface SyncSpinnerProps {
  status: SyncStatusType;
  sync: (
    option: "pull" | "push" | "pushForce",
  ) => Promise<Result<void, SyncError>>;
  stalenessMinutes?: number;
}

const SyncSpinner = ({
  status,
  sync,
  stalenessMinutes = 30,
}: SyncSpinnerProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useInterval(() => {
    setCurrentTime(Date.now());
  }, 60000);

  const isDataStale = (lastPull: Date | undefined): boolean => {
    if (!lastPull) return false;
    const minutesElapsed = (currentTime - lastPull.getTime()) / (1000 * 60);
    return minutesElapsed >= stalenessMinutes;
  };

  const getStatusInfo = (
    status: SyncStatusType,
  ): { text: string; iconClass: string } => {
    switch (status.kind) {
      case "syncing":
        return {
          text: "Sync...",
          iconClass: "sync-spinning sync-black",
        };
      case "idle": {
        const needsSync =
          status.requiresSync || isDataStale(status.lastSuccessfulPull);
        if (needsSync) {
          return { text: "Needs sync", iconClass: "sync-red" };
        } else {
          return { text: "Saved", iconClass: "sync-complete sync-green" };
        }
      }
      case "error":
        return { text: "Sync error", iconClass: "sync-error sync-red" };
    }
  };

  const isDisabled = status.kind === "syncing";
  const statusInfo = getStatusInfo(status);

  const getButtonClassName = (): string => {
    const baseClass = "sync-status-button";
    const stateClass = status.kind;

    if (status.kind === "idle") {
      const needsSync =
        status.requiresSync || isDataStale(status.lastSuccessfulPull);
      const subStateClass = needsSync ? "needs-sync" : "saved";
      return `${baseClass} ${stateClass} ${subStateClass}`;
    }

    return `${baseClass} ${stateClass}`;
  };

  const handleClick = () => {
    if (!isDisabled) {
      sync("pull");
    }
  };

  const checkmarkPath = "M 6 12 L 10 16 L 18 8";

  return (
    <button
      className={getButtonClassName()}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <svg
        className={`sync-status-icon ${statusInfo.iconClass}`}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        {statusInfo.iconClass.includes("sync-complete") ? (
          <path
            d={checkmarkPath}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="14 14"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
      <span className="sync-status-text">{statusInfo.text}</span>
    </button>
  );
};

export default SyncSpinner;
