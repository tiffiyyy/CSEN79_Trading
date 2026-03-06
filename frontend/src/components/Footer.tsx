import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-box">
        <div className="col">
          <h3 className="title">Company</h3>
          <ul className="links">
            <li><Link to="#">About</Link></li>
            <li><Link to="#">Careers</Link></li>
            <li><Link to="#">Press</Link></li>
            <li><Link to="#">Contact</Link></li>
          </ul>
        </div>
        <div className="col">
          <h3 className="title">Legal</h3>
          <ul className="links">
            <li><Link to="#">Privacy</Link></li>
            <li><Link to="#">Terms</Link></li>
            <li><Link to="#">Disclosures</Link></li>
            <li><Link to="#">Cookies</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
