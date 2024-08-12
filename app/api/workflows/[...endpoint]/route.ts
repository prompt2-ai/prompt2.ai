// get workflows of the user from db and return them
import { NextRequest, NextResponse } from "next/server";
import db from "@/db";

import { auth } from "@/auth"
import { v4 as uuidv4 } from 'uuid'
import type { Workflow } from "@/types/workflow";

type DBWorkflow = Workflow & { 
  update: (attributes: Partial<Workflow>) => Promise<void>;
  destroy: () => Promise<void>;
} | null;

export async function GET(request: NextRequest) {
  let workflows:DBWorkflow[]= [null];

  let page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  let limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
  let order = request.nextUrl.searchParams.get("order") || "createdAt";
  if (!["createdAt", "likes", "dislikes", "downloads", "views","tokensInput","tokensOutput"].includes(order)) {
    order = "createdAt";
  }
  let direction = request.nextUrl.searchParams.get("direction") || "DESC";
  if (!["ASC", "DESC"].includes(direction)) {
    direction = "DESC";
  }
  let search = request.nextUrl.searchParams.get("search") || "";
  //sanitize search input string
  search = search.replace(/[^a-zA-Z0-9 ]/g, "");

  if (isNaN(page)) page = 1;
  if (isNaN(limit)) limit = 10;
  if (limit > 100) limit = 100; // prevent abuse

  if (request.nextUrl.pathname === "/api/workflows/all/count") {
    //get the total number of workflows
    let where:any = {
        exclusive: false,
        active: true,
       }   
    if (search) {
      where = {
        ...where,
        name: {[db.Op.like]: `%${search}%`}
      }
    }
    const count = await db.Workflows.count(
        {
            where: where,
        }
    );
    const totalPages = Math.ceil(count / limit);
    return NextResponse.json(
        {
            totalPages
        },
        {
            status: 200
        }
   );
  } else
  if (request.nextUrl.pathname === "/api/workflows/mine/count") {
    //get the total number of workflows of the user
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
    const count = await db.Workflows.count(
        {
            where: {
                userId: session.user.id,
                active: true,
            },
        }
    );
    const totalPages = Math.ceil(count / limit);
    return NextResponse.json(
        {
            totalPages
        },
        {
            status: 200
        }
    );
  } else
  if (request.nextUrl.pathname === "/api/workflows/all") {
    let where:any = {
        exclusive: false,
        active: true,
       }
    if (search) {
      where = {
        ...where,
        name: {[db.Op.like]: `%${search}%`}
      }
    }
       workflows = await db.Workflows.findAll(
        {
            where: where,
            limit: limit,
            offset: (page - 1) * limit,
            order: [[order, direction]],
        }
    ) as unknown as DBWorkflow[];
  }
  else 
  { //get all workflows of the user
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
   workflows = await db.Workflows.findAll(
        {
            where: {
                userId: session.user.id,
                active: true,
            },
            limit: limit,
            offset: (page - 1) * limit,
            order: [[order, direction]],
        }
    ) as unknown as DBWorkflow[];
  }

  
  //return the workflows
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
  const workflow: DBWorkflow = await db.Workflows.findByPk(id) as DBWorkflow;

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
  const workflow: DBWorkflow = await db.Workflows.findByPk(id) as DBWorkflow;

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