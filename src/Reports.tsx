import { Link } from "react-router-dom";

const Reports = () => {
  return (
    <div>
      <h1>Reports</h1>
      <nav>
        <ul className="nav-list">
          <li>
            <Link to="/reports/yearlytotals">Organization totals</Link>
          </li>
          <li>
            <Link to="/reports/yearlytotalsbycategory">Category totals</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Reports;
