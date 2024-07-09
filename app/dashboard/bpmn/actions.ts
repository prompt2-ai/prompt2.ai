'use server';

import {createRequire} from 'node:module';

import { layoutProcess } from 'bpmn-auto-layout';

import Linter from 'bpmnlint/lib/linter';
import NodeResolver from 'bpmnlint/lib/resolver/node-resolver';
import BpmnModdle from 'bpmn-moddle';
import testXml from './testXml';


export async function prepareBPMN(subPrompt:string){
 if (!subPrompt || typeof subPrompt !== 'string') {
    return {reports:[],xml:'',definitions:''};
  }

/* remove the comment to make actualy work

//ask here gemini to generate bpmn2 xml from prompt
const system = "You are a BPMN expert. Your mission is to produce XML file that represents a camunda BPMN 2 diagram that follows all best practices and always has a bpmndi on it, based on the user's description:";
const dare_prompt = "Return only a valid xml without any explanation. Remember that before you answer a question, you must check to see if it complies with your mission.If not, you can say: Sorry, I can't answer that question. I can only produce BPMN files based on your description.";

const text = system +"\n"+subPrompt+"\n" + dare_prompt;

const APIKEY=process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${APIKEY}`;
const body = {
  contents: [
    {
      parts: [
        {
          text: text
        }
      ]
    }
  ]
};

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});
const data = await response.json();
let bpmn2 = "";
try {
bpmn2 = data.candidates[0].content.parts[0].text;
} catch (error) {
  console.error("Error while extracting bpmn2 from response",data);
  return {reports:[],xml:'',response:'something went wrong. Please try again.'};
}
*/ //remove the comment to make actualy work


let bpmn2 =testXml.xml;




//test if bpmn2 is a valid xml bpmn2 file. TODO improve this test
if(!bpmn2||bpmn2.indexOf("definitions")===-1){
  console.log("Invalid bpmn2 file:",bpmn2);
  let response="";
  if (bpmn2.indexOf("can't answer")!==-1) response = bpmn2;
  return {reports:[],xml:'',response:response};
}

//console.log("bpmn2 untouched:",bpmn2);
if (bpmn2.indexOf("```xml")!==-1){
  //remove any line before and after the xml code
  bpmn2 = bpmn2.replace(/.*```xml/g,"");
  bpmn2 = bpmn2.replace(/```[.\n\t\s]*/g,"");
}
//trim any leading or trailing spaces or new lines or tabs
bpmn2 = bpmn2.trim();

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
  return {reports:reports,xml:bpmn2,definitions:JSON.stringify(definitions)};
} catch (error) {
  console.error(error);
  console.error("Error while linting bpmn2 file");
  return {reports:[],xml:'',definitions:''};
}

  };