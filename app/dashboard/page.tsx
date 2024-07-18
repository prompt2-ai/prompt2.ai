'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { BpmnVisualization, FitType } from 'bpmn-visualization';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {CirclePlusIcon} from "lucide-react";


type workflow = {
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
}

type workflows = workflow[];






export default function Page() {
  const { data: session, status } = useSession();
  const [workflows, setWorkflows] = useState([] as workflows);
  const [overflowMessage, setOverflowMessage] = useState(false);

  useEffect(() => {
    //fetch the workflows of the user from api /api/workflows
    fetch("/api/workflows")
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data.workflows);
      });
  }
    , []);

  const updateWorkflow = (bpmnxml: string, index: number) => {
    setTimeout(() => {
      //if xml is empty, return
      if (!bpmnxml) {
        console.log('xml is empty');
        return;
      }
      //if xmn is not a valid bpmn2 file, return
      if (bpmnxml.indexOf("definitions") === -1) {
        return;
      }
      const bpmnContainer = document.getElementById('bpmn-container-' + index);
      if (bpmnContainer) {
        // clear the container
        //detect if bpmnContainer have an svg element
        let svg = bpmnContainer.getElementsByTagName('svg');
        if (svg.length > 0) {
          svg[0].remove();
        }
        bpmnContainer.innerHTML = '';//just in case
        // load the new diagram
        const bpmnVisualization = new BpmnVisualization({
          container: 'bpmn-container-' + index, navigation: {
            enabled: true
          }
        });

        // load the new diagram 
        bpmnVisualization.load(bpmnxml, { fit: { type: FitType.Center } });
        if (bpmnContainer.clientHeight < bpmnContainer.scrollHeight || bpmnContainer.clientWidth < bpmnContainer.scrollWidth) {
          setOverflowMessage(true);
        }
      } else {
        console.log('bpmnContainer not found');
        return;
      }
    }, 1000);
  }

  const previewBPMN = (bpmnxml: string, index: number) => {

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={() => {

            updateWorkflow(bpmnxml, index);
          }
          } variant="default" className="w-full">view</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] md:max-w-[95%] md:w-full">
          <DialogHeader>
            <DialogTitle>preview BPMN</DialogTitle>
            <DialogDescription>
              preview the BPMN diagram of the workflow.
            </DialogDescription>
          </DialogHeader>
          <div id={"bpmn-container-" + index} className="container overflow-hidden border rounded-md bg-slate-50"></div>
          {overflowMessage && <span className="mt-10 block text-sm font-light text-pretty text-gray-700 dark:text-white">
            The diagram is too large and does not fit within the container.
            Zoom in/out by holding the CTRL key and rolling the mouse wheel.
            Drag/Pan the diagram by holding the mouse left button and moving the mouse to move the diagram within the container.
            On touch screen (mobile/tablet), use two fingers to zoom or pan the diagram.
          </span>
          }

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }


  return (

    <div className='p-8'>
      {session && <h1> Welcome to your dashboard, {session?.user?.name}!</h1>}
      <Link
          href="/dashboard/bpmn"
          className={cn(
            buttonVariants({ variant: "destructive" }),
            "top-[69px] float-right absolute right-4"
          )}
        >
           <CirclePlusIcon />&nbsp; New Workflow
        </Link>

      <Table>
        <TableCaption>A list of your workflows.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Name</TableHead>
            <TableHead className="w-2/4">Prompt</TableHead>
            <TableHead className="w-1/4 text-right">Workflow</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>

          {workflows.map((workflow, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{workflow.name} </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{workflow.prompt.substring(0, 60) + "..."}</TooltipTrigger>
                    <TooltipContent>
                      <p dangerouslySetInnerHTML={{ __html: workflow.prompt.replaceAll("\n", "<br />") }} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right"><code>{previewBPMN(workflow.workflow, index)}</code></TableCell>
            </TableRow>))
          }
        </TableBody>
      </Table>
    </div>
  );
}

