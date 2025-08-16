import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <ul className="nav-list">
          <li>
            <Link to="/donations">Donations</Link>
          </li>
          <li>
            <Link to="/orgs">Organizations</Link>
          </li>
          <li>
            <Link to="/reports">Reports</Link>
          </li>
          <li>
            <Link to="/budget">Budget</Link>
          </li>
          <li>
            <Link to="/import">Import</Link>
          </li>
          <li>
            <Link to="/export">Export</Link>
          </li>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
          <li>
            <Link to="/set-password">Set password</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
