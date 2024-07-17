// get workflows of the user from db and return them
import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: "no-access",
            message: "You are not signed in.",
          },
        },
        { status: 401 }
      );
    }
    let page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    let limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;
    if (limit > 100) limit = 100; // prevent abuse

    const workflows = await db.Workflows.findAll(
        {
            where: {
                userId: session.user.id,
            },
            limit: limit,
            offset: (page - 1) * limit,
        }
    );
    return NextResponse.json(
        {
            workflows
        },
        {
            status: 200
        }
    );
}