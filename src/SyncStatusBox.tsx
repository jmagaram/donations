import StatusBox from "./StatusBox";
import { type SyncError } from "./store/offlineStore";
import type { StatusBoxProps } from "./StatusBox";
import { useNavigate } from "react-router-dom";

interface SyncStatusBoxProps {
  syncError: SyncError | undefined;
  onPull: () => void;
  onPush: () => void;
  onPushForce: () => void;
  onDismissError: () => void;
}

const convertSyncErrorToStatusBoxProps = ({
  syncError,
  pull,
  push,
  pushForce,
  dismissError,
  navigate,
}: {
  syncError: SyncError;
  pull: () => void;
  push: () => void;
  pushForce: () => void;
  dismissError: () => void;
  navigate: (path: string) => void;
}): StatusBoxProps => {
  const confirmPushForce = () => {
    if (
      confirm(
        "This will delete all data on the server and replace it with the data you see now in your web browser. Are you sure?",
      )
    ) {
      pushForce();
    }
  };

  const confirmPull = () => {
    if (
      confirm(
        "All data you see here in the web browser will be deleted and replaced with the data on the server. Are you sure?",
      )
    ) {
      pull();
    }
  };
  switch (syncError) {
    case "etag-mismatch":
      return {
        kind: "error",
        header: "Sync conflict detected",
        content:
          "The data on the server is not in sync with the local data you see in your web browser. Your local data has not been saved. The data cannot be merged.",
        buttons: [
          { caption: "Keep server data", onClick: confirmPull },
          { caption: "Keep only my local data", onClick: confirmPushForce },
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
  onPushForce,
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
        pushForce: onPushForce,
        dismissError: onDismissError,
        navigate,
      })}
    />
  );
};

export default SyncStatusBox;
