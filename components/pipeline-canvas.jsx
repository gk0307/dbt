"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Database,
  FolderOpen,
  CheckCircle,
  XCircle,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Filter,
  Edit3,
  Link,
  Layers,
  FlaskConical,
  BarChart3,
  Scissors,
  ArrowUpNarrowWide,
  Download,
  Settings,
  Upload,
  Trash2,
} from "lucide-react";

export function PipelineCanvas({
  nodes,
  draggedComponent,
  connectionMode,
  selectedNode,
  isJobRunning = false,
  onDrop,
  onDeleteNode,
  onUpdateNodePosition,
  onAddConnection,
  onRemoveConnection,
  onSetConnectionMode,
  onDragEnd,
  onSelectNode,
  onDragStart,
  onUpdateNodeProperties,
}) {
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openPopover, setOpenPopover] = useState(null);
  const [editingProperties, setEditingProperties] = useState({});
  const canvasRef = useRef(null);

  const componentCategories = {
    input: [{ name: "Data Source", icon: Database, component: "Source" }],
    transform: [
      { name: "Join", icon: Link, component: "Join" },
      { name: "Union", icon: Layers, component: "Union" },
      { name: "Formula", icon: FlaskConical, component: "Formula" },
      { name: "Aggregate", icon: BarChart3, component: "Aggregate" },
      { name: "Limit", icon: Scissors, component: "Limit" },
      { name: "Order", icon: ArrowUpNarrowWide, component: "Order" },
      { name: "Filter", icon: Filter, component: "Filter" },
      { name: "Rename", icon: Edit3, component: "Rename" },
    ],
    output: [
      {
        name: "Target",
        icon: FolderOpen,
        component: "Target",
      },
    ],
  };

  const handleDragStart = (e, component) => {
    console.log("[v0] handleDragStart called with component:", component);
    console.log("[v0] onDragStart prop type:", typeof onDragStart);

    e.dataTransfer.setData("text/plain", component);

    if (typeof onDragStart === "function") {
      onDragStart(component);
    } else {
      console.error("[v0] onDragStart is not a function:", onDragStart);
    }

    setOpenPopover(null);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedComponent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: (e.clientX - rect.left - 32) / (zoom / 100),
      y: (e.clientY - rect.top - 32) / (zoom / 100),
    };

    onDrop(draggedComponent, position);
    onDragEnd();
  };

  const handleNodeMouseDown = (e, nodeId) => {
    if (e.button !== 0) return;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x * (zoom / 100),
      y: e.clientY - node.position.y * (zoom / 100),
    });

    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;

    const newPosition = {
      x: (e.clientX - dragOffset.x) / (zoom / 100),
      y: (e.clientY - dragOffset.y) / (zoom / 100),
    };

    onUpdateNodePosition(draggedNode, newPosition);
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handlePropertyUpdate = (field, value) => {
    setEditingProperties((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProperties = () => {
    if (selectedNode && onUpdateNodeProperties) {
      onUpdateNodeProperties(selectedNode, editingProperties);
    }
  };

  const initializeEditingProperties = (node) => {
    setEditingProperties(node.properties || {});
  };

  const isValidConnection = (fromId, toId) => {
    const fromNode = nodes.find((n) => n.id === fromId);
    const toNode = nodes.find((n) => n.id === toId);

    if (!fromNode || !toNode) return false;

    // Prevent self-connection
    if (fromId === toId) return false;

    // Prevent duplicate connections
    if (fromNode.connections.includes(toId)) return false;

    // Output nodes cannot connect to anything
    if (fromNode.component === "Target") return false;

    // Input nodes (Sources) can only connect to transforms or outputs
    if (fromNode.component === "Source" && toNode.component === "Source")
      return false;

    // Check for circular connections (recursive check)
    const hasCircularPath = (nodeId, targetId, visited = new Set()) => {
      if (visited.has(nodeId)) return true;
      if (nodeId === targetId) return true;

      visited.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return false;

      return node.connections.some((connId) =>
        hasCircularPath(connId, targetId, new Set(visited))
      );
    };

    return !hasCircularPath(toId, fromId);
  };

  const handleNodeClick = (nodeId, e) => {
    e.stopPropagation();

    if (connectionMode.from === null) {
      onSelectNode(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        initializeEditingProperties(node);
      }
    } else if (connectionMode.from === nodeId) {
      onSetConnectionMode({ from: null, to: null });
    } else {
      if (isValidConnection(connectionMode.from, nodeId)) {
        onAddConnection(connectionMode.from, nodeId);
        onSetConnectionMode({ from: null, to: null });
      } else {
        console.log("[v0] Connection blocked: Invalid connection attempt");
        onSetConnectionMode({ from: null, to: null });
      }
    }
  };

  const startConnectionMode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.component === "Target") {
      console.log(
        "[v0] Connection blocked: Output nodes cannot initiate connections"
      );
      return;
    }
    onSetConnectionMode({ from: nodeId, to: null });
    onSelectNode(null);
  };

  const removeConnection = (fromId, toId, e) => {
    e.stopPropagation();
    onRemoveConnection(fromId, toId);
    onSetConnectionMode({ from: null, to: null });
  };

  const getNodeColor = (type, component) => {
    return "bg-gray-50 border-gray-300";
  };

  const getNodeIcon = (component) => {
    switch (component) {
      case "Source":
        return Database;
      case "Filter":
        return Filter;
      case "Aggregate":
        return BarChart3;
      case "Sort":
        return ArrowUpNarrowWide;
      case "Join":
        return Link;
      case "Union":
        return Layers;
      case "Formula":
        return FlaskConical;
      case "Limit":
        return Scissors;
      case "Order":
        return ArrowUpNarrowWide;
      case "Rename":
        return Edit3;
      case "Target":
        return FolderOpen;
      default:
        return Database;
    }
  };

  const getNodeIconColor = (type, component) => {
    switch (component) {
      case "Source":
        return "text-teal-600";
      case "Filter":
        return "text-blue-600";
      case "Aggregate":
        return "text-purple-600";
      case "Sort":
        return "text-yellow-600";
      case "Join":
        return "text-indigo-600";
      case "Union":
        return "text-cyan-600";
      case "Formula":
        return "text-green-600";
      case "Limit":
        return "text-orange-600";
      case "Order":
        return "text-yellow-600";
      case "Rename":
        return "text-pink-600";
      case "Target":
        return "text-red-600";
      default:
        return "text-gray-700";
    }
  };

  const getStatusIcon = (status, progress) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "running":
        return <Clock className="h-3 w-3 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const renderPropertyForm = (node) => {
    const component = node.component;

    if (component === "Source") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs font-medium text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              value={editingProperties.name || node.name}
              onChange={(e) => handlePropertyUpdate("name", e.target.value)}
              className="mt-1"
              placeholder="Source name"
            />
          </div>
          <div>
            <Label
              htmlFor="database"
              className="text-xs font-medium text-gray-700"
            >
              Database
            </Label>
            <Input
              id="database"
              value={editingProperties.database || ""}
              onChange={(e) => handlePropertyUpdate("database", e.target.value)}
              className="mt-1"
              placeholder="Database connection"
            />
          </div>
          <div>
            <Label
              htmlFor="dbName"
              className="text-xs font-medium text-gray-700"
            >
              DB Name
            </Label>
            <Input
              id="dbName"
              value={editingProperties.dbName || ""}
              onChange={(e) => handlePropertyUpdate("dbName", e.target.value)}
              className="mt-1"
              placeholder="Database name"
            />
          </div>
          <div>
            <Label
              htmlFor="schema"
              className="text-xs font-medium text-gray-700"
            >
              Schema
            </Label>
            <Input
              id="schema"
              value={editingProperties.schema || ""}
              onChange={(e) => handlePropertyUpdate("schema", e.target.value)}
              className="mt-1"
              placeholder="Schema name"
            />
          </div>
          <div>
            <Label
              htmlFor="targetTable"
              className="text-xs font-medium text-gray-700"
            >
              Target Table
            </Label>
            <Input
              id="targetTable"
              value={editingProperties.targetTable || ""}
              onChange={(e) =>
                handlePropertyUpdate("targetTable", e.target.value)
              }
              className="mt-1"
              placeholder="Table name"
            />
          </div>
          <div>
            <Label
              htmlFor="columnNames"
              className="text-xs font-medium text-gray-700"
            >
              Column Names
            </Label>
            <Input
              id="columnNames"
              value={editingProperties.columnNames || ""}
              onChange={(e) =>
                handlePropertyUpdate("columnNames", e.target.value)
              }
              className="mt-1"
              placeholder="col1, col2, col3"
            />
          </div>
          <div>
            <Label
              htmlFor="offset"
              className="text-xs font-medium text-gray-700"
            >
              Offset
            </Label>
            <Input
              id="offset"
              type="number"
              value={editingProperties.offset || ""}
              onChange={(e) => handlePropertyUpdate("offset", e.target.value)}
              className="mt-1"
              placeholder="0"
            />
          </div>
          <div>
            <Label
              htmlFor="filters"
              className="text-xs font-medium text-gray-700"
            >
              Filters/Where Clause
            </Label>
            <Textarea
              id="filters"
              value={editingProperties.filters || ""}
              onChange={(e) => handlePropertyUpdate("filters", e.target.value)}
              className="mt-1"
              placeholder="WHERE condition"
              rows={2}
            />
          </div>
        </div>
      );
    }

    // Default form for other transform components
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-xs font-medium text-gray-700">
            Name
          </Label>
          <Input
            id="name"
            value={editingProperties.name || node.name}
            onChange={(e) => handlePropertyUpdate("name", e.target.value)}
            className="mt-1"
            placeholder="Component name"
          />
        </div>
        <div>
          <Label
            htmlFor="inputTable"
            className="text-xs font-medium text-gray-700"
          >
            Input Table
          </Label>
          <Input
            id="inputTable"
            value={editingProperties.inputTable || ""}
            onChange={(e) => handlePropertyUpdate("inputTable", e.target.value)}
            className="mt-1"
            placeholder="Input table"
          />
        </div>
      </div>
    );
  };

  const getColumnCount = (node) => {
    if (!node.properties) return 0;

    if (node.properties.columnNames) {
      return node.properties.columnNames.split(",").filter((col) => col.trim())
        .length;
    }

    if (node.properties.outputColumns) {
      return node.properties.outputColumns
        .split(",")
        .filter((col) => col.trim()).length;
    }

    return 0;
  };

  return (
    <div
      className={`flex-1 bg-gray-50 relative overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {Object.entries(componentCategories).map(
            ([category, components], index) => {
              const getCategoryIcon = (category) => {
                switch (category.toLowerCase()) {
                  case "input":
                    return <Download className="h-4 w-4 ml-2" />;
                  case "transform":
                    return <Settings className="h-4 w-4 ml-2" />;
                  case "output":
                    return <Upload className="h-4 w-4 ml-2" />;
                  default:
                    return <Settings className="h-4 w-4 ml-2" />;
                }
              };

              return (
                <Popover
                  key={category}
                  open={openPopover === category}
                  onOpenChange={(open) =>
                    setOpenPopover(open ? category : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`
                      h-12 px-8 text-sm font-medium capitalize rounded-none border-0 transition-all duration-200
                      ${
                        openPopover === category
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-inner"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
                      }
                      ${
                        index < Object.keys(componentCategories).length - 1
                          ? "border-r border-gray-200"
                          : ""
                      }
                    `}
                    >
                      {category}
                      {getCategoryIcon(category)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`p-3 border-0 shadow-2xl bg-white rounded-xl ${
                      category === "transform" ? "w-[400px]" : "w-[130px]"
                    }`}
                    align={
                      category === "input"
                        ? "start"
                        : category === "output"
                        ? "end"
                        : "center"
                    }
                    sideOffset={4}
                  >
                    <div
                      className={`grid gap-3 ${
                        category === "transform" ? "grid-cols-4" : "grid-cols-1"
                      }`}
                    >
                      {components.map((comp) => (
                        <div
                          key={comp.component}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, comp.component)
                          }
                          className="flex flex-col items-center justify-center p-1 gap-2 rounded-lg 
                    hover:bg-gray-100 cursor-grab active:cursor-grabbing 
                   transition-all duration-200  border-gray-200 hover:border-blue-300"
                        >
                          {/* Icon wrapper */}
                          {/* <div className="p-2 border-2 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"> */}
                          <div
                            className="p-3 rounded-lg border border-gray-200 bg-[#87CEFA] shadow-sm 
                        group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors"
                          >
                            <comp.icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          </div>
                          {/* </div> */}

                          {/* Name */}
                          <span className="text-sm font-medium text-gray-800 group-hover:text-blue-800">
                            {comp.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        {/* <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 bg-white"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button> */}
      </div>

      <div
        ref={canvasRef}
        className="relative w-full h-full p-8"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top left",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          onSelectNode(null);
          onSetConnectionMode({ from: null, to: null });
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 1,
            minWidth: "100%",
            minHeight: "100%",
            left: "0",
            top: "0",
          }}
        >
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId);
              if (!target) return null;

              const nodeWidth = 240;
              const nodeHeight = 80;
              const startX = node.position.x + nodeWidth + 6;
              const startY = node.position.y + nodeHeight / 2;
              const endX = target.position.x - 6;
              const endY = target.position.y + nodeHeight / 2;

              const midX = startX + (endX - startX) / 2;

              return (
                <g key={`${node.id}-${targetId}`}>
                  <path
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    stroke="#000000"
                    strokeWidth="1"
                    fill="none"
                    className="hover:stroke-red-500 cursor-pointer transition-colors duration-200"
                    style={{ pointerEvents: "stroke", strokeLinecap: "round" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(node.id, targetId, e);
                    }}
                  />
                  <circle
                    cx={endX}
                    cy={endY}
                    r="1"
                    fill="#3b82f6"
                    className="hover:fill-red-500"
                  />
                  <circle cx={startX} cy={startY} r="1" fill="#3b82f6" />
                  <path
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    stroke="transparent"
                    strokeWidth="12"
                    fill="none"
                    style={{ pointerEvents: "stroke", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(node.id, targetId, e);
                    }}
                  />
                </g>
              );
            })
          )}
        </svg>

        {nodes.map((node) => {
          const NodeIcon = getNodeIcon(node.component);
          const nodeWidth = 240;
          const nodeHeight = 80;
          const columnCount = getColumnCount(node);

          return (
            <div
              key={node.id}
              className={`absolute cursor-pointer transition-all duration-200 group ${
                selectedNode === node.id
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : ""
              } ${
                connectionMode.from === node.id
                  ? "ring-2 ring-orange-500 ring-offset-2"
                  : ""
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: nodeWidth,
                height: nodeHeight,
                zIndex: 2,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={(e) => handleNodeClick(node.id, e)}
            >
              <div
                className={`w-full h-full rounded-lg border-2 ${getNodeColor(
                  node.type,
                  node.component
                )} bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200 relative`}
              >
                <div
                  className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors shadow-sm"
                  style={{
                    left: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      connectionMode.from &&
                      connectionMode.from !== node.id
                    ) {
                      handleNodeClick(node.id, e);
                    }
                  }}
                />

                {node.component !== "Target" && (
                  <div
                    className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors shadow-sm"
                    style={{
                      right: -6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnectionMode(node.id);
                    }}
                  />
                )}

                <div className="p-4 h-full flex items-center">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`flex-shrink-0 ${getNodeIconColor(
                        node.type,
                        node.component
                      )}`}
                    >
                      <NodeIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {node.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>{node.component}</span>
                        {columnCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {columnCount} cols
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(node.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200 bg-white border border-gray-200 rounded-full shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNode(node.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isJobRunning && (
        <div className="absolute top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          Job Running...
        </div>
      )}
    </div>
  );
}
