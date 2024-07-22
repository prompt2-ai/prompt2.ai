'use server';
import { auth } from "@/auth"
import db from "@/db";
import { v4 as uuidv4 } from 'uuid'
const { GoogleGenerativeAI } = require("@google/generative-ai");

import {createRequire} from 'node:module';

import { layoutProcess } from 'bpmn-auto-layout';

import Linter from 'bpmnlint/lib/linter';
import NodeResolver from 'bpmnlint/lib/resolver/node-resolver';
import BpmnModdle from 'bpmn-moddle';



//import testXml from './testXml';


type UsageMetaData = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export async function prepareBPMN(subPrompt:string,countTokens:boolean=false): Promise<{reports:any[],xml:string,response:string,usageMetadata:UsageMetaData}> {
 if (!subPrompt || typeof subPrompt !== 'string') {
    return {reports:[],xml:'',response:'Please provide a valid prompt',usageMetadata:{}};
  }

  const session = await auth();
  if (!session?.user) {
    return {reports:[],xml:'',response:'You are not signed in.',usageMetadata:{}};
  }

//get user API key from session if exists
const apiKey = session.user.apiKey || session.user.role==="subscriber"?process.env.GEMINI_API_KEY:"";
  if (!apiKey) {
    return {reports:[],xml:'',response:'You need a valid API key to use this feature.',usageMetadata:{}};
  }

//ask here gemini to generate bpmn2 xml from prompt
const system = "You are a BPMN expert. Your mission is to produce XML file that represents a BPMN 2.0 diagram, based on the user prompt.";
const dare_prompt = "Return only a valid XML without any explanation.If needed, do not add any statements or commentary to the contents of the source xml document, though you should rephrase them a bit to avoid recitation errors. Keep the original code intact, but change variable names to avoid recitation errors. Remember that before you answer a question, you must check to see if it complies with your mission. If not, you can say: Sorry, I can't answer that question. I can only produce BPMN files based on your description.";

const prompt = system +"\n\nprompt:"+subPrompt+".\n\n" + dare_prompt;

const genAI = new GoogleGenerativeAI(apiKey); //get user api key if exists
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"});
if (!model) {
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}

const { totalTokens } = await model.countTokens(prompt);
if (!totalTokens) {
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}
//if countTokens is true, we only count the tokens and return the total number of tokens
if (countTokens) {
  return {reports:[],xml:'',response:totalTokens.toString(),usageMetadata:{}};
}

let savedPromptId;
try {
/* Save the prompt to the database*/
const savedPrompt = await db.Prompts.create({
  id:uuidv4(),
  userId: session.user.id,
  prompt: prompt,
  promptTokenCount: Number(totalTokens),
  candidatesTokenCount: 0,
  totalTokenCount: Number(totalTokens), //we dont know yet the totaltoken count after a successful workflow creation
  spendAt: new Date(),               //so we update it later
});
savedPromptId = savedPrompt.get('id');
} catch (error) {
  console.error("Error while saving prompt to the database: ",error);
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}

/* if the user is a subscriber, check if does have enough tokens before we send the prompt to the AI model */




//generate content
let response:any;
const result = await model.generateContent(prompt);
try {
response = await result.response;
} catch (error) {
  console.error("Error while generating content: ",error);
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}

console.log("response: ",response);
if (!response) {
  return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:{}};
}

//catch possible errors like
/*
response:  {
  candidates: [ { finishReason: 'RECITATION', index: 0 } ],
  ....
  */
let usageMetadata:UsageMetaData = {};
if (response.candidates && response.candidates.length > 0) {
  usageMetadata=response.usageMetadata;
  try{
  //update the prompt with the candidatesTokenCount and totalTokenCount
  await db.Prompts.update({
    candidatesTokenCount: response.usageMetadata.candidatesTokenCount?Number(response.usageMetadata.candidatesTokenCount):0,
    totalTokenCount: response.usageMetadata.totalTokenCount?Number(response.usageMetadata.totalTokenCount):0,
  },{
    where: {id:savedPromptId}
  });
 } catch (error) {
  console.error("Error while updating prompt in the database: ",error);
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
 }
  if (response.candidates[0].finishReason === 'RECITATION') {
    console.error("Error while generating content: ",response.candidates[0],prompt);
    return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description. You sould be more specific on your prompt.',usageMetadata:usageMetadata};
  }
  if (response.candidates[0].finishReason === 'ERROR') {
    console.error("Error while generating content: ",response.candidates[0].error,prompt);
    return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:usageMetadata};
  }
  if (response.candidates[0].finishReason !== 'STOP') {
    console.error("Error while generating content: ",response.candidates[0],prompt);
    return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:usageMetadata};
  }
}

let bpmn2 = ""
try {
  bpmn2 = response.text();
} catch (error) {
  console.error("Error while getting text from response: ",error);
  return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:usageMetadata};
}

if (!bpmn2) {
  return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:usageMetadata};
}

if (bpmn2.indexOf("can't answer") !== -1) {
  return {reports:[],xml:'',response:bpmn2,usageMetadata:usageMetadata};
}

if (bpmn2.indexOf("definitions") !== -1) {
  bpmn2 = bpmn2.replace(/.*```xml/g,"");
  bpmn2 = bpmn2.replace(/```[.\n\t\s]*/g,"");
  bpmn2 = bpmn2.trim();
} else {
  console.error("Error while getting bpmn2 xml from response: ",bpmn2);
  return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:usageMetadata};
}

//check if bpmn2 is a valid bpmn2 file
try {
  const _layoutedDiagramXML = await layoutProcess(bpmn2); //TODO removes any bpmndi,
  //ive leave it here to catch possible xml errors

  const moddle = new BpmnModdle();
  const {
    rootElement: definitions
  } = await moddle.fromXML(bpmn2);

  const config = {
    config: {
      extends: ['bpmnlint:recommended']
    },
    resolver: new NodeResolver({
      requireLocal:(path: string) => {
        if (path.includes('config/recommended')) {
        const mrequire = createRequire(import.meta.url);
        return mrequire("/app/node_modules/bpmnlint/config/recommended");
        }
        if (path.includes('rules')) {
          //extract rule name from path
          const ruleName = path.split('/').pop();
          const mrequire = createRequire(import.meta.url);
          return mrequire("/app/node_modules/bpmnlint/rules/"+ruleName);
        }
        return null;
      }
    })
  };
  
  const linter = new Linter(config);

  const reports = await linter.lint(definitions);
  //wait 1s to avoid timeout
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {reports:reports,xml:bpmn2,response:response.candidates,usageMetadata:usageMetadata};

} catch (error) {
  console.error("Error while linting bpmn2 file: ",error);
  return {reports:[],xml:'',response:'Something went wrong on linting process. Please try again.',usageMetadata:usageMetadata};
}

  };