"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Smile, AlertTriangle } from "lucide-react"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"

import { useAuth } from "@/lib/auth-context"
import { MOCK_DATA, formatTime, moodOptions, getTeamMembers } from "@/lib/utils"

const formSchema = z.object({
  feedback: z.string().min(1, "Feedback is required"),
})

export default function TeamLogDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [log, setLog] = useState<any>(null)
  const [developer, setDeveloper] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: "",
    },
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "manager") {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have permission to view this page.",
      })
      router.push("/dashboard")
      return
    }

    // Fetch log data
    const foundLog = MOCK_DATA.logs.find((l) => l.id === params.id)

    if (foundLog) {
      setLog(foundLog)

      // Get team member data
      const teamMembers = getTeamMembers(user.id)
      const foundDeveloper = teamMembers.find((m) => m.id === foundLog.userId)
      setDeveloper(foundDeveloper)

      // Set initial form values if there's feedback
      if (foundLog.managerComments) {
        form.setValue("feedback", foundLog.managerComments)
      }
    } else {
      toast({
        variant: "destructive",
        title: "Log not found",
        description: "The requested log could not be found.",
      })
      router.push("/team")
    }

    setIsLoading(false)
  }, [params.id, router, toast, user, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !log) {
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      console.log("Submitting review:", {
        logId: log.id,
        feedback: values.feedback,
        reviewedBy: user.id,
      })

      toast({
        title: "Review submitted",
        description: "Your feedback has been submitted successfully.",
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the local state to show as reviewed
      setLog({
        ...log,
        reviewed: true,
        managerComments: values.feedback,
      })

      setIsSubmitting(false)
    } catch (error) {
      console.error("Failed to submit review:", error)
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: "There was an error submitting your review. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  if (isLoading || !log || !developer) {
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
          <Button variant="ghost" size="icon" onClick={() => router.push("/team")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Work Log</h1>
            <p className="text-muted-foreground">
              {developer.name} •{" "}
              {new Date(log.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Tasks worked on during this day</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>{log.reviewed ? "Your Feedback" : "Provide Feedback"}</CardTitle>
                <CardDescription>
                  {log.reviewed
                    ? "Your review and comments on this work log"
                    : "Review this work log and provide feedback"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="feedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feedback</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide feedback on this work log..."
                              {...field}
                              disabled={log.reviewed}
                              rows={6}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!log.reviewed && (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Developer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Name</p>
                  <p>{developer.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email</p>
                  <p>{developer.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Team</p>
                  <p className="capitalize">{developer.team}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
