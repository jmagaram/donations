import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/orgs">Organizations</Link>
        <Link to="/donations">Donations</Link>
      </nav>
    </header>
  );
};

export default Header;
