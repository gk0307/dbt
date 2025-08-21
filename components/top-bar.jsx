"use client"
import {
  Bell,
  User,
  Save,
  Undo,
  Redo,
  Play,
  Settings,
  CheckCircle,
  AlertTriangle,
  Plus,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopBar({ onRunJob, onValidate, isJobRunning, validationErrors, onCreateProject }) {
  const handleRunClick = () => {
    const isValid = onValidate()
    if (isValid) {
      onRunJob()
    }
  }

  const handleValidateClick = () => {
    onValidate()
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 flex items-center justify-between px-4">
        {/* Left side controls */}
        <div className="flex items-center gap-4">
          {/* Icon buttons group */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300" />

          {/* Pipeline name label */}
          <div className="text-sm font-medium text-gray-700">Customer_Data_Pipeline.mtln</div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={`h-8 ${
              validationErrors.length > 0
                ? "border-red-300 text-red-600 hover:bg-red-50"
                : "border-green-300 text-green-600 hover:bg-green-50"
            }`}
            onClick={handleValidateClick}
          >
            {validationErrors.length > 0 ? (
              <AlertTriangle className="h-3 w-3 mr-1" />
            ) : (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            Validate
          </Button>

          <Button
            size="sm"
            className="bg-[rgb(30,136,229)] hover:bg-[rgb(25,116,194)] text-white h-8 disabled:opacity-50"
            onClick={handleRunClick}
            disabled={isJobRunning}
          >
            <Play className={`h-3 w-3 mr-1 ${isJobRunning ? "animate-spin" : ""}`} />
            {isJobRunning ? "Running..." : "Run"}
          </Button>

          <div className="h-4 w-px bg-gray-300" />

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
