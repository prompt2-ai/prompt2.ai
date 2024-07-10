'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('workflows', [
      {
        name: 'Order Processing',
        description: 'Depicts the process of receiving, evaluating, fulfilling, and closing customer orders',
        user_id: '4ca66b66-758d-4b7e-8050-42494dd9407c',
        workflow: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="[invalid URL removed]" xmlns:bpmndi="[invalid URL removed]" xmlns:di="[invalid URL removed]" xmlns:dc="[invalid URL removed]" xmlns:xsi="[invalid URL removed]" id="Definitions_1" targetNamespace="[invalid URL removed]" exporter="Camunda Modeler" exporterVersion="4.12.0">
<bpmn:process id="order-processing" name="Order Processing" isExecutable="true">
<bpmn:startEvent id="StartEvent_1" name="Receive Order">
<bpmn:outgoing>Flow_0i5o7fl</bpmn:outgoing>
</bpmn:startEvent>
<bpmn:exclusiveGateway id="Gateway_1x0jltk" name="Accepted or Rejected?">
<bpmn:incoming>Flow_0i5o7fl</bpmn:incoming>
<bpmn:outgoing>Flow_0v6ov8s</bpmn:outgoing>
<bpmn:outgoing>Flow_0f7bwp6</bpmn:outgoing>
</bpmn:exclusiveGateway>
<bpmn:task id="Activity_0l564n8" name="Close Order">
<bpmn:incoming>Flow_0f7bwp6</bpmn:incoming>
<bpmn:outgoing>Flow_1h2w9l5</bpmn:outgoing>
</bpmn:task>
<bpmn:endEvent id="Event_096q984" name="Order Closed">
<bpmn:incoming>Flow_1h2w9l5</bpmn:incoming>
<bpmn:incoming>Flow_056964r</bpmn:incoming>
</bpmn:endEvent>
<bpmn:task id="Activity_1n7i72x" name="Fill Order">
<bpmn:incoming>Flow_0v6ov8s</bpmn:incoming>
<bpmn:outgoing>Flow_1h2dln9</bpmn:outgoing>
</bpmn:task>
<bpmn:parallelGateway id="Gateway_1r47v9w">
<bpmn:incoming>Flow_1h2dln9</bpmn:incoming>
<bpmn:outgoing>Flow_105841j</bpmn:outgoing>
<bpmn:outgoing>Flow_1r45p36</bpmn:outgoing>
</bpmn:parallelGateway>
<bpmn:sequenceFlow id="Flow_0i5o7fl" sourceRef="StartEvent_1" targetRef="Gateway_1x0jltk" />
<bpmn:sequenceFlow id="Flow_0v6ov8s" name="Accepted" sourceRef="Gateway_1x0jltk" targetRef="Activity_1n7i72x" />
<bpmn:sequenceFlow id="Flow_0f7bwp6" name="Rejected" sourceRef="Gateway_1x0jltk" targetRef="Activity_0l564n8" />
<bpmn:sequenceFlow id="Flow_1h2w9l5" sourceRef="Activity_0l564n8" targetRef="Event_096q984" />
<bpmn:sequenceFlow id="Flow_1h2dln9" sourceRef="Activity_1n7i72x" targetRef="Gateway_1r47v9w" />
<bpmn:sequenceFlow id="Flow_105841j" sourceRef="Gateway_1r47v9w" targetRef="Activity_102x5m6" />
<bpmn:sequenceFlow id="Flow_1r45p36" sourceRef="Gateway_1r47v9w" targetRef="Activity_1a327n8" />
<bpmn:task id="Activity_102x5m6" name="Send Invoice">
<bpmn:incoming>Flow_105841j</bpmn:incoming>
<bpmn:outgoing>Flow_0611xfi</bpmn:outgoing>
</bpmn:task>
<bpmn:task id="Activity_1a327n8" name="Ship Order">
<bpmn:incoming>Flow_1r45p36</bpmn:incoming>
<bpmn:outgoing>Flow_1o5f55t</bpmn:outgoing>
</bpmn:task>
<bpmn:parallelGateway id="Gateway_193u0it">
<bpmn:incoming>Flow_0611xfi</bpmn:incoming>
<bpmn:incoming>Flow_1o5f55t</bpmn:incoming>
<bpmn:outgoing>Flow_056964r</bpmn:outgoing>
</bpmn:parallelGateway>
<bpmn:sequenceFlow id="Flow_0611xfi" sourceRef="Activity_102x5m6" targetRef="Gateway_193u0it" />
<bpmn:sequenceFlow id="Flow_1o5f55t" sourceRef="Activity_1a327n8" targetRef="Gateway_193u0it" />
<bpmn:sequenceFlow id="Flow_056964r" sourceRef="Gateway_193u0it" targetRef="Event_096q984" />
<bpmn:task id="Activity_04c6482" name="Make Payment">
<bpmn:incoming>Flow_1u4y807</bpmn:incoming>
<bpmn:outgoing>Flow_0h50afx</bpmn:outgoing>
</bpmn:task>
<bpmn:task id="Activity_16fvlkv" name="Accept Payment">
<bpmn:incoming>Flow_0h50afx</bpmn:incoming>
<bpmn:outgoing>Flow_1u4y807</bpmn:outgoing>
</bpmn:task>
<bpmn:sequenceFlow id="Flow_0h50afx" sourceRef="Activity_04c6482" targetRef="Activity_16fvlkv" />
<bpmn:sequenceFlow id="Flow_1u4y807" sourceRef="Activity_16fvlkv" targetRef="Activity_04c6482" />
</bpmn:process>
<bpmndi:BPMNDiagram id="BPMNDiagram_1">
<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="order-processing">
<bpmndi:BPMNEdge id="Flow_1u4y807_di" bpmnElement="Flow_1u4y807">
<di:waypoint x="550" y="270" />
<di:waypoint x="550" y="340" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_0h50afx_di" bpmnElement="Flow_0h50afx">
<di:waypoint x="550" y="410" />
<di:waypoint x="550" y="340" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_056964r_di" bpmnElement="Flow_056964r">
<di:waypoint x="915" y="310" />
<di:waypoint x="992" y="310" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_1o5f55t_di" bpmnElement="Flow_1o5f55t">
<di:waypoint x="840" y="410" />
<di:waypoint x="915" y="410" />
<di:waypoint x="915" y="335" />
<bpmndi:BPMNEdge id="Flow_0611xfi_di" bpmnElement="Flow_0611xfi">
<di:waypoint x="840" y="270" />
<di:waypoint x="915" y="270" />
<di:waypoint x="915" y="285" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_1r45p36_di" bpmnElement="Flow_1r45p36">
<di:waypoint x="705" y="335" />
<di:waypoint x="705" y="410" />
<di:waypoint x="740" y="410" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_105841j_di" bpmnElement="Flow_105841j">
<di:waypoint x="705" y="285" />
<di:waypoint x="705" y="270" />
<di:waypoint x="740" y="270" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_1h2dln9_di" bpmnElement="Flow_1h2dln9">
<di:waypoint x="610" y="310" />
<di:waypoint x="680" y="310" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_1h2w9l5_di" bpmnElement="Flow_1h2w9l5">
<di:waypoint x="370" y="190" />
<di:waypoint x="992" y="190" />
<di:waypoint x="992" y="285" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_0f7bwp6_di" bpmnElement="Flow_0f7bwp6">
<di:waypoint x="250" y="285" />
<di:waypoint x="250" y="190" />
<di:waypoint x="270" y="190" />
<bpmndi:BPMNLabel>
<dc:Bounds x="256" y="163" width="49" height="14" />
</bpmndi:BPMNLabel>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_0v6ov8s_di" bpmnElement="Flow_0v6ov8s">
<di:waypoint x="275" y="310" />
<di:waypoint x="510" y="310" />
<bpmndi:BPMNLabel>
<dc:Bounds x="373" y="292" width="44" height="14" />
</bpmndi:BPMNLabel>
</bpmndi:BPMNEdge>
<bpmndi:BPMNEdge id="Flow_0i5o7fl_di" bpmnElement="Flow_0i5o7fl">
<di:waypoint x="188" y="310" />
<di:waypoint x="225" y="310" />
</bpmndi:BPMNEdge>
<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
<dc:Bounds x="152" y="292" width="36" height="36" />
<bpmndi:BPMNLabel>
<dc:Bounds x="138" y="335" width="65" height="14" />
</bpmndi:BPMNLabel>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Gateway_1x0jltk_di" bpmnElement="Gateway_1x0jltk" isMarkerVisible="true">
<dc:Bounds x="225" y="285" width="50" height="50" />
<bpmndi:BPMNLabel>
<dc:Bounds x="211" y="342" width="78" height="14" />
</bpmndi:BPMNLabel>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Activity_0l564n8_di" bpmnElement="Activity_0l564n8">
<dc:Bounds x="270" y="150" width="100" height="80" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Event_096q984_di" bpmnElement="Event_096q984">
<dc:Bounds x="992" y="292" width="36" height="36" />
<bpmndi:BPMNLabel>
<dc:Bounds x="978" y="335" width="65" height="14" />
</bpmndi:BPMNLabel>
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Activity_1n7i72x_di" bpmnElement="Activity_1n7i72x">
<dc:Bounds x="510" y="270" width="100" height="80" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Gateway_1qdqmzt_di" bpmnElement="Gateway_1r47v9w">
<dc:Bounds x="680" y="285" width="50" height="50" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Activity_102x5m6_di" bpmnElement="Activity_102x5m6">
<dc:Bounds x="740" y="230" width="100" height="80" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Activity_1a327n8_di" bpmnElement="Activity_1a327n8">
<dc:Bounds x="740" y="370" width="100" height="80" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Gateway_193u0it_di" bpmnElement="Gateway_193u0it">
<dc:Bounds x="890" y="285" width="50" height="50" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Activity_04c6482_di" bpmnElement="Activity_04c6482">
<dc:Bounds x="500" y="370" width="100" height="80" />
</bpmndi:BPMNShape>
<bpmndi:BPMNShape id="Activity_16fvlkv_di" bpmnElement="Activity_16fvlkv">
<dc:Bounds x="500" y="230" width="100" height="80" />
</bpmndi:BPMNShape>
</bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
</bpmn:definitions>`,
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
        private: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});


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
