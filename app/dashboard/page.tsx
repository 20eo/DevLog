"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, ClipboardCheck, Edit, FilePenLine } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getUserLogs, generateProductivityData, formatTime, getTeamLogs } from "@/lib/utils"

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [userLogs, setUserLogs] = useState<any[]>([])
  const [teamLogs, setTeamLogs] = useState<any[]>([])
  const [productivityData, setProductivityData] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Get user logs
    const logs = getUserLogs(user.id)
    setUserLogs(logs)

    // Generate productivity data for the heatmap
    const productivity = generateProductivityData(user.id)
    setProductivityData(productivity)

    // If user is a manager, get team logs
    if (user.role === "manager") {
      const logs = getTeamLogs(user.id)
      setTeamLogs(logs)
    }
  }, [user, router])

  if (!user) {
    return null
  }

  // Calculate stats
  const totalTasksToday = userLogs[0]?.tasks.length || 0
  const completedTasksToday = userLogs[0]?.tasks.filter((task: any) => task.completed).length || 0
  const completionRateToday = totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0

  const totalTimeSpentToday = userLogs[0]?.tasks.reduce((total: number, task: any) => total + task.timeSpent, 0) || 0

  return (
    <div className="container py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Here's an overview of your work and productivity</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasksToday}/{totalTasksToday}
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-full rounded-full bg-primary/20">
                <div className="h-full rounded-full bg-primary" style={{ width: `${completionRateToday}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{completionRateToday}%</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              {totalTasksToday === 0
                ? "No tasks logged today"
                : `${completedTasksToday} of ${totalTasksToday} tasks completed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeSpentToday)}</div>
            <p className="text-xs text-muted-foreground">
              {totalTimeSpentToday === 0 ? "No time tracked today" : `Across ${totalTasksToday} different tasks`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userLogs[0]?.mood ? userLogs[0].mood.charAt(0).toUpperCase() + userLogs[0].mood.slice(1) : "Not logged"}
            </div>
            <p className="text-xs text-muted-foreground">
              {userLogs[0]?.blockers ? `Blocker: ${userLogs[0].blockers}` : "No blockers reported"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Productivity Heatmap</CardTitle>
            <CardDescription>Your productivity over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {productivityData.slice(0, 28).map((day, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: day.value > 0 ? `rgba(var(--primary), ${day.value / 10})` : "var(--muted)",
                  }}
                  title={`${day.date}: ${day.value === 0 ? "No data" : `${day.value} out of 10`}`}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                  <div
                    key={i}
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: `rgba(var(--primary), ${opacity})` }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest work logs and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {userLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.tasks.length} tasks,{" "}
                      {formatTime(log.tasks.reduce((t: number, task: any) => t + task.timeSpent, 0))} tracked
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {log.reviewed && (
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                        Reviewed
                      </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/logs/${log.id}`)}>
                      <FilePenLine className="h-4 w-4" />
                      <span className="sr-only">View log</span>
                    </Button>
                  </div>
                </div>
              ))}
              {userLogs.length === 0 && (
                <p className="text-sm text-muted-foreground">No logs found. Start tracking your work!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </div>
              <Button onClick={() => router.push("/logs/new")}>
                <Edit className="mr-2 h-4 w-4" />
                Log Today's Work
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/logs">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  View All Logs
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/logs/new">
                  <FilePenLine className="mr-2 h-4 w-4" />
                  Create New Log
                </Link>
              </Button>

              {user.role === "manager" && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/team">
                    <Clock className="mr-2 h-4 w-4" />
                    Team Overview
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {user.role === "manager" && teamLogs.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Recent logs from your team members</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="unreviewed">
                <TabsList className="mb-4">
                  <TabsTrigger value="unreviewed">Unreviewed</TabsTrigger>
                  <TabsTrigger value="all">All Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="unreviewed">
                  <div className="space-y-4">
                    {teamLogs.filter((log) => !log.reviewed).length === 0 ? (
                      <p className="text-sm text-muted-foreground">All logs have been reviewed!</p>
                    ) : (
                      teamLogs
                        .filter((log) => !log.reviewed)
                        .map((log) => (
                          <div key={log.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="font-medium">
                                {log.userId === "dev-123"
                                  ? "John Developer"
                                  : log.userId === "dev-456"
                                    ? "Alice Engineer"
                                    : "Bob Coder"}
                              </p>
                              <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                              <p className="text-sm">
                                {log.tasks.length} tasks, {log.mood} mood
                              </p>
                            </div>
                            <Button variant="outline" onClick={() => router.push(`/team/${log.id}`)}>
                              Review
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all">
                  <div className="space-y-4">
                    {teamLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">
                            {log.userId === "dev-123"
                              ? "John Developer"
                              : log.userId === "dev-456"
                                ? "Alice Engineer"
                                : "Bob Coder"}
                          </p>
                          <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">
                              {log.tasks.length} tasks, {log.mood} mood
                            </p>
                            {log.reviewed && (
                              <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                                Reviewed
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => router.push(`/team/${log.id}`)}>
                          {log.reviewed ? "View" : "Review"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
