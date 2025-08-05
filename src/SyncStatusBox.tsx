import StatusBox from "./StatusBox";
import { type SyncError } from "./store/offlineStore";
import type { StatusBoxProps } from "./StatusBox";
import { useNavigate } from "react-router-dom";

interface SyncStatusBoxProps {
  syncError: SyncError | undefined;
  onPull: () => void;
  onPush: () => void;
  onDismissError: () => void;
}

const convertSyncErrorToStatusBoxProps = ({
  syncError,
  pull,
  push,
  dismissError,
  navigate,
}: {
  syncError: SyncError;
  pull: () => void;
  push: () => void;
  dismissError: () => void;
  navigate: (path: string) => void;
}): StatusBoxProps => {
  switch (syncError) {
    case "etag-mismatch":
      return {
        kind: "error",
        header: "Sync conflict detected",
        content:
          "The data on the server is not in sync with the data you see in your web browser, perhaps because it was changed by someone else on a different device. If you've made recent changes on this device, those changes will be lost.",
        buttons: [
          { caption: "Keep server data only", onClick: pull },
          { caption: "Close", onClick: dismissError },
        ],
      };
    case "network-error":
      return {
        kind: "error",
        header: "Connection failed",
        content:
          "Unable to connect to online storage to save or load your data.",
        buttons: [
          { caption: "Try again", onClick: push },
          { caption: "Close", onClick: dismissError },
        ],
      };
    case "data-corruption":
      return {
        kind: "error",
        header: "Data corruption detected",
        content:
          "The data on the server appears to be corrupt. Consider importing a backup or try saving your data again.",
        buttons: [
          { caption: "Keep my local data only", onClick: push },
          { caption: "Close", onClick: dismissError },
        ],
      };
    case "unauthorized":
      return {
        kind: "error",
        header: "Access denied",
        content: "Wrong password? You can change the password to fix this.",
        buttons: [
          {
            caption: "Set password",
            onClick: () => {
              dismissError();
              navigate("/set-password");
            },
          },
          { caption: "Try again", onClick: push },
          { caption: "Close", onClick: dismissError },
        ],
      };
    case "server-error":
      return {
        kind: "error",
        header: "Server unavailable",
        content: "Server encountered an error",
        buttons: [
          { caption: "Try again", onClick: push },
          { caption: "Close", onClick: dismissError },
        ],
      };
    case "other":
      return {
        kind: "error",
        header: "Unexpected error",
        content: "An unexpected error occurred",
        buttons: [
          { caption: "Try again", onClick: push },
          { caption: "Close", onClick: dismissError },
        ],
      };
  }
};

const SyncStatusBox = ({
  syncError,
  onPull,
  onPush,
  onDismissError,
}: SyncStatusBoxProps) => {
  const navigate = useNavigate();

  if (!syncError) {
    return null;
  }

  return (
    <StatusBox
      {...convertSyncErrorToStatusBoxProps({
        syncError,
        pull: onPull,
        push: onPush,
        dismissError: onDismissError,
        navigate,
      })}
    />
  );
};

export default SyncStatusBox;
