'use server';
import { auth } from "@/auth"
import db from "@/db";
import { Op } from '@sequelize/core';
import { v4 as uuidv4 } from 'uuid'
const { GoogleGenerativeAI } = require("@google/generative-ai");

import {createRequire} from 'node:module';

import { layoutProcess } from 'bpmn-auto-layout';

import Linter from 'bpmnlint/lib/linter';
import NodeResolver from 'bpmnlint/lib/resolver/node-resolver';
import BpmnModdle from 'bpmn-moddle';
import { error } from "node:console";


type UsageMetaData = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export async function prepareBPMN(subPrompt:string,countTokens:boolean=false): Promise<{reports:any[],xml:string,response:string,usageMetadata:UsageMetaData}> {
 if (!subPrompt || typeof subPrompt !== 'string') {
    return {reports:[],xml:'',response:'0',usageMetadata:{}};
  }

  const session = await auth();
  if (!session?.user) {
    return {reports:[],xml:'',response:'You are not signed in.',usageMetadata:{}};
  }

//get user API key from session if exists
const apiKey = session.user.apiKey?session.user.apiKey:session.user.role==="subscriber"?process.env.GEMINI_API_KEY:"";
if (!apiKey) {
    return {reports:[],xml:'',response:'You need a valid API key to use this feature.',usageMetadata:{}};
  }

//ask here gemini to generate bpmn2 xml from prompt
const system = "You are a BPMN expert. Your mission is to produce XML file that represents a BPMN 2.0 workflow along with BPMNDI information in it, based on the user prompt.";
const dare_prompt = "Return only a valid XML without any explanation. Do not add any statements or commentary to the contents of the source xml, though you should rephrase them a bit to avoid recitation errors. Remember that before you answer a question, you must check to see if it complies with your mission. If not, you can say: Sorry, I can't answer that question. I can only produce BPMN files based on your description.";

const prompt = system +"\n\nprompt:"+subPrompt+".\n\n" + dare_prompt;

let model;
try {
 const genAI = new GoogleGenerativeAI(apiKey); //get user api key if exists
 model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"});
} catch (error) {
  console.error("Error while getting the AI model: ",error);
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}
if (!model) {
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}

let totalTokens = 0;
try {
  const countTokensResponse = await model.countTokens(prompt);
  totalTokens = countTokensResponse.totalTokens;
  if (!totalTokens) {
    console.error("Error while counting tokens response: ",countTokensResponse);
  return {reports:[],xml:'',response:"0",usageMetadata:{}};
  }
//if countTokens is true, we only count the tokens and return the total number of tokens
if (countTokens) {
  return {reports:[],xml:'',response:totalTokens.toString(),usageMetadata:{}};
}
} catch (error:any) {
  console.error("Error while counting tokens: ",error.errorDetails[0].reason);
  return {reports:[],xml:'',response:error.errorDetails[0].reason,usageMetadata:{}};
}

let savedPromptId;
try {
/* Save the prompt to the database*/
const savedPrompt = await db.Prompts.create({
  id:uuidv4(),
  userId: session.user.id,
  userPrompt: subPrompt,
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

if (session.user.role==="subscriber" && process.env.GEMINI_API_KEY===apiKey) {
  const paidTokens = await db.Tokens.sum('value',{
    where: {
        userId: session.user.id,
        expires: {
            [Op.gte]: new Date(),
        },
    },
});

const oldestCreatedTokenDate = await db.Tokens.min('createdAt',{
    where: {
        userId: session.user.id,
        expires: {
            [Op.gte]: new Date(),
        },
    },
});

const usedTokens = await db.Prompts.sum('total_token_count',{
    where: {
      userId: session.user.id, // Filtering by user ID
      spendAt: {
        [Op.lte]: new Date(), // spendAt is less than or equal to the current date
      },
      createdAt: {
        [Op.gte]: oldestCreatedTokenDate, // createdAt is greater than or equal to the oldest token creation date
      },
    }
  });
const availableTokens = (paidTokens||0) - (usedTokens||0);
if (availableTokens < totalTokens) {
  return {reports:[],xml:'',response:'Sorry, you do not have enough tokens to use this feature.',usageMetadata:{}};
}
}




//generate content
let response:any;
const result = await model.generateContent(prompt);
try {
response = await result.response;
} catch (error) {
  console.error("Error while generating content: ",error);
  return {reports:[],xml:'',response:'Sorry, we have a problem with the AI model. Please try again later.',usageMetadata:{}};
}

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
    return {reports:[],xml:'',response:'Sorry, We got an RECITATION error from LLM. Try slightly modifying your prompt.',usageMetadata:usageMetadata};
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
  console.error("Error while getting bpmn2 from response: ",response);
  return {reports:[],xml:'',response:'Sorry, I can\'t answer that question. I can only produce BPMN files based on your description.',usageMetadata:usageMetadata};
}

if (bpmn2.indexOf("can't answer") !== -1) {
  console.error("Error while getting bpmn2 from response, can't answer: ",bpmn2);
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
//also change bpmndi layout of the bpmn2 file
try {
  const bpmn2WithoutBpmndi = bpmn2.replace(/<bpmndi:.*<\/bpmndi:.*>/g,"");
  const layoutedDiagramXML = await layoutProcess(bpmn2WithoutBpmndi); //regenerate the bpmndi,also catch possible xml errors
  
  const moddle = new BpmnModdle();
  const {
    rootElement: definitions
  } = await moddle.fromXML(layoutedDiagramXML);

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
  //TODO auto correct some of the errors like Element is missing label/name (StartEvent_1)

  //wait 1s to avoid timeout
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {reports:reports,xml:layoutedDiagramXML,response:response.candidates,usageMetadata:usageMetadata};

} catch (error) {
  console.error("Error while linting layoutedDiagramXML file: ",error);
  return {reports:[],xml:'',response:'Something went wrong on the linting process. Please try again.',usageMetadata:usageMetadata};
}

  };