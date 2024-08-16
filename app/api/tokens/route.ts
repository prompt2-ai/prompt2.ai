// get available tokens for the user
import { NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/auth"

export async function GET() {
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
    //first get use subscription status and start date and if user is subscriber
    //stripe_current_period_start and stripe_current_period_end

const paidTokens = await db.Tokens.sum('value',{
    where: {
        userId: session.user.id,
        expires: {
            [db.Op.gte]: new Date(),
        },
    },
});

const oldestCreatedTokenDate = await db.Tokens.min('createdAt',{
    where: {
        userId: session.user.id,
        expires: {
            [db.Op.gte]: new Date(),
        },
    },
});

const usedTokens = await db.Prompts.sum('total_token_count',{
    where: {
      userId: session.user.id, // Filtering by user ID
      spendAt: {
        [db.Op.lte]: new Date(), // spendAt is less than or equal to the current date
      },
      createdAt: {
        [db.Op.gte]: oldestCreatedTokenDate, // createdAt is greater than or equal to the oldest token creation date
      },
    }
  });


return NextResponse.json(
    {
        paidTokens:paidTokens||0,
        usedTokens:usedTokens||0,
        availableTokens:(paidTokens||0) - (usedTokens||0),
    },
    { status: 200 }
);

}