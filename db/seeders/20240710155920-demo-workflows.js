'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    //get the user id from the users table where email is 'panagiotis@skarvelis.gr'
    const user = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'panagiotis@skarvelis.gr'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );


    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const id = uuidv4();
    await queryInterface.bulkInsert('workflows', [
      {
        id: id,//UUID
        name: 'Order Processing - ' + id,
        description: 'Depicts the process of receiving, evaluating, fulfilling, and closing customer orders',
        user_id: user[0].id,
        workflow: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" name="Employee Leave Example Process" isExecutable="true">
    <bpmn2:extensionElements>
      </bpmn2:extensionElements>
    <bpmn2:startEvent id="Event_0cvwr8a" name="Start Leave Process">
      <bpmn2:outgoing>Flow_04cue2l</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="Flow_04cue2l" sourceRef="Event_0cvwr8a" targetRef="Activity_01qnzb7" />
    <bpmn2:userTask id="Activity_01qnzb7" name="Submit Application">
      <bpmn2:extensionElements>
        </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_04cue2l</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1w9obph</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="Gateway_1vux1tc" name="Is Application Approved">
      <bpmn2:incoming>Flow_1w9obph</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1ltjq8e</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0kuen7a</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="Flow_1w9obph" sourceRef="Activity_01qnzb7" targetRef="Gateway_1vux1tc" />
    <bpmn2:sequenceFlow id="Flow_1ltjq8e" sourceRef="Gateway_1vux1tc" targetRef="Activity_13j5o8i" />
    <bpmn2:userTask id="Activity_13j5o8i" name="Approval Granted">
      <bpmn2:incoming>Flow_1ltjq8e</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0r0xnhe</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0r0xnhe" sourceRef="Activity_13j5o8i" targetRef="Activity_04xfwa0" />
    <bpmn2:userTask id="Activity_04xfwa0" name="Employee Cancel Leave">
      <bpmn2:incoming>Flow_0r0xnhe</bpmn2:incoming>
      <bpmn2:outgoing>Flow_01n06d5</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0kuen7a" sourceRef="Gateway_1vux1tc" targetRef="Activity_0jtkkd4" />
    <bpmn2:userTask id="Activity_0jtkkd4" name="Approval Denied" flowable:formKey="FormIdentifier111">
      <bpmn2:extensionElements>
        </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0kuen7a</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1131euh</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_1131euh" sourceRef="Activity_0jtkkd4" targetRef="Activity_1ys9p77" />
    <bpmn2:sendTask id="Activity_1ys9p77" name="Send Email Notification">
      <bpmn2:incoming>Flow_1131euh</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0gikf7m</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sequenceFlow id="Flow_0gikf7m" sourceRef="Activity_1ys9p77" targetRef="Gateway_1af8bvn" />
    <bpmn2:parallelGateway id="Gateway_1af8bvn">
      <bpmn2:incoming>Flow_0gikf7m</bpmn2:incoming>
      <bpmn2:incoming>Flow_01n06d5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0d8zq2t</bpmn2:outgoing>
    </bpmn2:parallelGateway>
    <bpmn2:sequenceFlow id="Flow_01n06d5" sourceRef="Activity_04xfwa0" targetRef="Gateway_1af8bvn" />
    <bpmn2:endEvent id="Event_0ki06s5" name="Leave Process Ended">
      <bpmn2:incoming>Flow_0d8zq2t</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_0d8zq2t" sourceRef="Gateway_1af8bvn" targetRef="Event_0ki06s5" />
  </bpmn2:process>
      <bpmn2:message id="qwe" name="111qwr11" />
      <bpmn2:message id="qwerer" name="111" />
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNEdge id="Flow_04cue2l_di" bpmnElement="Flow_04cue2l">
            <di:waypoint x="278" y="240" />
            <di:waypoint x="330" y="240" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_1w9obph_di" bpmnElement="Flow_1w9obph">
            <di:waypoint x="430" y="240" />
            <di:waypoint x="485" y="240" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_1ltjq8e_di" bpmnElement="Flow_1ltjq8e">
            <di:waypoint x="535" y="240" />
            <di:waypoint x="590" y="240" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_0r0xnhe_di" bpmnElement="Flow_0r0xnhe">
            <di:waypoint x="690" y="240" />
            <di:waypoint x="750" y="240" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_0kuen7a_di" bpmnElement="Flow_0kuen7a">
            <di:waypoint x="510" y="265" />
            <di:waypoint x="510" y="350" />
            <di:waypoint x="590" y="350" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_1131euh_di" bpmnElement="Flow_1131euh">
            <di:waypoint x="690" y="350" />
            <di:waypoint x="750" y="350" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_0gikf7m_di" bpmnElement="Flow_0gikf7m">
            <di:waypoint x="850" y="350" />
            <di:waypoint x="915" y="350" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_01n06d5_di" bpmnElement="Flow_01n06d5">
            <di:waypoint x="850" y="240" />
            <di:waypoint x="940" y="240" />
            <di:waypoint x="940" y="325" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_0d8zq2t_di" bpmnElement="Flow_0d8zq2t">
            <di:waypoint x="965" y="350" />
            <di:waypoint x="1032" y="350" />
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNShape id="Event_0cvwr8a_di" bpmnElement="Event_0cvwr8a">
            <dc:Bounds x="242" y="222" width="36" height="36" />
            <bpmndi:BPMNLabel>
              <dc:Bounds x="227" y="265" width="66" height="14" />
            </bpmndi:BPMNLabel>
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="Activity_1r8zo9h_di" bpmnElement="Activity_01qnzb7">
            <dc:Bounds x="330" y="200" width="100" height="80" />
            <bpmndi:BPMNLabel />
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="Gateway_1vux1tc_di" bpmnElement="Gateway_1vux1tc" isMarkerVisible="true">
            <dc:Bounds x="485" y="215" width="50" height="50" />
            <bpmndi:BPMNLabel>
              <dc:Bounds x="476" y="191" width="67" height="14" />
            </bpmndi:BPMNLabel>
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="Activity_0vtiook_di" bpmnElement="Activity_13j5o8i">
            <dc:Bounds x="590" y="200" width="100" height="80" />
            <bpmndi:BPMNLabel />
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="Activity_10xjie0_di" bpmnElement="Activity_04xfwa0">
            <dc:Bounds x="750" y="200" width="100" height="80" />
            <bpmndi:BPMNLabel />
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="Activity_02c212d_di" bpmnElement="Activity_0jtkkd4">
            <dc:Bounds x="590" y="310" width="100" height="80" />
          <bpmndi:BPMNLabel />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Activity_0vnpdxa_di" bpmnElement="Activity_1ys9p77">
          <dc:Bounds x="750" y="310" width="100" height="80" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Gateway_03vzkq1_di" bpmnElement="Gateway_1af8bvn">
          <dc:Bounds x="915" y="325" width="50" height="50" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="Event_0ki06s5_di" bpmnElement="Event_0ki06s5">
          <dc:Bounds x="1032" y="332" width="36" height="36" />
          <bpmndi:BPMNLabel>
            <dc:Bounds x="1017" y="375" width="66" height="14" />
          </bpmndi:BPMNLabel>
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn2:definitions>`,
        image: null,
        prompt: `Workflow Name: Order Processing

Objective: Design a BPMN workflow that depicts the process of receiving, evaluating, fulfilling, and closing customer orders.

Steps:

Start Event: "Receive Order"
Exclusive Gateway: "Accepted or Rejected?"
Rejected Path:
Task: "Close Order"
End Event: Order Closed
Accepted Path:
Task: "Fill Order"
Parallel Gateway: Split Flow
Path 1:
Task: "Send Invoice"
Task: "Make Payment"
Task: "Accept Payment"
Path 2:
Task: "Ship Order"
Parallel Gateway: Synchronize Flow
Task: "Close Order"
End Event: Order Closed
Additional Instructions:

Focus on the "happy path" scenario (order accepted and fulfilled).
Ensure the Parallel Gateway usage reflects concurrent invoice/shipment.
Label the Exclusive Gateway paths ("Accepted" and "Rejected").
Optional:

If desired, include error handling and exception flows.
Consider alternative scenarios (partial order fulfillment, returns, etc.).
Add data objects, pools, or lanes for clarity if needed.`,
        active: true,
        exclusive: false,
        tokens_input: 5,
        tokens_output: 10,
        likes: 0,
        dislikes: 0,
        downloads: 0,
        views: 0,
        remix_workflows: null,
        remix_from: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {
     
    });


  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('workflows', null, {});
  }
};
