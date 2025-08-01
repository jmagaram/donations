import { Link } from "react-router-dom";

const Reports = () => {
  return (
    <div>
      <h1>Reports</h1>
      <nav>
        <ul className="nav-list">
          <li><Link to="/reports/yearlytotals">Totals by Year</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Reports;