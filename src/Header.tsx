import { Link } from "react-router-dom";

interface HeaderProps {
  networkStatus?: string;
}

const Header = ({ networkStatus }: HeaderProps) => {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/donations">Donations</Link>
        <Link to="/orgs">Organizations</Link>
        <Link to="/reports">Reports</Link>
        {networkStatus && (
          <span className="network-status">{networkStatus}</span>
        )}
      </nav>
    </header>
  );
};

export default Header;
