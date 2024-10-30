import {NavLink} from "react-router-dom";

export function NavbarItem({path, text}: { path: string, text: string }) {
    return <div className="group hover:-translate-y-0.5 transition">
        <NavLink to={path}>{text}</NavLink>
        <div className="mx-2 group-hover:border-b group-hover:border-red-950 "></div>
    </div>;
}