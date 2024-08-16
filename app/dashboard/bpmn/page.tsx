'use client';
/* a simple custom BPMN2 viewer on browser canvas (not using bpmnjs)*/
import React, { useState } from 'react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prepareBPMN } from './actions';
import Loader from '@/components/custom/loader';
import Panel from '@/components/custom/panel';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react";
import { SaveIcon, CircleHelpIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';



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

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { BpmnVisualization,FitType } from 'bpmn-visualization';
import type { FitOptions } from 'bpmn-visualization';
import ZoomControls  from '@/components/custom/bpmn-visualization/zoomControlers';


export default function Page() {
    const [prompt, setPrompt] = useState('');
    const [subPrompt, setSubPrompt] = useState('');
    const [lint, setLint] = useState({} as any);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('' as any);
    const [xml, setXml] = useState('' as string);
    const [overflowMessage, setOverflowMessage] = useState(false);
    const [haveApiKey, setHaveApiKey] = useState(true);
    const [tokensEstimation, setTokensEstimation] = useState(0);
    const [usageMetadata, setUsageMetadata] = useState({} as any);
    const [bpmnVisualization, setBpmnVisualization] = useState<BpmnVisualization>();
    const [bpmnSvg, setBpmnSvg] = useState<string>();
    const [fitOptions, setFitOptions] = useState<FitOptions>();
    const [showControls, setShowControls] = useState(false);
    const [invalidApiKey, setInvalidApiKey] = useState("");

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        const debounceTimeout = setTimeout(async () => {
            const prep = await prepareBPMN(prompt, true);
            const tokens = prep.response;
            if (isNaN(Number(tokens))) {
                setTokensEstimation(0);
                if (tokens ==="API_KEY_INVALID")
                setInvalidApiKey("Invalid API key. Please check your API key in your profile settings.");
                else setInvalidApiKey(tokens);
                return;
            }
            setTokensEstimation(isNaN(Number(tokens)) ? 0 : Number(tokens));
        }, 500);

        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [prompt]);

    useEffect(() => {
        const run = async () => {
            if (session 
                && session.user 
                && ((session.user.apiKey !== '' && session.user.apiKey !== null)
                ||(session.user.plan === 'month'||session.user.plan === 'year'))) {
                setHaveApiKey(true);
            } else {
                setHaveApiKey(false);
            }
        };
        run();
    }, [session]);

    useEffect(() => {
        const run = async () => {
            if (!subPrompt) {
                return;
            }
            setResponse('');
            setLoading(true);
            const prep = await prepareBPMN(subPrompt);
            console.log('prep', prep);
            const xml = prep.xml;
            const usage = prep.usageMetadata;
            setUsageMetadata(usage);
            if (!xml) {
                setXml('');
                setResponse(prep.response);
                setLoading(false);
                return;
            }
            setXml(xml);
            const linter = await prep.reports;
            setLint(linter);
            console.log('lint', linter);
            updateWorkflow();
            setLoading(false);
        };
        run();
    }, [subPrompt]);

    const updateWorkflow = () => {
        
        //ensure that we are on browser and window exists
        if (typeof window === 'undefined') {
            return;
        }
        setShowControls(false);
        setTimeout(() => {
            //if xml is empty, return
            if (!xml) {
                return;
            }
            //if xmn is not a valid bpmn2 file, return
            if (xml.indexOf("definitions") === -1) {
                return;
            }
            const bpmnContainer = document.getElementById('bpmn-container');
            if (bpmnContainer) {
                // clear the container
                //detect if bpmnContainer have an svg element
                let svg = bpmnContainer.getElementsByTagName('svg');
                if (svg.length > 0) {
                    svg[0].remove();
                }
                //bpmnContainer.innerHTML = '';//just in case
             
                if (typeof window !== 'undefined') {
                 // load the new diagram
                const local_bpmnVisualization = new BpmnVisualization({
                    container: 'bpmn-container', navigation: {
                        enabled: true
                    }
                });


                const local_fitOptions: FitOptions = { type: FitType.Center, margin: 20 };
                local_bpmnVisualization.load(xml, { fit: local_fitOptions });
                if (bpmnContainer.clientHeight < bpmnContainer.scrollHeight || bpmnContainer.clientWidth < bpmnContainer.scrollWidth) {
                    setOverflowMessage(true);
                }
                setBpmnVisualization(local_bpmnVisualization);
                setBpmnSvg(local_bpmnVisualization.graph.container.innerHTML);
                setFitOptions(local_fitOptions);
                setShowControls(true);

            }
            } else {
                console.log('bpmnContainer not found');
                return;
            }
        }, 100);
    }

    useEffect(() => {
        updateWorkflow();
    }, [xml]);

    const SaveBPMN = () => {
        const [workflowName, setWorkflowName] = useState('');

        useEffect(() => {
            const name = xml.match(/name="([^"]*)"/);
            if (name && name.length > 1) {
                setWorkflowName(name[1]);
            }
        }, []);

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button onClick={() => { }} variant="default" className="float-right mb-2"><SaveIcon />&nbsp;Save this workflow</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] md:max-w-[95%] md:w-full">
                    <DialogHeader>
                        <DialogTitle>Save AI generated BPMN</DialogTitle>
                        <DialogDescription>
                            You can save the BPMN diagram to your account after reviewing it.
                            Subsequently, you can download the saved diagram as a file from your dashboard.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="m-5">
                        <Label htmlFor="save-bpmn" className='m-4'>Name</Label>
                        <Input
                            type="text"
                            id="save-bpmn"
                            placeholder="Enter the name of the workflow"
                            onChange={(e) => {
                                e.preventDefault();
                                setWorkflowName(e.target.value);
                            }}
                            value={workflowName}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            variant="default"
                            disabled={workflowName == ''}
                            onClick={async () => {
                                setLoading(true);
                                //wait 1 second to make sure the diagram is loaded, and show the funcy loader
                                await new Promise((resolve) => setTimeout(resolve, 1500));
                                await fetch('/api/workflows/mine', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        prompt: prompt,
                                        exclusive: false, //TODO switch on UI to make it private for subscribers
                                        workflow: xml,
                                        name: workflowName,
                                        image: bpmnSvg,
                                        description: "AI generated workflow",//May be added later
                                        tokensInput: ""+usageMetadata?.promptTokenCount,
                                        tokensOutput: ""+usageMetadata?.candidatesTokenCount,
                                        tokensTotal: ""+usageMetadata?.totalTokenCount
                                    }),
                                }).catch((error) => {
                                    console.error('Error:', error);
                                }).finally(() => {
                                    console.log('Workflow saved');
                                    //redirect to dashboard using nextjs router
                                    router.push('/dashboard');
                                }
                                );
                            }}
                        >
                            Save
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="destructive">
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }


    return (
        <>
            {session && session.user && <h1 className="text-2xl font-semibold">Welcome {session.user.name}!</h1>}
            {(loading || status == "loading") && <Loader></Loader>}
            {invalidApiKey && <Alert variant="destructive">
                <AlertTitle>
                    Error
                </AlertTitle>
                <AlertDescription>
                    {invalidApiKey}
                </AlertDescription>
            </Alert>}
            {!haveApiKey && <Alert variant="destructive">
                <AlertTitle>
                    Set your API key please.
                </AlertTitle>
                <AlertDescription>
                   To use this app, please either enter your API key in your profile settings or <Link className="text-xl" href="/O/subscriptions"><strong>subscribe</strong></Link> to a plan for hassle-free access to our AI generator.
                </AlertDescription>
            </Alert>}
            <Panel className="mt-10">
                <label className="block ">
                    <span className="block text-sm font-medium text-slate-700 dark:text-white">To create a workflow, provide a related prompt. {prompt !== "" && prompt.split(' ').length < 4 ? "(at least 4 words)" : ""}</span>
                    <Textarea className="mt-2" id="prompt" onChange={
                        (e) => setPrompt(e.target.value)
                    }
                        placeholder='Describe the workflow you want to create...'
                    ></Textarea>
                    {tokensEstimation>0 && <span className="mt-2 block text-sm font-light text-pretty text-gray-700 dark:text-white">
                        Prompt Tokens estimation: {tokensEstimation} <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger><CircleHelpIcon className="inline-block hover:text-red-500" /></TooltipTrigger>
                                <TooltipContent>
                                    <p>The AI model's token usage for creating the BPMN diagram is unpredictable.<br />
                                    The given tokens estimation applies solely to the prompt.<br />
                                    The maximum token limit for the AI model is 128,000 tokens.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>}
                    {Object.keys(lint).length > 0 && <span className="mt-10 block text-sm font-light text-pretty text-gray-700 dark:text-white">
                        Your workflow diagram has been created, but we found some errors. 
                        To help us generate an accurate diagram, please make sure your request clearly describes the steps of the workflow process. 
                        Need some inspiration? Check out the examples in our FAQ section.
                        If you have general questions or unrelated requests, we won't be able to address them here.
                    </span>}
                    {response && <span className="mt-10 block text-sm font-light text-pretty text-red-700 dark:text-red-400 ">{response}</span>}
                </label>
                <Button
                    disabled={!haveApiKey || prompt === '' || prompt.split(' ').length < 3 || prompt == subPrompt || tokensEstimation>127999}
                    className="mt-10"
                    onClick={() => setSubPrompt(prompt)}>Generate Workflow</Button>
                {xml && <Tabs defaultValue="workflow" className="mt-10 container">
                    <TabsList>
                        <TabsTrigger value="workflow" onClick={(_e: any) => {
                            updateWorkflow();
                        }
                        } onFocus={
                            (_e: any) => {
                                updateWorkflow();
                            }
                        }>Workflow</TabsTrigger>
                        {Object.keys(lint).length > 0 && <TabsTrigger value="errors">Errors</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="workflow">
                        {usageMetadata?.totalTokenCount&&<span id="totalTokenCount" className='float-left'>Total tokens spend {usageMetadata?.totalTokenCount}</span>}
                        <SaveBPMN />
                        <div id="bpmn-container" className="h-screen container overflow-hidden border rounded-md bg-slate-50">
                        {showControls&&<ZoomControls bpmnVisualization={bpmnVisualization} fitOptions={fitOptions} />}
                        </div>
                        {overflowMessage && <span className="mt-10 block text-sm font-light text-pretty text-gray-700 dark:text-white">
                            The diagram is too large and does not fit within the container.
                            Zoom in/out by holding the CTRL key and rolling the mouse wheel.
                            Drag/Pan the diagram by holding the mouse left button and moving the mouse to move the diagram within the container.
                            On touch screen (mobile/tablet), use two fingers to zoom or pan the diagram.
                        </span>
                        }
                    </TabsContent>
                    {Object.keys(lint).length > 0 && <TabsContent value="errors">
                        {Object.keys(lint).length > 0 && Object.keys(lint).map((key: any) => {
                            let count = 1;
                            return (
                                <div className="mt-5" key={key + "-" + count++}>
                                    <h2 className="font-semibold">{key}</h2>
                                    <ul>
                                        {lint[key].map((item: any) => {
                                            return <li className={item.category === 'error' ? "text-red-950" : ""} key={key + "-" + "-" + item.message + "-" + count++}>{item.message}<sub className='text-gray-300'>&nbsp;({item.id})</sub></li>;
                                        })}
                                    </ul>
                                </div>
                            );
                        })}</TabsContent>}
                </Tabs>}
                <hr className='mt-4'/>
                <h1 className="text-2xl font-bold mt-4">FAQ</h1>
                <Accordion type="single" collapsible>

                    <AccordionItem value="Im stuck, how can bussiness process be described?">
                        <AccordionTrigger>Im stuck, how can bussiness process be described?</AccordionTrigger>
                        <AccordionContent>
                            Here are some business workflow examples, formatted as prompts for AI-powered BPMN 2.0 diagram generation:<br />
                            <br />
                            <br />
                            <h2>1. Simple Purchase Order Approval:</h2>
                            <br />
                            <strong>Prompt:</strong> Generate a BPMN 2.0 diagram for a purchase order approval process. The process starts with a Purchase Requisition. It then goes to the department manager for approval. If approved, it proceeds to the finance department for final approval and issuance of a Purchase Order. If rejected at any stage, the Purchase Requisition is returned to the requester for revision.
                            <br />
                            <br />
                            <h2>2. Employee Onboarding:</h2>
                            <br />
                            <strong>Prompt:</strong> Create a BPMN 2.0 diagram for an employee onboarding workflow. The process begins with the acceptance of a job offer. It then includes steps for collecting employee information, setting up payroll, IT system access, assigning a mentor, orientation, and initial training.
                            <br />
                            <br />
                            <h2>3. Customer Complaint Handling:</h2>
                            <br />
                            <strong>Prompt:</strong>  Generate a BPMN 2.0 diagram for handling customer complaints. The process starts with the receipt of a complaint through various channels (phone, email, social media). It includes steps for logging the complaint, assigning it to the appropriate department, investigating the issue, providing a resolution, and following up with the customer for feedback.
                            <br />
                            <br />
                            <h2>4. Content Publishing Workflow:</h2>
                            <br />
                            <strong>Prompt:</strong> Create a BPMN 2.0 diagram for a content publishing workflow. The process involves content creation, editing, review, approval, scheduling, and finally, publishing on different platforms (website, social media). It may also include steps for promotion and performance tracking.
                            <br />
                            <br />
                            <h2>5. IT Incident Management:</h2>
                            <br />
                            <strong>Prompt:</strong> Generate a BPMN 2.0 diagram for an IT incident management process. It begins with incident reporting, followed by triage to assess severity and priority.  Next are steps for investigation, diagnosis, resolution, and closure. Include paths for escalation to higher levels of support if necessary.
                            <br />
                            <br />
                            <h2>Additional Tips for Prompts:</h2>
                            <strong>Be Specific:</strong> Clearly define the start and end events of the workflow.<br />
                            <strong>List Activities:</strong> Mention all the tasks and decision points involved in the process.<br />
                            <strong>Roles (Optional):</strong> If relevant, include the roles or departments responsible for each activity.<br />
                            <strong>Mention Exceptions:</strong> If there are alternate paths or exception handling scenarios, include those in the prompt.<br />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="Can prompt2 generate wrong workflows?">
                        <AccordionTrigger>The generated workflow is always correct?</AccordionTrigger>
                        <AccordionContent>                          
Prompt2.ai has powered by Google Gemini LLM Pro thats why leverages the latest advancements in natural language processing. <br />
However, it's important to be aware of the following:<br />
Continuously Improving: Prompt 2 is still improve it's function, so generated workflows may not always be perfect. 
  We are constantly working to improve Prompt2 based on your feedback. 
  Please review generated BPMN charts carefully before using them.<br />
Potential Errors: Due to the limitations of the AI model, occasional errors may occur in the generated workflows, outside of our control.<br />
Formatting Issues: In some cases, the underlying LLM model may produce poorly formatted workflows, resulting in the message: "Something went wrong on the linting process. Please try again."<br />
RECITATION Errors: Sometimes, the model may not produce any workflow, even with a correct prompt. This is due to a RECITATION error. In this case, try slightly modifying your prompt.<br />
For further guidance, please refer to the examples in the documentation.<br />
<br />
Thank you for your understanding and cooperation as we continue to enhance Prompt2.ai!<br />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="How can i download the generated workflow?">
                        <AccordionTrigger>How can i download the generated workflow?</AccordionTrigger>
                        <AccordionContent>
                            You can save the BPMN diagram to your account after reviewing it.
                            Subsequently, you can download the saved diagram as a file from your dashboard.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="How long it is take to generate workflow?">
                        <AccordionTrigger>How long it is take to generate workflow?</AccordionTrigger>
                        <AccordionContent>
                        The AI model is capable of generating workflows rapidly, often within seconds. 
                        However, the time required can vary depending on the complexity of the desired workflow and the clarity of the input provided. 
                        Typically, workflow generation takes less than a minute.
                        </AccordionContent>
                    </AccordionItem>

                    {session?.user.role==="subscriber"&&<AccordionItem value="How can i get more tokens?">
                        <AccordionTrigger>How can i get more tokens?</AccordionTrigger>
                        <AccordionContent>
                          You can purchase tokens separately to increase your usage limit.
                        </AccordionContent>
                    </AccordionItem>}

                   <AccordionItem value="I've got errors in my workflow, what should I do?">
                        <AccordionTrigger>I've got errors in my workflow, what should I do?</AccordionTrigger>
                        <AccordionContent>
                            If you encounter errors in your workflow, please review the prompt you provided to ensure it clearly describes the steps of the workflow process.
                            If you have general questions or unrelated requests, we won't be able to address them here.
                            To help us generate an accurate diagram, make sure your request is related to the workflow process.
                            Need some inspiration? Check out the examples in our FAQ section.
                        </AccordionContent>
                    </AccordionItem> 
                   
                </Accordion>
            </Panel>
        </>
    );
}
