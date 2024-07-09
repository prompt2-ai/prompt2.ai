"use client";

// a sidebar component with links

import React,{useState,useEffect} from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";

export const Sidebar = ({ className,session }: { className: string,session:any }) => {
   
    const [isLogged, setIsLogged] = useState(false);
    const [onDashboard, setOnDashboard] = useState(false);
    
    useEffect(() => {
        const run = async () => {
          setOnDashboard(window.location.pathname.includes("/dashboard"));
          const s = session;
          if (s === undefined || s === null) {
            setIsLogged(false);
          } else {
            setIsLogged(true);
          }
        };
        run();
      }, [session]);

    return <>{onDashboard==true ? (<div className={cn(className, "flex flex-col gap-4")}>
         <div className={cn(className, "flex flex-col gap-4")}>
        <Link href="/dashboard/bpmn" className="text-blue-500">
            New Workflow
        </Link>
        <Link href="/dashboard/settings" className="text-blue-500">
            Settings
        </Link>
        </div>
   </div>) : (<></>)}{/*May add something here */}
   </>};

export default Sidebar;


