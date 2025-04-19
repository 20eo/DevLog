"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Calendar, AlertCircle, CheckCircle, Filter } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getUserLogs, formatTime } from "@/lib/utils"

export default function LogsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Get user logs
    const userLogs = getUserLogs(user.id)
    setLogs(userLogs)
    setFilteredLogs(userLogs)
  }, [user, router])

  useEffect(() => {
    // Apply filters when filter state changes
    if (filter === "all") {
      setFilteredLogs(logs)
    } else if (filter === "with-blockers") {
      setFilteredLogs(logs.filter((log) => log.blockers && log.blockers.trim() !== ""))
    } else if (filter === "completed") {
      setFilteredLogs(
        logs.filter((log) => {
          const totalTasks = log.tasks.length
          const completedTasks = log.tasks.filter((task: any) => task.completed).length
          return totalTasks > 0 && completedTasks === totalTasks
        }),
      )
    } else if (filter === "reviewed") {
      setFilteredLogs(logs.filter((log) => log.reviewed))
    }
  }, [filter, logs])

  if (!user) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Logs</h1>
            <p className="text-muted-foreground">Review and manage your daily work logs</p>
          </div>
          <Button onClick={() => router.push("/logs/new")}>
            <Edit className="mr-2 h-4 w-4" />
            Log Today's Work
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Logs</CardTitle>
                <CardDescription>Track your daily progress and productivity</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setFilter}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Logs</TabsTrigger>
                <TabsTrigger value="with-blockers">With Blockers</TabsTrigger>
                <TabsTrigger value="completed">Fully Completed</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              </TabsList>

              <TabsContent value={filter}>
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No logs found</h3>
                    <p className="text-muted-foreground max-w-sm">
                      {filter === "all"
                        ? "You haven't created any work logs yet. Start by logging today's work."
                        : `No logs matching the "${filter}" filter. Try a different filter.`}
                    </p>
                    {filter === "all" && (
                      <Button className="mt-4" onClick={() => router.push("/logs/new")}>
                        Create Your First Log
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLogs.map((log) => {
                      const totalTasks = log.tasks.length
                      const completedTasks = log.tasks.filter((task: any) => task.completed).length
                      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                      return (
                        <div
                          key={log.id}
                          className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                          onClick={() => router.push(`/logs/${log.id}`)}
                        >
                          <div className="space-y-2 md:space-y-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {new Date(log.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </h3>
                              {log.reviewed && (
                                <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                                  Reviewed
                                </div>
                              )}
                              {log.blockers && (
                                <div className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Blocker
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {totalTasks} tasks,{" "}
                              {formatTime(log.tasks.reduce((t: number, task: any) => t + task.timeSpent, 0))} tracked
                            </p>
                          </div>

                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm font-medium">
                                  {completedTasks}/{totalTasks}
                                </span>
                              </div>
                              <div className="h-2 w-20 rounded-full bg-primary/20">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                            </div>

                            <div className="text-sm">
                              <span className="font-medium capitalize">{log.mood}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
