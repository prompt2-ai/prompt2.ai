'use client';
/* a simple custom BPMN2 viewer on browser canvas (not using bpmnjs)*/
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BpmnVisualization, FitType } from 'bpmn-visualization';
import { prepareBPMN } from './actions';
import Loader from '@/components/custom/loader';
import Panel from '@/components/custom/panel';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react";
import { SaveIcon, CircleHelpIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import "./bpmn.css";


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

export default function Page() {
    const [prompt, setPrompt] = useState('');
    const [subPrompt, setSubPrompt] = useState('');

    const [lint, setLint] = useState({} as any);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('' as any);
    const [xml, setXml] = useState('' as string);
    const [overflowMessage, setOverflowMessage] = useState(false);
    const [haveApiKey, setHaveApiKey] = useState(true);
    const [tokensEstimation, setTokensEstimation] = useState("");
    const [usageMetadata, setUsageMetadata] = useState({} as any);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        const run = async () => {
            const prep = await prepareBPMN(prompt, true);
            const tokens = prep.response;
            setTokensEstimation(tokens);
        }
        run();
    }, [prompt]);

    useEffect(() => {
        const run = async () => {
            if (session && session.user && session.user.apiKey !== '' && session.user.apiKey !== null) {
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
                bpmnContainer.innerHTML = '';//just in case
                // load the new diagram
                const bpmnVisualization = new BpmnVisualization({
                    container: 'bpmn-container', navigation: {
                        enabled: true
                    }
                });

                // load the new diagram 
                bpmnVisualization.load(xml, { fit: { type: FitType.Center } });
                if (bpmnContainer.clientHeight < bpmnContainer.scrollHeight || bpmnContainer.clientWidth < bpmnContainer.scrollWidth) {
                    setOverflowMessage(true);
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
                                await fetch('/api/workflows', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        prompt: prompt,
                                        exclusive: false, //TODO switch on UI to make it private for subscribers
                                        workflow: xml,
                                        name: workflowName,
                                        description: "AI generated workflow",//May be added later
                                        tokensInput: "1", //TODO get from gemini response
                                        tokensOutput: "1" //TODO get from gemini response
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
            {!haveApiKey && <Alert variant="destructive">
                <AlertTitle>
                    Set your API key please
                </AlertTitle>
                <AlertDescription>
                    you are on a free plan, please set your API key on the profile page before starting to use the app.
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
                    {tokensEstimation && <span className="mt-2 block text-sm font-light text-pretty text-gray-700 dark:text-white">
                        Prompt Tokens estimation: {tokensEstimation} <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger><CircleHelpIcon className="inline-block hover:text-red-500" /></TooltipTrigger>
                                <TooltipContent>
                                    <p>The AI model's token usage for creating the BPMN diagram is unpredictable.The given tokens estimation applies solely to the prompt.</p>
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
                    disabled={!haveApiKey || prompt === '' || prompt.split(' ').length < 3 || prompt == subPrompt}
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
                        <div id="bpmn-container" className="container overflow-hidden border rounded-md"></div>
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

                    <AccordionItem value="Im stuct, how can bussiness process be described?">
                        <AccordionTrigger>Im stuct, how can bussiness process be described?</AccordionTrigger>
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
                            Prompt2.ai it leverages the latest advancements in natural language processing powered by Google Gemini LLM pro.
                            However, it's important to remember that prompt2 is still under development, and the generated workflows might not always be perfect.
                            Since prompt2 relies on Google Gemini LLM pro, occasional errors may occur in the generated workflow due to the inherent limitations of the AI model.
                            We are constantly improving prompt2 based on your usage, and we recommend carefully reviewing the generated BPMN chart before using it in your processes.
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

                </Accordion>
            </Panel>
        </>
    );
}


/*
{
    "reports": {
        "fake-join": [
            {
                "id": "Event_0f901wk",
                "message": "Incoming flows do not join",
                "category": "warn"
            }
        ]
    },
    "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\n  <bpmn:process id=\"pizza-ordering\" name=\"Pizza Ordering\" isExecutable=\"true\">\n    <bpmn:startEvent id=\"StartEvent_OrderPlaced\" name=\"Order Placed\">\n      <bpmn:outgoing>Flow_03bht2x</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:task id=\"Task_PreparePizza\" name=\"Prepare Pizza\">\n      <bpmn:incoming>Flow_03bht2x</bpmn:incoming>\n      <bpmn:outgoing>Flow_184xni2</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_03bht2x\" sourceRef=\"StartEvent_OrderPlaced\" targetRef=\"Task_PreparePizza\" />\n    <bpmn:task id=\"Task_WaitForBaking\" name=\"Wait for Baking\">\n      <bpmn:incoming>Flow_184xni2</bpmn:incoming>\n      <bpmn:outgoing>Flow_0o82e8u</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_184xni2\" sourceRef=\"Task_PreparePizza\" targetRef=\"Task_WaitForBaking\" />\n    <bpmn:exclusiveGateway id=\"Gateway_1thmbqm\" name=\"Quality Check\">\n      <bpmn:incoming>Flow_0o82e8u</bpmn:incoming>\n      <bpmn:outgoing>Flow_0a9gq9u</bpmn:outgoing>\n      <bpmn:outgoing>Flow_04y98ze</bpmn:outgoing>\n    </bpmn:exclusiveGateway>\n    <bpmn:sequenceFlow id=\"Flow_0o82e8u\" sourceRef=\"Task_WaitForBaking\" targetRef=\"Gateway_1thmbqm\" />\n    <bpmn:task id=\"Task_DeliverPizza\" name=\"Deliver Pizza\">\n      <bpmn:incoming>Flow_0a9gq9u</bpmn:incoming>\n      <bpmn:outgoing>Flow_166z5cu</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_0a9gq9u\" name=\"Passed\" sourceRef=\"Gateway_1thmbqm\" targetRef=\"Task_DeliverPizza\" />\n    <bpmn:task id=\"Task_SendApologyEmail\" name=\"Send Apology Email\">\n      <bpmn:incoming>Flow_04y98ze</bpmn:incoming>\n      <bpmn:outgoing>Flow_0i5a55s</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_04y98ze\" name=\"Failed\" sourceRef=\"Gateway_1thmbqm\" targetRef=\"Task_SendApologyEmail\" />\n    <bpmn:endEvent id=\"Event_0f901wk\" name=\"Order Finished\">\n      <bpmn:incoming>Flow_166z5cu</bpmn:incoming>\n      <bpmn:incoming>Flow_0i5a55s</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"Flow_166z5cu\" sourceRef=\"Task_DeliverPizza\" targetRef=\"Event_0f901wk\" />\n    <bpmn:sequenceFlow id=\"Flow_0i5a55s\" sourceRef=\"Task_SendApologyEmail\" targetRef=\"Event_0f901wk\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"pizza-ordering\">\n      <bpmndi:BPMNEdge id=\"Flow_03bht2x_di\" bpmnElement=\"Flow_03bht2x\">\n        <di:waypoint x=\"188\" y=\"117\" />\n        <di:waypoint x=\"230\" y=\"117\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_184xni2_di\" bpmnElement=\"Flow_184xni2\">\n        <di:waypoint x=\"330\" y=\"117\" />\n        <di:waypoint x=\"380\" y=\"117\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0o82e8u_di\" bpmnElement=\"Flow_0o82e8u\">\n        <di:waypoint x=\"480\" y=\"117\" />\n        <di:waypoint x=\"535\" y=\"117\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0a9gq9u_di\" bpmnElement=\"Flow_0a9gq9u\">\n        <di:waypoint x=\"560\" y=\"117\" />\n        <di:waypoint x=\"610\" y=\"117\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"572\" y=\"99\" width=\"36\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_04y98ze_di\" bpmnElement=\"Flow_04y98ze\">\n        <di:waypoint x=\"535\" y=\"142\" />\n        <di:waypoint x=\"535\" y=\"200\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"542\" y=\"164\" width=\"33\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_166z5cu_di\" bpmnElement=\"Flow_166z5cu\">\n        <di:waypoint x=\"710\" y=\"117\" />\n        <di:waypoint x=\"762\" y=\"117\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0i5a55s_di\" bpmnElement=\"Flow_0i5a55s\">\n        <di:waypoint x=\"535\" y=\"260\" />\n        <di:waypoint x=\"535\" y=\"290\" />\n        <di:waypoint x=\"762\" y=\"290\" />\n        <di:waypoint x=\"762\" y=\"135\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNShape id=\"StartEvent_OrderPlaced_di\" bpmnElement=\"StartEvent_OrderPlaced\">\n        <dc:Bounds x=\"152\" y=\"99\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"139\" y=\"142\" width=\"63\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_PreparePizza_di\" bpmnElement=\"Task_PreparePizza\">\n        <dc:Bounds x=\"230\" y=\"77\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_WaitForBaking_di\" bpmnElement=\"Task_WaitForBaking\">\n        <dc:Bounds x=\"380\" y=\"77\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Gateway_1thmbqm_di\" bpmnElement=\"Gateway_1thmbqm\" isMarkerVisible=\"true\">\n        <dc:Bounds x=\"535\" y=\"92\" width=\"50\" height=\"50\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"526\" y=\"62\" width=\"68\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_DeliverPizza_di\" bpmnElement=\"Task_DeliverPizza\">\n        <dc:Bounds x=\"610\" y=\"77\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_SendApologyEmail_di\" bpmnElement=\"Task_SendApologyEmail\">\n        <dc:Bounds x=\"485\" y=\"200\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Event_0f901wk_di\" bpmnElement=\"Event_0f901wk\">\n        <dc:Bounds x=\"762\" y=\"99\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"748\" y=\"142\" width=\"66\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>",
    "definitions": "{\"$type\":\"bpmn:Definitions\",\"id\":\"Definitions_1\",\"targetNamespace\":\"http://bpmn.io/schema/bpmn\",\"rootElements\":[{\"$type\":\"bpmn:Process\",\"id\":\"pizza-ordering\",\"name\":\"Pizza Ordering\",\"isExecutable\":true,\"flowElements\":[{\"$type\":\"bpmn:StartEvent\",\"id\":\"StartEvent_OrderPlaced\",\"name\":\"Order Placed\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_PreparePizza\",\"name\":\"Prepare Pizza\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_03bht2x\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_WaitForBaking\",\"name\":\"Wait for Baking\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_184xni2\"},{\"$type\":\"bpmn:ExclusiveGateway\",\"id\":\"Gateway_1thmbqm\",\"name\":\"Quality Check\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0o82e8u\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_DeliverPizza\",\"name\":\"Deliver Pizza\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0a9gq9u\",\"name\":\"Passed\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_SendApologyEmail\",\"name\":\"Send Apology Email\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_04y98ze\",\"name\":\"Failed\"},{\"$type\":\"bpmn:EndEvent\",\"id\":\"Event_0f901wk\",\"name\":\"Order Finished\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_166z5cu\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0i5a55s\"}]}],\"diagrams\":[{\"$type\":\"bpmndi:BPMNDiagram\",\"id\":\"BPMNDiagram_1\",\"plane\":{\"$type\":\"bpmndi:BPMNPlane\",\"id\":\"BPMNPlane_1\",\"planeElement\":[{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_03bht2x_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":188,\"y\":117},{\"$type\":\"dc:Point\",\"x\":230,\"y\":117}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_184xni2_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":330,\"y\":117},{\"$type\":\"dc:Point\",\"x\":380,\"y\":117}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0o82e8u_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":480,\"y\":117},{\"$type\":\"dc:Point\",\"x\":535,\"y\":117}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0a9gq9u_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":560,\"y\":117},{\"$type\":\"dc:Point\",\"x\":610,\"y\":117}],\"label\":{\"$type\":\"bpmndi:BPMNLabel\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":572,\"y\":99,\"width\":36,\"height\":14}}},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_04y98ze_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":535,\"y\":142},{\"$type\":\"dc:Point\",\"x\":535,\"y\":200}],\"label\":{\"$type\":\"bpmndi:BPMNLabel\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":542,\"y\":164,\"width\":33,\"height\":14}}},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_166z5cu_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":710,\"y\":117},{\"$type\":\"dc:Point\",\"x\":762,\"y\":117}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0i5a55s_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":535,\"y\":260},{\"$type\":\"dc:Point\",\"x\":535,\"y\":290},{\"$type\":\"dc:Point\",\"x\":762,\"y\":290},{\"$type\":\"dc:Point\",\"x\":762,\"y\":135}]},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"StartEvent_OrderPlaced_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":152,\"y\":99,\"width\":36,\"height\":36},\"label\":{\"$type\":\"bpmndi:BPMNLabel\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":139,\"y\":142,\"width\":63,\"height\":14}}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_PreparePizza_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":230,\"y\":77,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_WaitForBaking_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":380,\"y\":77,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Gateway_1thmbqm_di\",\"isMarkerVisible\":true,\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":535,\"y\":92,\"width\":50,\"height\":50},\"label\":{\"$type\":\"bpmndi:BPMNLabel\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":526,\"y\":62,\"width\":68,\"height\":14}}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_DeliverPizza_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":610,\"y\":77,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_SendApologyEmail_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":485,\"y\":200,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Event_0f901wk_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":762,\"y\":99,\"width\":36,\"height\":36},\"label\":{\"$type\":\"bpmndi:BPMNLabel\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":748,\"y\":142,\"width\":66,\"height\":14}}}]}}]}",
    "response": "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"```xml\\n<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<bpmn:definitions xmlns:bpmn=\\\"http://www.omg.org/spec/BPMN/20100524/MODEL\\\" xmlns:bpmndi=\\\"http://www.omg.org/spec/BPMN/20100524/DI\\\" xmlns:dc=\\\"http://www.omg.org/spec/DD/20100524/DC\\\" xmlns:di=\\\"http://www.omg.org/spec/DD/20100524/DI\\\" id=\\\"Definitions_1\\\" targetNamespace=\\\"http://bpmn.io/schema/bpmn\\\">\\n  <bpmn:process id=\\\"pizza-ordering\\\" name=\\\"Pizza Ordering\\\" isExecutable=\\\"true\\\">\\n    <bpmn:startEvent id=\\\"StartEvent_OrderPlaced\\\" name=\\\"Order Placed\\\">\\n      <bpmn:outgoing>Flow_03bht2x</bpmn:outgoing>\\n    </bpmn:startEvent>\\n    <bpmn:task id=\\\"Task_PreparePizza\\\" name=\\\"Prepare Pizza\\\">\\n      <bpmn:incoming>Flow_03bht2x</bpmn:incoming>\\n      <bpmn:outgoing>Flow_184xni2</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_03bht2x\\\" sourceRef=\\\"StartEvent_OrderPlaced\\\" targetRef=\\\"Task_PreparePizza\\\" />\\n    <bpmn:task id=\\\"Task_WaitForBaking\\\" name=\\\"Wait for Baking\\\">\\n      <bpmn:incoming>Flow_184xni2</bpmn:incoming>\\n      <bpmn:outgoing>Flow_0o82e8u</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_184xni2\\\" sourceRef=\\\"Task_PreparePizza\\\" targetRef=\\\"Task_WaitForBaking\\\" />\\n    <bpmn:exclusiveGateway id=\\\"Gateway_1thmbqm\\\" name=\\\"Quality Check\\\">\\n      <bpmn:incoming>Flow_0o82e8u</bpmn:incoming>\\n      <bpmn:outgoing>Flow_0a9gq9u</bpmn:outgoing>\\n      <bpmn:outgoing>Flow_04y98ze</bpmn:outgoing>\\n    </bpmn:exclusiveGateway>\\n    <bpmn:sequenceFlow id=\\\"Flow_0o82e8u\\\" sourceRef=\\\"Task_WaitForBaking\\\" targetRef=\\\"Gateway_1thmbqm\\\" />\\n    <bpmn:task id=\\\"Task_DeliverPizza\\\" name=\\\"Deliver Pizza\\\">\\n      <bpmn:incoming>Flow_0a9gq9u</bpmn:incoming>\\n      <bpmn:outgoing>Flow_166z5cu</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_0a9gq9u\\\" name=\\\"Passed\\\" sourceRef=\\\"Gateway_1thmbqm\\\" targetRef=\\\"Task_DeliverPizza\\\" />\\n    <bpmn:task id=\\\"Task_SendApologyEmail\\\" name=\\\"Send Apology Email\\\">\\n      <bpmn:incoming>Flow_04y98ze</bpmn:incoming>\\n      <bpmn:outgoing>Flow_0i5a55s</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_04y98ze\\\" name=\\\"Failed\\\" sourceRef=\\\"Gateway_1thmbqm\\\" targetRef=\\\"Task_SendApologyEmail\\\" />\\n    <bpmn:endEvent id=\\\"Event_0f901wk\\\" name=\\\"Order Finished\\\">\\n      <bpmn:incoming>Flow_166z5cu</bpmn:incoming>\\n      <bpmn:incoming>Flow_0i5a55s</bpmn:incoming>\\n    </bpmn:endEvent>\\n    <bpmn:sequenceFlow id=\\\"Flow_166z5cu\\\" sourceRef=\\\"Task_DeliverPizza\\\" targetRef=\\\"Event_0f901wk\\\" />\\n    <bpmn:sequenceFlow id=\\\"Flow_0i5a55s\\\" sourceRef=\\\"Task_SendApologyEmail\\\" targetRef=\\\"Event_0f901wk\\\" />\\n  </bpmn:process>\\n  <bpmndi:BPMNDiagram id=\\\"BPMNDiagram_1\\\">\\n    <bpmndi:BPMNPlane id=\\\"BPMNPlane_1\\\" bpmnElement=\\\"pizza-ordering\\\">\\n      <bpmndi:BPMNEdge id=\\\"Flow_03bht2x_di\\\" bpmnElement=\\\"Flow_03bht2x\\\">\\n        <di:waypoint x=\\\"188\\\" y=\\\"117\\\" />\\n        <di:waypoint x=\\\"230\\\" y=\\\"117\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_184xni2_di\\\" bpmnElement=\\\"Flow_184xni2\\\">\\n        <di:waypoint x=\\\"330\\\" y=\\\"117\\\" />\\n        <di:waypoint x=\\\"380\\\" y=\\\"117\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0o82e8u_di\\\" bpmnElement=\\\"Flow_0o82e8u\\\">\\n        <di:waypoint x=\\\"480\\\" y=\\\"117\\\" />\\n        <di:waypoint x=\\\"535\\\" y=\\\"117\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0a9gq9u_di\\\" bpmnElement=\\\"Flow_0a9gq9u\\\">\\n        <di:waypoint x=\\\"560\\\" y=\\\"117\\\" />\\n        <di:waypoint x=\\\"610\\\" y=\\\"117\\\" />\\n        <bpmndi:BPMNLabel>\\n          <dc:Bounds x=\\\"572\\\" y=\\\"99\\\" width=\\\"36\\\" height=\\\"14\\\" />\\n        </bpmndi:BPMNLabel>\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_04y98ze_di\\\" bpmnElement=\\\"Flow_04y98ze\\\">\\n        <di:waypoint x=\\\"535\\\" y=\\\"142\\\" />\\n        <di:waypoint x=\\\"535\\\" y=\\\"200\\\" />\\n        <bpmndi:BPMNLabel>\\n          <dc:Bounds x=\\\"542\\\" y=\\\"164\\\" width=\\\"33\\\" height=\\\"14\\\" />\\n        </bpmndi:BPMNLabel>\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_166z5cu_di\\\" bpmnElement=\\\"Flow_166z5cu\\\">\\n        <di:waypoint x=\\\"710\\\" y=\\\"117\\\" />\\n        <di:waypoint x=\\\"762\\\" y=\\\"117\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0i5a55s_di\\\" bpmnElement=\\\"Flow_0i5a55s\\\">\\n        <di:waypoint x=\\\"535\\\" y=\\\"260\\\" />\\n        <di:waypoint x=\\\"535\\\" y=\\\"290\\\" />\\n        <di:waypoint x=\\\"762\\\" y=\\\"290\\\" />\\n        <di:waypoint x=\\\"762\\\" y=\\\"135\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNShape id=\\\"StartEvent_OrderPlaced_di\\\" bpmnElement=\\\"StartEvent_OrderPlaced\\\">\\n        <dc:Bounds x=\\\"152\\\" y=\\\"99\\\" width=\\\"36\\\" height=\\\"36\\\" />\\n        <bpmndi:BPMNLabel>\\n          <dc:Bounds x=\\\"139\\\" y=\\\"142\\\" width=\\\"63\\\" height=\\\"14\\\" />\\n        </bpmndi:BPMNLabel>\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_PreparePizza_di\\\" bpmnElement=\\\"Task_PreparePizza\\\">\\n        <dc:Bounds x=\\\"230\\\" y=\\\"77\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_WaitForBaking_di\\\" bpmnElement=\\\"Task_WaitForBaking\\\">\\n        <dc:Bounds x=\\\"380\\\" y=\\\"77\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Gateway_1thmbqm_di\\\" bpmnElement=\\\"Gateway_1thmbqm\\\" isMarkerVisible=\\\"true\\\">\\n        <dc:Bounds x=\\\"535\\\" y=\\\"92\\\" width=\\\"50\\\" height=\\\"50\\\" />\\n        <bpmndi:BPMNLabel>\\n          <dc:Bounds x=\\\"526\\\" y=\\\"62\\\" width=\\\"68\\\" height=\\\"14\\\" />\\n        </bpmndi:BPMNLabel>\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_DeliverPizza_di\\\" bpmnElement=\\\"Task_DeliverPizza\\\">\\n        <dc:Bounds x=\\\"610\\\" y=\\\"77\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_SendApologyEmail_di\\\" bpmnElement=\\\"Task_SendApologyEmail\\\">\\n        <dc:Bounds x=\\\"485\\\" y=\\\"200\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Event_0f901wk_di\\\" bpmnElement=\\\"Event_0f901wk\\\">\\n        <dc:Bounds x=\\\"762\\\" y=\\\"99\\\" width=\\\"36\\\" height=\\\"36\\\" />\\n        <bpmndi:BPMNLabel>\\n          <dc:Bounds x=\\\"748\\\" y=\\\"142\\\" width=\\\"66\\\" height=\\\"14\\\" />\\n        </bpmndi:BPMNLabel>\\n      </bpmndi:BPMNShape>\\n    </bpmndi:BPMNPlane>\\n  </bpmndi:BPMNDiagram>\\n</bpmn:definitions>\\n```\"}],\"role\":\"model\"},\"finishReason\":\"STOP\",\"index\":0,\"safetyRatings\":[{\"category\":\"HARM_CATEGORY_SEXUALLY_EXPLICIT\",\"probability\":\"NEGLIGIBLE\"},{\"category\":\"HARM_CATEGORY_HATE_SPEECH\",\"probability\":\"NEGLIGIBLE\"},{\"category\":\"HARM_CATEGORY_HARASSMENT\",\"probability\":\"NEGLIGIBLE\"},{\"category\":\"HARM_CATEGORY_DANGEROUS_CONTENT\",\"probability\":\"NEGLIGIBLE\"}],\"citationMetadata\":{\"citationSources\":[{\"startIndex\":9,\"endIndex\":143,\"uri\":\"https://blog.csdn.net/java_ying/article/details/116375781\",\"license\":\"\"},{\"startIndex\":154,\"endIndex\":358,\"uri\":\"https://forum.bpmn.io/t/modeler-bug-morphing-into-default-flow-should-remove-condition/436\",\"license\":\"\"}]}}],\"usageMetadata\":{\"promptTokenCount\":134,\"candidatesTokenCount\":2411,\"totalTokenCount\":2545}}"
}
*/

/*
{
    "reports": {
        "conditional-flows": [
            {
                "id": "Flow_0z6v383",
                "message": "Sequence flow is missing condition",
                "path": [
                    "conditionExpression"
                ],
                "category": "error"
            }
        ],
        "label-required": [
            {
                "id": "StartEvent_1",
                "message": "Element is missing label/name",
                "path": [
                    "name"
                ],
                "category": "error"
            },
            {
                "id": "Gateway_1n7u0pq",
                "message": "Element is missing label/name",
                "path": [
                    "name"
                ],
                "category": "error"
            },
            {
                "id": "Event_06vckd7",
                "message": "Element is missing label/name",
                "path": [
                    "name"
                ],
                "category": "error"
            },
            {
                "id": "Event_0sbykwu",
                "message": "Element is missing label/name",
                "path": [
                    "name"
                ],
                "category": "error"
            }
        ],
        "no-overlapping-elements": [
            {
                "id": "Task_0z3d8yu",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Task_1o8t6p2",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Task_1h7f58n",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Gateway_1n7u0pq",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Task_1s8le9g",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Task_069u2ty",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Event_06vckd7",
                "message": "Element overlaps with other element",
                "category": "warn"
            },
            {
                "id": "Event_0sbykwu",
                "message": "Element overlaps with other element",
                "category": "warn"
            }
        ]
    },
    "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\n  <bpmn:process id=\"PizzaOrderProcess\" isExecutable=\"false\">\n    <bpmn:startEvent id=\"StartEvent_1\">\n      <bpmn:outgoing>Flow_020rkkw</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:task id=\"Task_0z3d8yu\" name=\"Receive Order\">\n      <bpmn:incoming>Flow_020rkkw</bpmn:incoming>\n      <bpmn:outgoing>Flow_1g7jgrd</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_020rkkw\" sourceRef=\"StartEvent_1\" targetRef=\"Task_0z3d8yu\" />\n    <bpmn:task id=\"Task_1o8t6p2\" name=\"Prepare Pizza\">\n      <bpmn:incoming>Flow_1g7jgrd</bpmn:incoming>\n      <bpmn:outgoing>Flow_1q46j5v</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_1g7jgrd\" sourceRef=\"Task_0z3d8yu\" targetRef=\"Task_1o8t6p2\" />\n    <bpmn:task id=\"Task_1h7f58n\" name=\"Bake Pizza\">\n      <bpmn:incoming>Flow_1q46j5v</bpmn:incoming>\n      <bpmn:outgoing>Flow_183im0u</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_1q46j5v\" sourceRef=\"Task_1o8t6p2\" targetRef=\"Task_1h7f58n\" />\n    <bpmn:exclusiveGateway id=\"Gateway_1n7u0pq\" default=\"Flow_0s9p5c3\">\n      <bpmn:incoming>Flow_183im0u</bpmn:incoming>\n      <bpmn:outgoing>Flow_0s9p5c3</bpmn:outgoing>\n      <bpmn:outgoing>Flow_0z6v383</bpmn:outgoing>\n    </bpmn:exclusiveGateway>\n    <bpmn:sequenceFlow id=\"Flow_183im0u\" sourceRef=\"Task_1h7f58n\" targetRef=\"Gateway_1n7u0pq\" />\n    <bpmn:task id=\"Task_1s8le9g\" name=\"Deliver Pizza\">\n      <bpmn:incoming>Flow_0s9p5c3</bpmn:incoming>\n      <bpmn:outgoing>Flow_0g3vtt9</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_0s9p5c3\" sourceRef=\"Gateway_1n7u0pq\" targetRef=\"Task_1s8le9g\" />\n    <bpmn:task id=\"Task_069u2ty\" name=\"Send Apology Email\">\n      <bpmn:incoming>Flow_0z6v383</bpmn:incoming>\n      <bpmn:outgoing>Flow_0xnaoxh</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"Flow_0z6v383\" sourceRef=\"Gateway_1n7u0pq\" targetRef=\"Task_069u2ty\" />\n    <bpmn:endEvent id=\"Event_06vckd7\">\n      <bpmn:incoming>Flow_0g3vtt9</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"Flow_0g3vtt9\" sourceRef=\"Task_1s8le9g\" targetRef=\"Event_06vckd7\" />\n    <bpmn:endEvent id=\"Event_0sbykwu\">\n      <bpmn:incoming>Flow_0xnaoxh</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"Flow_0xnaoxh\" sourceRef=\"Task_069u2ty\" targetRef=\"Event_0sbykwu\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"PizzaOrderProcess\">\n      <bpmndi:BPMNEdge id=\"Flow_020rkkw_di\" bpmnElement=\"Flow_020rkkw\">\n        <di:waypoint x=\"188\" y=\"99\" />\n        <di:waypoint x=\"233\" y=\"99\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_1g7jgrd_di\" bpmnElement=\"Flow_1g7jgrd\">\n        <di:waypoint x=\"283\" y=\"99\" />\n        <di:waypoint x=\"333\" y=\"99\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_1q46j5v_di\" bpmnElement=\"Flow_1q46j5v\">\n        <di:waypoint x=\"383\" y=\"99\" />\n        <di:waypoint x=\"433\" y=\"99\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_183im0u_di\" bpmnElement=\"Flow_183im0u\">\n        <di:waypoint x=\"483\" y=\"99\" />\n        <di:waypoint x=\"533\" y=\"99\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0s9p5c3_di\" bpmnElement=\"Flow_0s9p5c3\">\n        <di:waypoint x=\"583\" y=\"99\" />\n        <di:waypoint x=\"633\" y=\"99\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0z6v383_di\" bpmnElement=\"Flow_0z6v383\">\n        <di:waypoint x=\"560\" y=\"122\" />\n        <di:waypoint x=\"560\" y=\"170\" />\n        <di:waypoint x=\"633\" y=\"170\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0g3vtt9_di\" bpmnElement=\"Flow_0g3vtt9\">\n        <di:waypoint x=\"683\" y=\"99\" />\n        <di:waypoint x=\"733\" y=\"99\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"Flow_0xnaoxh_di\" bpmnElement=\"Flow_0xnaoxh\">\n        <di:waypoint x=\"683\" y=\"170\" />\n        <di:waypoint x=\"733\" y=\"170\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\n        <dc:Bounds x=\"152\" y=\"81\" width=\"36\" height=\"36\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_0z3d8yu_di\" bpmnElement=\"Task_0z3d8yu\">\n        <dc:Bounds x=\"233\" y=\"59\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_1o8t6p2_di\" bpmnElement=\"Task_1o8t6p2\">\n        <dc:Bounds x=\"333\" y=\"59\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_1h7f58n_di\" bpmnElement=\"Task_1h7f58n\">\n        <dc:Bounds x=\"433\" y=\"59\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Gateway_1n7u0pq_di\" bpmnElement=\"Gateway_1n7u0pq\" isMarkerVisible=\"true\">\n        <dc:Bounds x=\"533\" y=\"79\" width=\"50\" height=\"50\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_1s8le9g_di\" bpmnElement=\"Task_1s8le9g\">\n        <dc:Bounds x=\"633\" y=\"59\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Task_069u2ty_di\" bpmnElement=\"Task_069u2ty\">\n        <dc:Bounds x=\"633\" y=\"130\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Event_06vckd7_di\" bpmnElement=\"Event_06vckd7\">\n        <dc:Bounds x=\"733\" y=\"81\" width=\"36\" height=\"36\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"Event_0sbykwu_di\" bpmnElement=\"Event_0sbykwu\">\n        <dc:Bounds x=\"733\" y=\"152\" width=\"36\" height=\"36\" />\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>",
    "definitions": "{\"$type\":\"bpmn:Definitions\",\"id\":\"Definitions_1\",\"targetNamespace\":\"http://bpmn.io/schema/bpmn\",\"rootElements\":[{\"$type\":\"bpmn:Process\",\"id\":\"PizzaOrderProcess\",\"isExecutable\":false,\"flowElements\":[{\"$type\":\"bpmn:StartEvent\",\"id\":\"StartEvent_1\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_0z3d8yu\",\"name\":\"Receive Order\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_020rkkw\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_1o8t6p2\",\"name\":\"Prepare Pizza\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_1g7jgrd\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_1h7f58n\",\"name\":\"Bake Pizza\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_1q46j5v\"},{\"$type\":\"bpmn:ExclusiveGateway\",\"id\":\"Gateway_1n7u0pq\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_183im0u\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_1s8le9g\",\"name\":\"Deliver Pizza\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0s9p5c3\"},{\"$type\":\"bpmn:Task\",\"id\":\"Task_069u2ty\",\"name\":\"Send Apology Email\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0z6v383\"},{\"$type\":\"bpmn:EndEvent\",\"id\":\"Event_06vckd7\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0g3vtt9\"},{\"$type\":\"bpmn:EndEvent\",\"id\":\"Event_0sbykwu\"},{\"$type\":\"bpmn:SequenceFlow\",\"id\":\"Flow_0xnaoxh\"}]}],\"diagrams\":[{\"$type\":\"bpmndi:BPMNDiagram\",\"id\":\"BPMNDiagram_1\",\"plane\":{\"$type\":\"bpmndi:BPMNPlane\",\"id\":\"BPMNPlane_1\",\"planeElement\":[{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_020rkkw_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":188,\"y\":99},{\"$type\":\"dc:Point\",\"x\":233,\"y\":99}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_1g7jgrd_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":283,\"y\":99},{\"$type\":\"dc:Point\",\"x\":333,\"y\":99}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_1q46j5v_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":383,\"y\":99},{\"$type\":\"dc:Point\",\"x\":433,\"y\":99}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_183im0u_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":483,\"y\":99},{\"$type\":\"dc:Point\",\"x\":533,\"y\":99}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0s9p5c3_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":583,\"y\":99},{\"$type\":\"dc:Point\",\"x\":633,\"y\":99}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0z6v383_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":560,\"y\":122},{\"$type\":\"dc:Point\",\"x\":560,\"y\":170},{\"$type\":\"dc:Point\",\"x\":633,\"y\":170}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0g3vtt9_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":683,\"y\":99},{\"$type\":\"dc:Point\",\"x\":733,\"y\":99}]},{\"$type\":\"bpmndi:BPMNEdge\",\"id\":\"Flow_0xnaoxh_di\",\"waypoint\":[{\"$type\":\"dc:Point\",\"x\":683,\"y\":170},{\"$type\":\"dc:Point\",\"x\":733,\"y\":170}]},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"_BPMNShape_StartEvent_2\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":152,\"y\":81,\"width\":36,\"height\":36}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_0z3d8yu_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":233,\"y\":59,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_1o8t6p2_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":333,\"y\":59,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_1h7f58n_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":433,\"y\":59,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Gateway_1n7u0pq_di\",\"isMarkerVisible\":true,\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":533,\"y\":79,\"width\":50,\"height\":50}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_1s8le9g_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":633,\"y\":59,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Task_069u2ty_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":633,\"y\":130,\"width\":100,\"height\":80}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Event_06vckd7_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":733,\"y\":81,\"width\":36,\"height\":36}},{\"$type\":\"bpmndi:BPMNShape\",\"id\":\"Event_0sbykwu_di\",\"bounds\":{\"$type\":\"dc:Bounds\",\"x\":733,\"y\":152,\"width\":36,\"height\":36}}]}}]}",
    "response": "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"```xml\\n<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<bpmn:definitions xmlns:bpmn=\\\"http://www.omg.org/spec/BPMN/20100524/MODEL\\\" xmlns:bpmndi=\\\"http://www.omg.org/spec/BPMN/20100524/DI\\\" xmlns:dc=\\\"http://www.omg.org/spec/DD/20100524/DC\\\" xmlns:di=\\\"http://www.omg.org/spec/DD/20100524/DI\\\" id=\\\"Definitions_1\\\" targetNamespace=\\\"http://bpmn.io/schema/bpmn\\\">\\n  <bpmn:process id=\\\"PizzaOrderProcess\\\" isExecutable=\\\"false\\\">\\n    <bpmn:startEvent id=\\\"StartEvent_1\\\">\\n      <bpmn:outgoing>Flow_020rkkw</bpmn:outgoing>\\n    </bpmn:startEvent>\\n    <bpmn:task id=\\\"Task_0z3d8yu\\\" name=\\\"Receive Order\\\">\\n      <bpmn:incoming>Flow_020rkkw</bpmn:incoming>\\n      <bpmn:outgoing>Flow_1g7jgrd</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_020rkkw\\\" sourceRef=\\\"StartEvent_1\\\" targetRef=\\\"Task_0z3d8yu\\\" />\\n    <bpmn:task id=\\\"Task_1o8t6p2\\\" name=\\\"Prepare Pizza\\\">\\n      <bpmn:incoming>Flow_1g7jgrd</bpmn:incoming>\\n      <bpmn:outgoing>Flow_1q46j5v</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_1g7jgrd\\\" sourceRef=\\\"Task_0z3d8yu\\\" targetRef=\\\"Task_1o8t6p2\\\" />\\n    <bpmn:task id=\\\"Task_1h7f58n\\\" name=\\\"Bake Pizza\\\">\\n      <bpmn:incoming>Flow_1q46j5v</bpmn:incoming>\\n      <bpmn:outgoing>Flow_183im0u</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_1q46j5v\\\" sourceRef=\\\"Task_1o8t6p2\\\" targetRef=\\\"Task_1h7f58n\\\" />\\n    <bpmn:exclusiveGateway id=\\\"Gateway_1n7u0pq\\\" default=\\\"Flow_0s9p5c3\\\">\\n      <bpmn:incoming>Flow_183im0u</bpmn:incoming>\\n      <bpmn:outgoing>Flow_0s9p5c3</bpmn:outgoing>\\n      <bpmn:outgoing>Flow_0z6v383</bpmn:outgoing>\\n    </bpmn:exclusiveGateway>\\n    <bpmn:sequenceFlow id=\\\"Flow_183im0u\\\" sourceRef=\\\"Task_1h7f58n\\\" targetRef=\\\"Gateway_1n7u0pq\\\" />\\n    <bpmn:task id=\\\"Task_1s8le9g\\\" name=\\\"Deliver Pizza\\\">\\n      <bpmn:incoming>Flow_0s9p5c3</bpmn:incoming>\\n      <bpmn:outgoing>Flow_0g3vtt9</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_0s9p5c3\\\" sourceRef=\\\"Gateway_1n7u0pq\\\" targetRef=\\\"Task_1s8le9g\\\" />\\n    <bpmn:task id=\\\"Task_069u2ty\\\" name=\\\"Send Apology Email\\\">\\n      <bpmn:incoming>Flow_0z6v383</bpmn:incoming>\\n      <bpmn:outgoing>Flow_0xnaoxh</bpmn:outgoing>\\n    </bpmn:task>\\n    <bpmn:sequenceFlow id=\\\"Flow_0z6v383\\\" sourceRef=\\\"Gateway_1n7u0pq\\\" targetRef=\\\"Task_069u2ty\\\" />\\n    <bpmn:endEvent id=\\\"Event_06vckd7\\\">\\n      <bpmn:incoming>Flow_0g3vtt9</bpmn:incoming>\\n    </bpmn:endEvent>\\n    <bpmn:sequenceFlow id=\\\"Flow_0g3vtt9\\\" sourceRef=\\\"Task_1s8le9g\\\" targetRef=\\\"Event_06vckd7\\\" />\\n    <bpmn:endEvent id=\\\"Event_0sbykwu\\\">\\n      <bpmn:incoming>Flow_0xnaoxh</bpmn:incoming>\\n    </bpmn:endEvent>\\n    <bpmn:sequenceFlow id=\\\"Flow_0xnaoxh\\\" sourceRef=\\\"Task_069u2ty\\\" targetRef=\\\"Event_0sbykwu\\\" />\\n  </bpmn:process>\\n  <bpmndi:BPMNDiagram id=\\\"BPMNDiagram_1\\\">\\n    <bpmndi:BPMNPlane id=\\\"BPMNPlane_1\\\" bpmnElement=\\\"PizzaOrderProcess\\\">\\n      <bpmndi:BPMNEdge id=\\\"Flow_020rkkw_di\\\" bpmnElement=\\\"Flow_020rkkw\\\">\\n        <di:waypoint x=\\\"188\\\" y=\\\"99\\\" />\\n        <di:waypoint x=\\\"233\\\" y=\\\"99\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_1g7jgrd_di\\\" bpmnElement=\\\"Flow_1g7jgrd\\\">\\n        <di:waypoint x=\\\"283\\\" y=\\\"99\\\" />\\n        <di:waypoint x=\\\"333\\\" y=\\\"99\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_1q46j5v_di\\\" bpmnElement=\\\"Flow_1q46j5v\\\">\\n        <di:waypoint x=\\\"383\\\" y=\\\"99\\\" />\\n        <di:waypoint x=\\\"433\\\" y=\\\"99\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_183im0u_di\\\" bpmnElement=\\\"Flow_183im0u\\\">\\n        <di:waypoint x=\\\"483\\\" y=\\\"99\\\" />\\n        <di:waypoint x=\\\"533\\\" y=\\\"99\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0s9p5c3_di\\\" bpmnElement=\\\"Flow_0s9p5c3\\\">\\n        <di:waypoint x=\\\"583\\\" y=\\\"99\\\" />\\n        <di:waypoint x=\\\"633\\\" y=\\\"99\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0z6v383_di\\\" bpmnElement=\\\"Flow_0z6v383\\\">\\n        <di:waypoint x=\\\"560\\\" y=\\\"122\\\" />\\n        <di:waypoint x=\\\"560\\\" y=\\\"170\\\" />\\n        <di:waypoint x=\\\"633\\\" y=\\\"170\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0g3vtt9_di\\\" bpmnElement=\\\"Flow_0g3vtt9\\\">\\n        <di:waypoint x=\\\"683\\\" y=\\\"99\\\" />\\n        <di:waypoint x=\\\"733\\\" y=\\\"99\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNEdge id=\\\"Flow_0xnaoxh_di\\\" bpmnElement=\\\"Flow_0xnaoxh\\\">\\n        <di:waypoint x=\\\"683\\\" y=\\\"170\\\" />\\n        <di:waypoint x=\\\"733\\\" y=\\\"170\\\" />\\n      </bpmndi:BPMNEdge>\\n      <bpmndi:BPMNShape id=\\\"_BPMNShape_StartEvent_2\\\" bpmnElement=\\\"StartEvent_1\\\">\\n        <dc:Bounds x=\\\"152\\\" y=\\\"81\\\" width=\\\"36\\\" height=\\\"36\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_0z3d8yu_di\\\" bpmnElement=\\\"Task_0z3d8yu\\\">\\n        <dc:Bounds x=\\\"233\\\" y=\\\"59\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_1o8t6p2_di\\\" bpmnElement=\\\"Task_1o8t6p2\\\">\\n        <dc:Bounds x=\\\"333\\\" y=\\\"59\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_1h7f58n_di\\\" bpmnElement=\\\"Task_1h7f58n\\\">\\n        <dc:Bounds x=\\\"433\\\" y=\\\"59\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Gateway_1n7u0pq_di\\\" bpmnElement=\\\"Gateway_1n7u0pq\\\" isMarkerVisible=\\\"true\\\">\\n        <dc:Bounds x=\\\"533\\\" y=\\\"79\\\" width=\\\"50\\\" height=\\\"50\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_1s8le9g_di\\\" bpmnElement=\\\"Task_1s8le9g\\\">\\n        <dc:Bounds x=\\\"633\\\" y=\\\"59\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Task_069u2ty_di\\\" bpmnElement=\\\"Task_069u2ty\\\">\\n        <dc:Bounds x=\\\"633\\\" y=\\\"130\\\" width=\\\"100\\\" height=\\\"80\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Event_06vckd7_di\\\" bpmnElement=\\\"Event_06vckd7\\\">\\n        <dc:Bounds x=\\\"733\\\" y=\\\"81\\\" width=\\\"36\\\" height=\\\"36\\\" />\\n      </bpmndi:BPMNShape>\\n      <bpmndi:BPMNShape id=\\\"Event_0sbykwu_di\\\" bpmnElement=\\\"Event_0sbykwu\\\">\\n        <dc:Bounds x=\\\"733\\\" y=\\\"152\\\" width=\\\"36\\\" height=\\\"36\\\" />\\n      </bpmndi:BPMNShape>\\n    </bpmndi:BPMNPlane>\\n  </bpmndi:BPMNDiagram>\\n</bpmn:definitions>\\n```\"}],\"role\":\"model\"},\"finishReason\":\"STOP\",\"index\":0,\"safetyRatings\":[{\"category\":\"HARM_CATEGORY_SEXUALLY_EXPLICIT\",\"probability\":\"NEGLIGIBLE\"},{\"category\":\"HARM_CATEGORY_HATE_SPEECH\",\"probability\":\"NEGLIGIBLE\"},{\"category\":\"HARM_CATEGORY_HARASSMENT\",\"probability\":\"NEGLIGIBLE\"},{\"category\":\"HARM_CATEGORY_DANGEROUS_CONTENT\",\"probability\":\"NEGLIGIBLE\"}],\"citationMetadata\":{\"citationSources\":[{\"startIndex\":9,\"endIndex\":143,\"uri\":\"https://blog.csdn.net/java_ying/article/details/116375781\",\"license\":\"\"},{\"startIndex\":154,\"endIndex\":358,\"uri\":\"https://forum.bpmn.io/t/modeler-bug-morphing-into-default-flow-should-remove-condition/436\",\"license\":\"\"},{\"startIndex\":2616,\"endIndex\":2760,\"uri\":\"https://github.com/camunda-community-hub/camunda-platform-7-mail\",\"license\":\"\"}]}}],\"usageMetadata\":{\"promptTokenCount\":156,\"candidatesTokenCount\":2579,\"totalTokenCount\":2735}}"
}
*/