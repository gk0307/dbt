import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Database, Clock, CheckCircle } from "lucide-react"

export function DashboardMetrics() {
  const metrics = [
    {
      title: "Active Pipelines",
      value: "12",
      change: "+2 from last week",
      icon: TrendingUp,
      color: "text-chart-1",
    },
    {
      title: "Data Sources",
      value: "8",
      change: "All connected",
      icon: Database,
      color: "text-chart-3",
    },
    {
      title: "Avg Runtime",
      value: "4.2m",
      change: "-12% from last week",
      icon: Clock,
      color: "text-chart-4",
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "+0.3% from last week",
      icon: CheckCircle,
      color: "text-chart-1",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
