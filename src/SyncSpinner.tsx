import {
  type SyncStatus as SyncStatusType,
  type SyncError,
} from "./store/offlineStore";
import { type Result } from "./types";

interface SyncSpinnerProps {
  status: SyncStatusType;
  sync: (
    option: "pull" | "push" | "pushForce",
  ) => Promise<Result<void, SyncError>>;
}

const SyncSpinner = ({ status, sync }: SyncSpinnerProps) => {
  const getStatusInfo = (
    status: SyncStatusType,
  ): { text: string; iconClass: string } => {
    switch (status.kind) {
      case "syncing":
        return {
          text: "Synchronizing...",
          iconClass: "sync-spinning sync-black",
        };
      case "idle":
        if (status.requiresSync) {
          return { text: "Needs sync", iconClass: "sync-red" };
        } else {
          return { text: "Up to date", iconClass: "sync-complete sync-green" };
        }
      case "error":
        return { text: "Sync error", iconClass: "sync-error sync-red" };
    }
  };

  const isDisabled = status.kind === "syncing";
  const statusInfo = getStatusInfo(status);

  const handleClick = () => {
    if (!isDisabled) {
      sync("pull");
    }
  };

  const partialCirclePath =
    "M 12 2 A 10 10 0 0 1 20.66 7 A 10 10 0 0 1 20.66 17 A 10 10 0 0 1 12 22";
  const fullCirclePath = "M 12 2 A 10 10 0 1 1 12 22 A 10 10 0 1 1 12 2";

  return (
    <button
      className="sync-status-button"
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
        <path
          d={
            statusInfo.iconClass.includes("sync-complete")
              ? fullCirclePath
              : partialCirclePath
          }
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="sync-status-text">{statusInfo.text}</span>
    </button>
  );
};

export default SyncSpinner;
