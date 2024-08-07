export type Workflow = {
    id: string;
    name: string;
    description: string;
    userId: string;
    workflow: string; 
    image: string;
    prompt: string;
    active: boolean;
    exclusive: boolean;
    tokensInput: number;
    tokensOutput: number;
    likes: number;
    dislikes: number;
    downloads: number;
    views: number;
    remixWorkflows: string[];
    remixFrom: string;
    createdAt: Date;
    updatedAt: Date;
  }

export type Workflows = Workflow[];