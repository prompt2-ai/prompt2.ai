//save the user prompts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/auth"
import { v4 as uuidv4 } from 'uuid'


export async function POST(request: NextRequest) {
    //create a new workflow
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
    
    const { prompt, promptTokenCount, totalTokenCount, candidatesTokenCount } = await request.json();
    const newPrompt = await db.Prompts.create({
      id:uuidv4(),
      userId: session.user.id,
      prompt: prompt,
      promptTokenCount: promptTokenCount,
      candidatesTokenCount: candidatesTokenCount?candidatesTokenCount:0,
      totalTokenCount: totalTokenCount?totalTokenCount:0, //we dont know yet the totaltoken count after a successful workflow creation
      spendAt: new Date(),               //so we update it later
    });
    return NextResponse.json(
      {
        newPrompt,
      },
      { status: 200 }
    );
  }