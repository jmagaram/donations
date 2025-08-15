import { Link } from "react-router-dom";

const Reports = () => {
  return (
    <div>
      <h1>Reports</h1>
      <nav>
        <ul className="nav-list">
          <li>
            <Link to="/reports/yearlytotals?year=recent&type=paid">
              Organization totals
            </Link>
          </li>
          <li>
            <Link to="/reports/yearlytotalsbycategory?year=recent&type=paid">
              Category totals
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Reports;
