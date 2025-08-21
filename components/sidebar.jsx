"use client"

import { Database, Workflow, Briefcase, Settings, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Sidebar({ onDragStart, draggedComponent }) {
  const [expandedSections, setExpandedSections] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSection = (section) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const navigationSections = [
    {
      name: "Catalog",
      icon: Database,
      items: ["Tables", "Views", "Functions", "Schemas"],
    },
    {
      name: "Data Flow",
      icon: Workflow,
      items: ["Pipelines", "Transformations", "Connections"],
    },
    // {
    //   name: "Workflow",
    //   icon: Settings,
    //   items: ["Jobs", "Schedules", "Triggers"],
    // },
    {
      name: "Jobs",
      icon: Briefcase,
      items: ["Active", "Completed", "Failed", "Scheduled"],
    },
  ]

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
    >
      <div className="p-4 border-b border-gray-200 relative">
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"> */}
            {/* <span className="text-gray-600 font-bold text-sm"></span> */}
          {/* </div> */}
          <div className="h-8"></div>
          {!isCollapsed && <h2 className="text-lg font-semibold text-gray-800"></h2>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-2 h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="space-y-2">
            {navigationSections.map((section) => (
              <div key={section.name}>
                <Button
                  variant="ghost"
                  className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-2 h-8 px-2 text-gray-700 hover:bg-gray-100`}
                  onClick={() => !isCollapsed && toggleSection(section.name.toLowerCase())}
                  title={isCollapsed ? section.name : undefined}
                >
                  {!isCollapsed &&
                    (expandedSections.includes(section.name.toLowerCase()) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    ))}
                  <section.icon className="h-4 w-4" />
                  {!isCollapsed && <span className="text-sm">{section.name}</span>}
                </Button>

                {isCollapsed ? (
                  <div className="relative group">
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {section.items.join(", ")}
                      </div>
                    </div>
                  </div>
                ) : (
                  expandedSections.includes(section.name.toLowerCase()) && (
                    <div className="ml-6 space-y-1 mt-1">
                      {section.items.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          className="w-full justify-start text-xs text-gray-600 py-2 px-3 hover:bg-gray-50 h-auto"
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Run Job</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                Validate
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                Schedule
              </Button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}
