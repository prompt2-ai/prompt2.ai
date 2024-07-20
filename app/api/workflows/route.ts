// get workflows of the user from db and return them
import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { auth } from "@/auth"
import { v4 as uuidv4 } from 'uuid'

type Workflow = { //TODO set type on external file
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
  destroy: () => Promise<void>;
} | null;


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
  const { name, description, workflow, image, prompt, active, exclusive, tokensInput, tokensOutput } = await request.json();
  const newWorkflow = await db.Workflows.create({
    id:uuidv4(),
    name,
    description: description || "",
    userId: session.user.id,
    workflow,
    image: image || "",
    prompt,
    active: active || true,
    exclusive: exclusive || false,
    tokensInput,
    tokensOutput,
    likes: 0,
    dislikes: 0,
    downloads: 0,
    views: 0,
    remixWorkflows: 0,
    remixFrom: "",
  });
  return NextResponse.json(
    {
      newWorkflow,
    },
    { status: 200 }
  );
}

export async function DELETE (request: NextRequest) {
  //delete the workflow with the given id
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
  const { id } = await request.json();
  const workflow: Workflow | null = await db.Workflows.findByPk(id) as Workflow;

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
          message: "You are not authorized to delete this workflow.",
        },
      },
      { status: 403 }
    );
  }
  await workflow.destroy();
  return NextResponse.json(
    {
      workflow,
    },
    { status: 200 }
  );
}