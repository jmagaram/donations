import StatusBox from "./StatusBox";
import { type SyncError } from "./store/offlineStore";
import type { StatusBoxProps } from "./StatusBox";

interface SyncStatusBoxProps {
  syncError: SyncError | undefined;
  onPull: () => void;
  onPush: () => void;
  onPushForce: () => void;
  onDismissError: () => void;
}

const convertSyncErrorToStatusBoxProps = (
  syncError: SyncError,
  pull: () => void,
  push: () => void,
  pushForce: () => void,
  dismissError: () => void,
): StatusBoxProps => {
  switch (syncError) {
    case "etag-mismatch":
      return {
        kind: "error",
        header: "Data sync conflict",
        content:
          "The data on the server is not in sync with the local data you see in your web browser. Your local data has not been saved. The data can not be merged and you need to choose which version to keep.",
        buttons: [
          { caption: "Dismiss", onClick: dismissError },
          { caption: "Keep server", onClick: pull },
          { caption: "Keep local", onClick: pushForce },
        ],
      };
    case "network-error":
      return {
        kind: "error",
        header: "Network error",
        content:
          "Unable to connect to internet storage to save and load your data.",
        buttons: [
          { caption: "Dismiss", onClick: dismissError },
          { caption: "Retry", onClick: push },
        ],
      };
    case "data-corruption":
      return {
        kind: "error",
        header: "Data corruption",
        content:
          "The data on the server seems to be corrupt. Consider importing a backup, or try saving your data again.",
        buttons: [
          { caption: "Dismiss", onClick: dismissError },
          { caption: "Save local data", onClick: pushForce },
        ],
      };
    case "unauthorized":
      return {
        kind: "error",
        header: "Unauthorized",
        content:
          "Some kind of security issue prevents you from accessing data on the server.",
        buttons: [
          { caption: "Dismiss", onClick: dismissError },
          { caption: "Retry", onClick: push },
        ],
      };
    case "server-error":
      return {
        kind: "error",
        header: "Server error",
        content: "Server encountered an error",
        buttons: [
          { caption: "Dismiss", onClick: dismissError },
          { caption: "Retry", onClick: push },
        ],
      };
    case "other":
      return {
        kind: "error",
        header: "Unknown error",
        content: "An unexpected error occurred",
        buttons: [
          { caption: "Dismiss", onClick: dismissError },
          { caption: "Retry", onClick: push },
        ],
      };
  }
};

const SyncStatusBox = ({
  syncError,
  onPull,
  onPush,
  onPushForce,
  onDismissError,
}: SyncStatusBoxProps) => {
  if (!syncError) {
    return null;
  }

  return (
    <StatusBox
      {...convertSyncErrorToStatusBoxProps(
        syncError,
        onPull,
        onPush,
        onPushForce,
        onDismissError,
      )}
    />
  );
};

export default SyncStatusBox;
