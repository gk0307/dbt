"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { PipelineCanvas } from "@/components/pipeline-canvas";
import { BottomPanel } from "@/components/bottom-panel";
import { useEffect, useState } from "react";

export default function Home() {
  const [pipelineNodes, setPipelineNodes] = useState([
    {
      id: "input-1",
      type: "input",
      name: "Customer DB",
      component: "Source",
      position: { x: 100, y: 100 },
      status: "completed",
      connections: ["transform-1"],
    },
    {
      id: "input-2",
      type: "input",
      name: "Orders API",
      component: "Source",
      position: { x: 100, y: 200 },
      status: "completed",
      connections: ["transform-1"],
    },

    {
      id: "transform-1",
      type: "transform",
      name: "Join Tables",
      component: "Join",
      position: { x: 450, y: 200 },
      status: "completed",
      connections: ["transform-2"],
    },
    {
      id: "input-3",
      type: "input",
      name: "Testing Data",
      component: "Source",
      position: { x: 100, y: 300 },
      status: "completed",
      connections: ["transform-1"],
    },
    {
      id: "transform-2",
      type: "transform",
      name: "Calculate Metrics",
      component: "Formula",
      position: { x: 800, y: 150 },
      status: "pending",
      connections: ["output-1"],
    },
    {
      id: "output-1",
      type: "output",
      name: "Data Warehouse",
      component: "Target",
      position: { x: 1100, y: 150 },
      status: "pending",
      connections: [],
    },
  ]);

  const [draggedComponent, setDraggedComponent] = useState(null);
  const [connectionMode, setConnectionMode] = useState({
    from: null,
    to: null,
  });

  const [isJobRunning, setIsJobRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [jobLogs, setJobLogs] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    // document.getElementsByTagName("nextjs-portal")&&
    document.getElementsByTagName("nextjs-portal")[0].style.display = "none";
  }, []);

  const addNode = (component, position) => {
    const nodeId = `node-${Date.now()}`;
    const type = getComponentType(component);

    const newNode = {
      id: nodeId,
      type,
      name: component,
      component,
      position,
      status: "pending",
      connections: [],
    };

    setPipelineNodes((prev) => [...prev, newNode]);
  };

  const deleteNode = (nodeId) => {
    setPipelineNodes((prev) => {
      return prev
        .filter((node) => node.id !== nodeId)
        .map((node) => ({
          ...node,
          connections: node.connections.filter((conn) => conn !== nodeId),
        }));
    });
  };

  const updateNodePosition = (nodeId, position) => {
    setPipelineNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, position } : node))
    );
  };

  const addConnection = (fromId, toId) => {
    setPipelineNodes((prev) =>
      prev.map((node) =>
        node.id === fromId
          ? { ...node, connections: [...node.connections, toId] }
          : node
      )
    );
  };

  const removeConnection = (fromId, toId) => {
    setPipelineNodes((prev) =>
      prev.map((node) =>
        node.id === fromId
          ? {
              ...node,
              connections: node.connections.filter((conn) => conn !== toId),
            }
          : node
      )
    );
  };

  const getComponentType = (component) => {
    const inputComponents = ["Source"];
    const transformComponents = [
      "Join",
      "Union",
      "Formula",
      "Aggregate",
      "Limit",
      "Order",
      "Filter",
      "Rename",
    ];
    const outputComponents = ["Target"];

    if (inputComponents.includes(component)) return "input";
    if (transformComponents.includes(component)) return "transform";
    if (outputComponents.includes(component)) return "output";
    return "transform";
  };

  const runJob = async () => {
    setIsJobRunning(true);
    setJobLogs(["Starting job execution..."]);
    setValidationErrors([]);

    console.log("====================================");
    console.log("Running job with nodes:", pipelineNodes);
    console.log("====================================");

    // ✅ Step 1: Group nodes by type
    const inputs = pipelineNodes.filter((n) => n.type === "input");
    const transforms = pipelineNodes.filter((n) => n.type === "transform");
    const outputs = pipelineNodes.filter((n) => n.type === "output");

    // ✅ Step 2: Define execution order
    const executionOrder = [...inputs, ...transforms, ...outputs];

    // ✅ Step 3: Run nodes sequentially
    for (let i = 0; i < executionOrder.length; i++) {
      const node = executionOrder[i];

      // Mark as running
      setPipelineNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: "running" } : n))
      );
      setJobLogs((prev) => [...prev, `Executing ${node.name}...`]);

      // Simulate async execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark as completed
      setPipelineNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: "completed" } : n))
      );
      setJobLogs((prev) => [...prev, `${node.name} completed successfully`]);
    }

    setJobLogs((prev) => [...prev, "Job execution completed!"]);
    setIsJobRunning(false);
  };

  const validatePipeline = () => {
    const errors = [];

    const connectedNodes = new Set();
    pipelineNodes.forEach((node) => {
      node.connections.forEach((conn) => connectedNodes.add(conn));
    });

    pipelineNodes.forEach((node) => {
      if (
        node.connections.length === 0 &&
        !connectedNodes.has(node.id) &&
        node.type !== "output"
      ) {
        errors.push(`Node "${node.name}" is not connected to any other nodes`);
      }
    });

    const inputNodes = pipelineNodes.filter((n) => n.type === "input");
    inputNodes.forEach((node) => {
      if (node.connections.length === 0) {
        errors.push(`Input node "${node.name}" has no output connections`);
      }
    });

    const outputNodes = pipelineNodes.filter((n) => n.type === "output");
    outputNodes.forEach((node) => {
      const hasInput = pipelineNodes.some((n) =>
        n.connections.includes(node.id)
      );
      if (!hasInput) {
        errors.push(`Output node "${node.name}" has no input connections`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const updateNodeProperties = (nodeId, properties) => {
    setPipelineNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, ...properties } : node
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onDragStart={setDraggedComponent}
        draggedComponent={draggedComponent}
      />
      <div className="flex-1 flex flex-col">
        <TopBar
          onRunJob={runJob}
          onValidate={validatePipeline}
          isJobRunning={isJobRunning}
          validationErrors={validationErrors}
          onDragStart={setDraggedComponent}
          draggedComponent={draggedComponent}
        />
        <div className="flex-1 flex flex-col">
          <PipelineCanvas
            nodes={pipelineNodes}
            draggedComponent={draggedComponent}
            connectionMode={connectionMode}
            selectedNode={selectedNode}
            onDrop={addNode}
            onDeleteNode={deleteNode}
            onUpdateNodePosition={updateNodePosition}
            onAddConnection={addConnection}
            onRemoveConnection={removeConnection}
            onSetConnectionMode={setConnectionMode}
            onDragEnd={() => setDraggedComponent(null)}
            onSelectNode={setSelectedNode}
            onDragStart={setDraggedComponent}
          />
          <BottomPanel
            selectedNode={
              selectedNode
                ? pipelineNodes.find((n) => n.id === selectedNode)
                : null
            }
            onUpdateNodeProperties={updateNodeProperties}
            jobLogs={jobLogs}
            validationErrors={validationErrors}
          />
        </div>
      </div>
    </div>
  );
}
