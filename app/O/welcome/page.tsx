'use client';
import React from 'react';
import { getSession } from "@/app/actions";

export default function Page() {
    const [session, setSession] = React.useState<any>(null);
    React.useEffect(() => {
        const run = async () => {
            const s = await getSession();
            if (s === undefined || s === null) {
                setSession(null);
                //redirect to login
                window.location.href = '/login';
                return;
            }
            //set session
            setSession(s);
        };
        run();
    }, []);
    return (
        <div>
            <h1>Welcome to prompt2.ai {session?session.user.name:""}</h1>
        </div>
    );
}