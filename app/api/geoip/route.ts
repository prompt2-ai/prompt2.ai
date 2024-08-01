import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
//add throttle to prevent abuse of the api
//if the same ip address calls the api more than 10 times in 1 hour, return an error
//use redis to store the ip address and the number of times it has called the api
//use the ip address as the key and the number of times as the value
const ip = request.headers.get("x-real-ip");
    if (!ip) {
        return NextResponse.json(
            {
                error: {
                    code: "no-ip",
                    message: "No IP address found in the request.",
                },
            },
            { status: 400 }
        );
    }
    const response = await fetch(`https://geolite.info/geoip/v2.1/country/${ip}`, {
        headers: {
            Authorization: `Basic ${btoa(`${process.env.MAXMIND_ACCOUNT_ID}:${process.env.MAXMIND_LICENSE_KEY}`)}`,
        },
    });
    if (!response.ok) {
        return NextResponse.json(
            {
                error: {
                    code: "fetch-error",
                    message: "Error fetching data from the GeoIP service.",
                },
            },
            { status: 500 }
        );
    }
    const data = await response.json();
    return NextResponse.json(data);
}