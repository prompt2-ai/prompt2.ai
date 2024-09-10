'use client';
import React, { useState, useEffect, use } from 'react';
import type { Workflow, Workflows } from '@/types/workflow';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import Pagination from "@/components/custom/pagination";

type MasonryWallBrickProps = {
  brick: any; // Replace 'any' with the type of 'brick' property
} & React.HTMLAttributes<HTMLDivElement>;

const MasonryWallBrickCourse = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "gap-6 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        className
      )}
      {...props}
    />
  )
}

const MasonryWallBrick = ({
  brick,
}: MasonryWallBrickProps) => {
  return (
    <Card className='text-black bg-slate-50'>
    <CardHeader>
      <CardTitle>{brick.name}</CardTitle>
      <CardDescription />
    </CardHeader>
    <CardContent>
      <p>{brick.image ? (() => {
        const img = brick.image;
        //strip svg tag and keep all childs
        const imgStr = img.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");
        //create a svg element from the img string
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg","svg");
        svgElement.innerHTML = imgStr;
        //remove the width and height attributes if they exist
        svgElement.removeAttribute("width");
        svgElement.removeAttribute("height");
        //set the viewBox attribute to the svg element
        const viewbox=`0 0 450 300`;
        svgElement.setAttribute('viewBox', viewbox);
        //set the preserveAspectRatio attribute to the svg element
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        //return the svg element
        return <div dangerouslySetInnerHTML={{ __html:svgElement.outerHTML}} />
       } 
       )() : <Image src="/placeholder.png" alt="placeholder" width={450} height={300} />
      }
      </p>
    </CardContent>
    <CardFooter>
      <p className='truncate'>{brick.prompt}</p>
    </CardFooter>
  </Card>
  )
}

export default function MarketPlace() {
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
  }, []);

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
      <h1 className='text-xl'>BPMN Blueprints</h1>
      <MasonryWallBrickCourse>
        {workflows.map((workflow: Workflow, id) => (
          <MasonryWallBrick key={id} brick={workflow}/>
        ))
        }
        </MasonryWallBrickCourse>
      <Pagination totalPages={totalPages} currentPage={page} setCurrentPage={setCurrentPage} />
    </div> 
  );
}