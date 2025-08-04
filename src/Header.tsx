import { Link } from "react-router-dom";
import SyncSpinner from "./SyncSpinner";
import {
  type SyncStatus as SyncStatusType,
  type SyncError,
} from "./store/offlineStore";
import { type Result } from "./types";

interface HeaderProps {
  syncStatus: SyncStatusType;
  onSync: (
    option: "pull" | "push" | "pushForce",
  ) => Promise<Result<void, SyncError>>;
}

const Header = ({ syncStatus, onSync }: HeaderProps) => {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/donations">Donations</Link>
        <Link to="/orgs">Organizations</Link>
        <Link to="/reports">Reports</Link>
        <SyncSpinner status={syncStatus} sync={onSync} />
      </nav>
    </header>
  );
};

export default Header;
