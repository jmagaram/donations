import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
          <button id="back-button" type="button" onClick={handleBack}>
            ◁
          </button>
          <NavLink to="/" end={true}>
            Home
          </NavLink>
          <NavLink to="/donations" end={true}>
            Donations
          </NavLink>
          <NavLink to="/orgs" end={true}>
            Orgs
          </NavLink>
          <NavLink className="large-screen" to="/budget" end={true}>
            Plan
          </NavLink>
          <NavLink className="medium-screen" to="/reports" end={true}>
            Reports
          </NavLink>
        </div>
        <div>
          <SyncSpinner status={syncStatus} sync={onSync} />
          <SignOut />
        </div>
      </nav>
    </header>
  );
};

export default Header;
