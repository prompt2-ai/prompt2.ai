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

    const user = await db.User.findOne(
        {
            where: {
                email: session.user.email,
            }
        }
    );
    return NextResponse.json(
        {
            user
        },
        {
            status: 200
        }
    );
}

export async function POST(request: NextRequest) {
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

    const user = await db.User.findOne(
        {
            where: {
                email: session.user.email,
            }
        }
    );

    if (!user) {
        return NextResponse.json(
            {
                error: {
                    code: "not-found",
                    message: "User not found.",
                },
            },
            { status: 404 }
        );
    }

    const data = await request.json();
    await user.update(data);

    return NextResponse.json(
        {
            user
        },
        {
            status: 200
        }
    );
}