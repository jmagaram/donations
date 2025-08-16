import { Link } from "react-router-dom";
import SyncSpinner from "./SyncSpinner";
import SignOut from "./SignOut";
import {
  type SyncStatus as SyncStatusType,
  type SyncError,
} from "../store/offlineStore";
import { type Result } from "../result";

interface HeaderProps {
  syncStatus: SyncStatusType;
  onSync: (
    option: "pull" | "push" | "pushForce"
  ) => Promise<Result<void, SyncError>>;
}

const Header = ({ syncStatus, onSync }: HeaderProps) => {
  return (
    <header>
      <nav>
        <div className="nav-left">
          <Link to="/">Home</Link>
          <Link to="/donations">Donations</Link>
          <Link to="/orgs">Orgs</Link>
          <Link className="large-screen" to="/budget">
            Budget
          </Link>
          <Link className="medium-screen" to="/reports">
            Reports
          </Link>
        </div>
        <div className="nav-right">
          <SyncSpinner status={syncStatus} sync={onSync} />
          <SignOut />
        </div>
      </nav>
    </header>
  );
};

export default Header;
