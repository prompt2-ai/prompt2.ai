"use client";
import Link from "next/link";
function NotFound() {
return (
    <>
        <div className="w-full h-full flex justify-center items-center">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="8" fill="white" />
                <circle cx="50" cy="50" r="30" fill="black" />
                <text x="50" y="57" textAnchor="middle" fill="white" fontSize="24">404</text>
            </svg>
        </div>
        <h1 className="text-2xl text-center">BPMN2 Ends here.</h1>
        <div className="w-full h-full flex justify-center items-center">    
            <Link href="/">Go back to the home page</Link>
        </div>
    </>
);
}

export default NotFound;