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
//get session from auth
import { getSession } from "@/app/actions";

export default function Page() {
    const [prompt, setPrompt] = useState('');
    const [subPrompt, setSubPrompt] = useState('');
    const [lint, setLint] = useState({} as any);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('' as any);
    const [xml, setXml] = useState('' as any);
    const [overflowMessage, setOverflowMessage] = useState(false);
    const [session, setSession] = useState<any>(null);
    //get session
    useEffect(() => {
        const run = async () => {
            const s = await getSession();
            console.log('session', s);
            if (s === undefined || s === null) {
                setSession(null);
                //redirect to login
                window.location.href = '/login';
                return;
            }
            //set session
            setSession(s);
        };
        run();
    }, []);

    useEffect(() => {
        const run = async () => {
            if (!subPrompt) {
                return;
            }
            setResponse('');
            setLoading(true);
            const prep = await prepareBPMN(subPrompt);
            const xml = prep.xml;
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
    },[subPrompt]);

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
                const bpmnVisualization = new BpmnVisualization({ container: 'bpmn-container',navigation:{
                    enabled: true
                }});

                // load the new diagram 
                bpmnVisualization.load(xml, { fit:{type:FitType.Center} });
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

    return (
        <>
        {session && session.user && <h1 className="text-2xl font-semibold">Welcome {session.user.name}!</h1>}
            {loading && <Loader></Loader>}

            <Panel className="mt-10">
                <label className="block ">
                    <span className="block text-sm font-medium text-slate-700">To create a workflow, please provide a specific prompt. {prompt!==""&&prompt.split(' ').length<4?"(at least 4 words)":""}</span>
                    <Textarea className="mt-2" id="prompt" onChange={
                        (e) => setPrompt(e.target.value)
                    }
                        placeholder='Describe the workflow you want to create...'
                    ></Textarea>
                    {Object.keys(lint).length > 0 && <span className="mt-10 block text-sm font-light text-pretty text-gray-700">
                        Workflow created but with errors.
                        <br />
                        To reduce them make sure your request is about creating a workflow and give as much detail as possible.
                        <br />
                        For example, "Create a workflow for pizza ordering, preparation, wait for pizza to bake then inspecting quality, and finally delivery the pizza or send apology email."
                        <br />
                        Please note that general questions or unrelated requests cannot be answered.
                        <br />
                    </span>}
                    {response && <span className="mt-10 block text-sm font-light text-pretty text-red-700">{response}</span>}
                </label>

                <Button disabled={prompt === '' || prompt.split(' ').length < 3 || prompt==subPrompt} className="mt-10" onClick={() => setSubPrompt(prompt)}>Generate Workflow</Button>

                {xml&&<Tabs defaultValue="workflow" className="mt-10 container">
                    <TabsList>
                        <TabsTrigger value="workflow" onClick={(_e:any) => {
                          updateWorkflow();
                        }
                    } onFocus={
                        (_e:any) => {
                          updateWorkflow();
                        }
                    }>Workflow</TabsTrigger>
                        {Object.keys(lint).length > 0 && <TabsTrigger value="errors">Errors</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="workflow">
                        <div id="bpmn-container" className="container overflow-hidden border rounded-md"></div>
                        {overflowMessage&& <span className="mt-10 block text-sm font-light text-pretty text-gray-700">
                                                The diagram is too large and does not fit within the container.
                                                Zoom in/out by holding the CTRL key and rolling the mouse wheel.
                                                Drag/Pan the diagram by holding the mouse left button and moving the mouse to move the diagram within the container.
                                                On touch screen (mobile/tablet), use two fingers to zoom or pan the diagram.
                                            </span>
                        }
                        
                    </TabsContent>
                    {Object.keys(lint).length > 0 && <TabsContent value="errors">
                        {Object.keys(lint).length > 0 && Object.keys(lint).map((key: any) => {
                            let count=1;
                            return (
                                <div className="mt-5" key={key+"-"+count++}>
                                    <h2 className="font-semibold">{key}</h2>
                                    <ul>
                                        {lint[key].map((item: any) => {

                                            return <li className={item.category==='error'?"text-red-950":""} key={key+"-"+"-"+item.message+"-"+count++}>{item.message}<sub className='text-gray-300'>&nbsp;({item.id})</sub></li>;
                                        })}
                                    </ul>
                                </div>
                            );
                        })}</TabsContent>}
                </Tabs>}
            </Panel>
        </>
    );
}
