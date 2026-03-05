import "./Header.css"; 
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <>
            <nav className="header">
                <Link to="/">Home</Link>
                <Link to="/selection">Selection</Link>
            </nav>
        </>
    )
}