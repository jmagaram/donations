import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/donations">Donations</Link>
        <Link to="/orgs">Organizations</Link>
      </nav>
    </header>
  );
};

export default Header;
