'use client';
import React, { useState, useEffect, use } from 'react';
import type { Workflow, Workflows } from '@/types/workflow';
import { cn } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import Pagination from "@/components/custom/pagination";

const MasonryWallBrick = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center [&>div]:w-full",
        className
      )}
      {...props}
    />
  )
}


export default function Showcases() {
  const [workflows, setWorkflows] = useState([] as Workflows);
  const [page, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    //fetch the workflows
    fetch("/api/workflows/all/count")
      .then((res) => res.json())
      .then((data) => {
        setTotalPages(data.totalPages);
      });
  }
    , []);

  useEffect(() => {
    //fetch the workflows
    fetch("/api/workflows/all?page=" + page)
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data.workflows);
      });
  }, [page]);

  return (
    <div>
      <h1 className='text-xl'>Business Operations Compendium</h1>
      <div className="hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow: Workflow) => (<>

          <MasonryWallBrick>
            <Card>
              <CardHeader>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{workflow.image}</p>
              </CardContent>
              <CardFooter>
                <p>{workflow.prompt}</p>
              </CardFooter>
            </Card>
          </MasonryWallBrick>
        </>
        ))
        }
      </div>
      <Pagination totalPages={totalPages} currentPage={page} setCurrentPage={setCurrentPage} />
    </div>
  
  );
}