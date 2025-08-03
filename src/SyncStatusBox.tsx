import StatusBox from "./StatusBox";
import { type SyncError } from "./store/offlineStore";
import type { StatusBoxProps } from "./StatusBox";

interface SyncStatusBoxProps {
  syncError: SyncError | undefined;
  onRefreshData: () => void;
  onDismissError: () => void;
}

const convertSyncErrorToStatusBoxProps = (
  syncError: SyncError,
  refreshData: () => void,
  dismissError: () => void,
): StatusBoxProps => {
  switch (syncError) {
    case "etag-mismatch":
      return {
        kind: "error",
        header: "Data sync conflict",
        content:
          "Your data was changed elsewhere and is not in sync with your web browser. Your recent change was not saved. Try again.",
        buttons: [{ caption: "Refresh data", onClick: refreshData }],
      };
    case "network-error":
      return {
        kind: "error",
        header: "Network error",
        content: "Unable to connect to storage",
        buttons: [{ caption: "Dismiss", onClick: dismissError }],
      };
    case "data-corruption":
      return {
        kind: "error",
        header: "Data corruption",
        content: "Data could not be parsed or validated",
        buttons: [
          { caption: "Refresh Data", onClick: refreshData },
          { caption: "Dismiss", onClick: dismissError },
        ],
      };
    case "unauthorized":
      return {
        kind: "error",
        header: "Unauthorized",
        content: "Access denied",
        buttons: [{ caption: "Dismiss", onClick: dismissError }],
      };
    case "server-error":
      return {
        kind: "error",
        header: "Server error",
        content: "Server encountered an error",
        buttons: [{ caption: "Dismiss", onClick: dismissError }],
      };
    case "other":
      return {
        kind: "error",
        header: "Unknown error",
        content: "An unknown error occurred",
        buttons: [{ caption: "Dismiss", onClick: dismissError }],
      };
  }
};

const SyncStatusBox = ({ syncError, onRefreshData, onDismissError }: SyncStatusBoxProps) => {
  if (!syncError) {
    return null;
  }

  return (
    <StatusBox
      {...convertSyncErrorToStatusBoxProps(syncError, onRefreshData, onDismissError)}
    />
  );
};

export default SyncStatusBox;