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

type Workflow = {
  id: string;
  name: string;
  description: string;
  userId: string;
  workflow: string;
  image: string;
  prompt: string;
  active: boolean;
  private: boolean;
  tokensInput: number;
  tokensOutput: number;
  createdAt: Date;
  updatedAt: Date;
  update: (attributes: Partial<Workflow>) => Promise<void>;
} | null;

export async function PUT(request: NextRequest) {
  //upade the workflow with attributes given in the body
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
  const { id, ...attributes } = await request.json();
  const workflow: Workflow | null = await db.Workflows.findByPk(id) as Workflow;
  console.log(attributes);

  if (!workflow) {
    return NextResponse.json(
      {
        error: {
          code: "not-found",
          message: "Workflow not found.",
        },
      },
      { status: 404 }
    );
  }
  if (workflow.userId !== session.user.id) {
    return NextResponse.json(
      {
        error: {
          code: "no-access",
          message: "You are not authorized to update this workflow.",
        },
      },
      { status: 403 }
    );
  }
  await workflow.update(attributes);
  return NextResponse.json(
    {
      workflow,
    },
    { status: 200 }
  );
  
}