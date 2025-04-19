"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { moodOptions } from "@/lib/utils"

const taskSchema = z.object({
  description: z.string().min(2, "Description is required"),
  timeSpent: z.coerce.number().min(1, "Time spent must be at least 1 minute"),
  completed: z.boolean().default(false),
})

const formSchema = z.object({
  tasks: z.array(taskSchema).min(1, "At least one task is required"),
  mood: z.string().min(1, "Please select your mood"),
  blockers: z.string().optional(),
})

export default function NewLogPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks: [{ description: "", timeSpent: 30, completed: false }],
      mood: "",
      blockers: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a log.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      console.log("Submitting log:", {
        userId: user.id,
        date: new Date().toISOString().split("T")[0],
        ...values,
      })

      toast({
        title: "Log created!",
        description: "Your work log has been successfully saved.",
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to logs list
      router.push("/logs")
    } catch (error) {
      console.error("Failed to create log:", error)
      toast({
        variant: "destructive",
        title: "Failed to create log",
        description: "There was an error creating your log. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Log Today's Work</h1>
          <p className="text-muted-foreground">Record your tasks, time spent, and any blockers</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Tasks Completed</CardTitle>
                <CardDescription>Add the tasks you've worked on today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 md:grid-cols-[1fr_150px_auto_auto]">
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Task description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tasks.${index}.timeSpent`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <Input type="number" placeholder="Minutes" {...field} />
                              <span className="ml-2 text-sm">min</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tasks.${index}.completed`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm">Completed</FormLabel>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove task</span>
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ description: "", timeSpent: 30, completed: false })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reflection</CardTitle>
                <CardDescription>How did you feel about your productivity today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {moodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blockers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blockers (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any issues or blockers that slowed you down?" {...field} />
                      </FormControl>
                      <FormDescription>
                        Let your manager know if there are any issues that need to be addressed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push("/logs")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Log"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}
