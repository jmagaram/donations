import { Link, useNavigate } from "react-router-dom";
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
    option: "pull" | "push" | "pushForce",
  ) => Promise<Result<void, SyncError>>;
}

const Header = ({ syncStatus, onSync }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(-1);
  };

  return (
    <header>
      <nav>
        <div>
          <button type="button" className="large-screen" onClick={handleBack}>
            ◁ Back
          </button>
          <Link to="/">Home</Link>
          <Link to="/donations">Donations</Link>
          <Link to="/orgs">Orgs</Link>
          <Link className="large-screen" to="/budget">
            Plan
          </Link>
          <Link className="medium-screen" to="/reports">
            Reports
          </Link>
        </div>
        <div>
          <SyncSpinner status={{ kind: "syncing" }} sync={onSync} />
          <SyncSpinner status={{ kind: "idle", requiresSync: false }} sync={onSync} />
          <SyncSpinner status={{ kind: "idle", requiresSync: true }} sync={onSync} />
          <SyncSpinner status={{ kind: "error", message: "Demo error" }} sync={onSync} />
          <SyncSpinner status={syncStatus} sync={onSync} />
          <SignOut />
        </div>
      </nav>
    </header>
  );
};

export default Header;
