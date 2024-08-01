"use client";
import Link from "next/link";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CookieBanner() {
const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
const [is_eu, setIsEU] = useState<boolean>(false);
  useEffect(() => {
    if (cookieConsent !== null) return;
    const storedCookieConsent = getLocalStorage("cookie_consent", false);
    setCookieConsent(storedCookieConsent);
    if (!storedCookieConsent) {
      const getGeoData = async () => {
      const geodataResponse = await fetch("/api/geoip");
      const geodata = await geodataResponse.json();
      if (geodata.country.is_in_european_union) setIsEU(true);
    }
    getGeoData();
    }
    }, []);

  useEffect(() => {
        // set some delay to show the cookie banner
        setTimeout(() => {
      setLocalStorage("cookie_consent", cookieConsent);   
    }, 0);
}, [cookieConsent]);

  return <>
    {(is_eu&&cookieConsent!=null&&!cookieConsent)&&<>
      <div className={`${
        cookieConsent? "hidden"
          : "flex  flex-col fixed inset-x-0 bottom-0 z-20  justify-between gap-x-8 gap-y-4 bg-white p-6 ring-1 ring-gray-900/10 md:flex-row md:items-center lg:px-8 xs:block"
      }`}
    >
      <p className="max-w-4xl text-sm leading-6 text-gray-900">
      We use cookies to improve your experience on our website, understand how it's used, and tailor content to your interests. If you continue browsing, we'll assume you're happy with this. For more details, check out our{" "}
        <Link className="font-semibold text-[#8A2BE2]" href="/O/legal/cookies">
          cookie policy
        </Link>
      </p>

      <div className="flex gap-2">
        <div className="mr-16 flex flex-none items-center gap-x-5">
          <button
            onClick={() => setCookieConsent(true)}
            type="button"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            OK I Understand 🍪
          </button>
        </div>
      </div>
    </div>
    </>}
    </>
}