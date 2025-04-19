"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Edit, Smile, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { MOCK_DATA, formatTime, moodOptions } from "@/lib/utils"

export default function LogDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [log, setLog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Fetch log data
    const foundLog = MOCK_DATA.logs.find((l) => l.id === params.id)

    if (foundLog) {
      setLog(foundLog)
    } else {
      toast({
        variant: "destructive",
        title: "Log not found",
        description: "The requested log could not be found.",
      })
      router.push("/logs")
    }

    setIsLoading(false)
  }, [params.id, router, toast, user])

  if (isLoading || !log) {
    return <div className="container py-6">Loading...</div>
  }

  // Get mood display name
  const moodOption = moodOptions.find((m) => m.value === log.mood)
  const moodDisplay = moodOption ? moodOption.label : log.mood

  // Calculate stats
  const totalTasks = log.tasks.length
  const completedTasks = log.tasks.filter((task: any) => task.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/logs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Log for{" "}
              {new Date(log.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>
            <p className="text-muted-foreground">View your work log details</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" onClick={() => router.push(`/logs/edit/${params.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Log
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Tasks you worked on during this day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {log.tasks.map((task: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Checkbox checked={task.completed} disabled />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{task.description}</div>
                        <div className="text-sm text-muted-foreground">Time spent: {formatTime(task.timeSpent)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {log.blockers && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Blockers</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{log.blockers}</p>
                </CardContent>
              </Card>
            )}

            {log.managerComments && (
              <Card>
                <CardHeader>
                  <CardTitle>Manager Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{log.managerComments}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(log.date).toLocaleDateString()}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>Completion</span>
                  </div>
                  <div className="font-medium">
                    {completedTasks}/{totalTasks} tasks
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-primary/20">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${completionRate}%` }} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Time Tracked</span>
                  </div>
                  <div className="font-medium">
                    {formatTime(log.tasks.reduce((t: number, task: any) => t + task.timeSpent, 0))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                    <span>Mood</span>
                  </div>
                  <div className="font-medium capitalize">{moodDisplay}</div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                  </div>
                  <div>
                    {log.reviewed ? (
                      <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                        Reviewed
                      </div>
                    ) : (
                      <div className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        Pending Review
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
