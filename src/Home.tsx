import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <div>
        <Link to="/donations">Donations</Link>
        <Link to="/orgs">Organizations</Link>
        <Link to="/import">Import</Link>
        <Link to="/export">Export</Link>
      </div>
    </div>
  );
};

export default Home;
