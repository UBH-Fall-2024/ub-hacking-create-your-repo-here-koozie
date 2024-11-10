import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('authToken');

                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/me`, {
                    method: 'GET',
                    headers: {
                        "Authorization": "Bearer " + token,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setUser(await response.json())
                }
            } catch (err) {
            }
        };

        fetchUserData();
    }, []);





    return (
        <>
            <header className="bg-blue-900 fixed top-0 left-0 w-full z-10">
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <Link to="/" className="-m-1.5 p-1.5">
                            <span className="doto text-2xl font-semibold text-slate-50">KoozieUB</span>
                        </Link>
                    </div>



                    {user ? <button onClick={() => {
                        fetch("")
                    }} className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <span className="text-sm/6 font-semibold text-slate-50">Sign out</span>
                    </button> : <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <Link to="/sign-in" className="text-sm/6 font-semibold text-slate-50">Sign in <span aria-hidden="true">&rarr;</span></Link>
                    </div>}
                </nav>
            </header>
            <div className="w-full h-[80px]"></div>
        </>
    );

};

export default Header;