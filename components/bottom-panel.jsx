"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings,
  FileText,
  HelpCircle,
  Terminal,
  Search,
  Command,
  List,
  Database,
  GitBranch,
  FileCode,
  Bell,
  Activity,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

export function BottomPanel({ selectedNode, onUpdateNodeProperties, jobLogs, validationErrors }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [nodeProperties, setNodeProperties] = useState({
    name: "",
    description: "",
    timeout: "300",
    retries: "3",
    connectionString: "",
    query: "",
    operation: "",
    targetTable: "",
    batchSize: "1000",
    parallelism: "4",
    encoding: "UTF-8",
    delimiter: ",",
    headers: true,
    columnFilter: "",
  })

  useEffect(() => {
    if (selectedNode) {
      setNodeProperties({
        name: selectedNode.name || "",
        description: selectedNode.properties?.description || "",
        timeout: selectedNode.properties?.timeout || "300",
        retries: selectedNode.properties?.retries || "3",
        connectionString: selectedNode.properties?.connectionString || "",
        query: selectedNode.properties?.query || "",
        operation: selectedNode.properties?.operation || "",
        targetTable: selectedNode.properties?.targetTable || "",
        batchSize: selectedNode.properties?.batchSize || "1000",
        parallelism: selectedNode.properties?.parallelism || "4",
        encoding: selectedNode.properties?.encoding || "UTF-8",
        delimiter: selectedNode.properties?.delimiter || ",",
        headers: selectedNode.properties?.headers !== false,
        columnFilter: selectedNode.properties?.columnFilter || "",
      })
    }
  }, [selectedNode])

  const handlePropertyChange = (key, value) => {
    const newProperties = { ...nodeProperties, [key]: value }
    setNodeProperties(newProperties)
    if (selectedNode) {
      onUpdateNodeProperties(selectedNode.id, newProperties)
    }
  }

  const getPropertiesForTable = () => {
    if (!selectedNode) return []

    const component = selectedNode.component
    const baseProperties = [
      { name: "Name", value: nodeProperties.name, required: true, type: "text" },
      { name: "Description", value: nodeProperties.description, required: false, type: "text" },
    ]

    if (component === "Source") {
      return [
        ...baseProperties,
        { name: "Database", value: nodeProperties.connectionString, required: true, type: "text" },
        { name: "Schema", value: nodeProperties.query, required: true, type: "text" },
        { name: "Target Table", value: nodeProperties.targetTable, required: true, type: "text" },
        { name: "Column Filter", value: nodeProperties.columnFilter, required: false, type: "text" },
        {
          name: "Encoding",
          value: nodeProperties.encoding,
          required: false,
          type: "select",
          options: ["UTF-8", "ASCII", "ISO-8859-1"],
        },
      ]
    }

    if (component === "Join") {
      return [
        ...baseProperties,
        { name: "Main Table", value: nodeProperties.operation, required: true, type: "text" },
        {
          name: "Join Type",
          value: nodeProperties.query,
          required: true,
          type: "select",
          options: ["INNER", "LEFT", "RIGHT", "FULL"],
        },
        { name: "Join Condition", value: nodeProperties.targetTable, required: true, type: "textarea" },
      ]
    }

    if (component === "Target") {
      return [
        ...baseProperties,
        { name: "Target Connection", value: nodeProperties.connectionString, required: true, type: "text" },
        { name: "Target Table", value: nodeProperties.targetTable, required: true, type: "text" },
        {
          name: "Action Type",
          value: nodeProperties.operation,
          required: true,
          type: "select",
          options: ["INSERT", "UPDATE", "UPSERT", "DELETE"],
        },
        { name: "Batch Size", value: nodeProperties.batchSize, required: false, type: "number" },
      ]
    }

    return [
      ...baseProperties,
      { name: "Input Table", value: nodeProperties.operation, required: true, type: "text" },
      { name: "Operation", value: nodeProperties.query, required: false, type: "textarea" },
    ]
  }

  const getFieldStatus = (property) => {
    if (property.required && (!property.value || property.value.toString().trim() === "")) {
      return { status: "error", text: "Input required", icon: <XCircle className="h-3 w-3 text-red-500" /> }
    }
    if (property.value && property.value.toString().trim() !== "") {
      return { status: "success", text: "OK", icon: <CheckCircle className="h-3 w-3 text-green-500" /> }
    }
    return { status: "warning", text: "Optional", icon: <AlertCircle className="h-3 w-3 text-yellow-500" /> }
  }

  const renderPropertyInput = (property) => {
    const fieldStatus = getFieldStatus(property)

    if (property.type === "select") {
      return (
        <Select
          value={property.value}
          onValueChange={(value) => handlePropertyChange(property.name.toLowerCase().replace(/\s+/g, ""), value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {property.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (property.type === "textarea") {
      return (
        <Textarea
          value={property.value}
          onChange={(e) => handlePropertyChange(property.name.toLowerCase().replace(/\s+/g, ""), e.target.value)}
          className="h-8 min-h-8 resize-none"
          placeholder={`Enter ${property.name.toLowerCase()}...`}
        />
      )
    }

    return (
      <Input
        type={property.type === "number" ? "number" : "text"}
        value={property.value}
        onChange={(e) => handlePropertyChange(property.name.toLowerCase().replace(/\s+/g, ""), e.target.value)}
        className="h-8"
        placeholder={`Enter ${property.name.toLowerCase()}...`}
      />
    )
  }

  return (
    <div
      className={`bg-white border-t border-gray-200 flex transition-all duration-300 ${isCollapsed ? "h-10" : "h-80"}`}
    >
      <div className="w-full">
        <div className="h-10 bg-white-50 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Properties Panel</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {!isCollapsed && (
          <div className="flex h-70">
            <div className="flex-1 border-r border-gray-200">
              <Tabs defaultValue="properties" className="h-full">
                <TabsList className="grid w-full grid-cols-7 h-10 bg-white-50">
                  {/* <TabsTrigger value="properties" className="flex items-center gap-1 border-0">
                    <Settings className="h-3 w-3" />
                    Properties
                  </TabsTrigger> */}
                  {/* <TabsTrigger value="sample" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Sample
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Metadata
                  </TabsTrigger>
                  <TabsTrigger value="lineage" className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    Lineage
                  </TabsTrigger>
                  <TabsTrigger value="sql" className="flex items-center gap-1">
                    <FileCode className="h-3 w-3" />
                    SQL
                  </TabsTrigger>
                  <TabsTrigger value="plan" className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Plan
                  </TabsTrigger>
                  <TabsTrigger value="help" className="flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Help
                  </TabsTrigger> */}
                </TabsList>

                <TabsContent value="properties" className="p-4 h-full">
                  {selectedNode ? (
                    <div className="h-full overflow-auto">
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-900 mb-2">{selectedNode.component} Properties</h3>
                        <div className="text-sm text-gray-600 mb-4">Configure the properties for this component</div>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Value
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getPropertiesForTable().map((property, index) => {
                              const fieldStatus = getFieldStatus(property)
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                    {property.name}
                                    {property.required && <span className="text-red-500 ml-1">*</span>}
                                  </td>
                                  <td className="px-4 py-2">{renderPropertyInput(property)}</td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      {fieldStatus.icon}
                                      <span
                                        className={`text-xs ${
                                          fieldStatus.status === "error"
                                            ? "text-red-600"
                                            : fieldStatus.status === "success"
                                              ? "text-green-600"
                                              : "text-yellow-600"
                                        }`}
                                      >
                                        {fieldStatus.text}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Select a component to view its properties
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* <div className="flex-1">
              <Tabs defaultValue="console" className="h-full">
                <TabsList className="grid w-full grid-cols-5 h-10 bg-gray-50">
                  <TabsTrigger value="tasks" className="flex items-center gap-1">
                    <List className="h-3 w-3" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger value="search" className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger value="console" className="flex items-center gap-1">
                    <Terminal className="h-3 w-3" />
                    Console
                  </TabsTrigger>
                  <TabsTrigger value="command" className="flex items-center gap-1">
                    <Command className="h-3 w-3" />
                    Command Log
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Notifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="console" className="p-4 h-full">
                  <div className="h-full bg-black rounded-lg p-4 font-mono text-sm overflow-auto">
                    {jobLogs && jobLogs.length > 0 ? (
                      <div className="space-y-1">
                        {jobLogs.map((log, index) => (
                          <div key={index} className="text-green-400">
                            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">Console output will appear here...</div>
                    )}
                    {validationErrors && validationErrors.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {validationErrors.map((error, index) => (
                          <div key={index} className="text-red-400">
                            <span className="text-gray-500">[ERROR]</span> {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="p-4 h-full">
                  <div className="text-sm text-gray-600">Task management panel - Coming soon</div>
                </TabsContent>

                <TabsContent value="search" className="p-4 h-full">
                  <div className="text-sm text-gray-600">Search functionality - Coming soon</div>
                </TabsContent>

                <TabsContent value="command" className="p-4 h-full">
                  <div className="text-sm text-gray-600">Command log - Coming soon</div>
                </TabsContent>

                <TabsContent value="notifications" className="p-4 h-full">
                  <div className="text-sm text-gray-600">Notifications panel - Coming soon</div>
                </TabsContent>
              </Tabs>
            </div> */}
          </div>
        )}
      </div>
    </div>
  )
}
