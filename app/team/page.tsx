"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, AlertCircle, CheckCircle, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getTeamMembers, getTeamLogs, formatTime } from "@/lib/utils"

export default function TeamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamLogs, setTeamLogs] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

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

    // Get team members for the manager
    const members = getTeamMembers(user.id)
    setTeamMembers(members)

    // Get logs for the team
    const logs = getTeamLogs(user.id)
    setTeamLogs(logs)
    setFilteredLogs(logs)
  }, [user, router, toast])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...teamLogs]

    // Apply tab filter
    if (activeTab === "unreviewed") {
      filtered = filtered.filter((log) => !log.reviewed)
    } else if (activeTab === "withBlockers") {
      filtered = filtered.filter((log) => log.blockers && log.blockers.trim() !== "")
    }

    // Apply search
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((log) => {
        // Map user ID to name for searching
        const userName = teamMembers.find((m) => m.id === log.userId)?.name.toLowerCase() || ""

        // Search in tasks
        const tasksMatch = log.tasks.some((task: any) => task.description.toLowerCase().includes(searchLower))

        // Search in blockers
        const blockersMatch = log.blockers && log.blockers.toLowerCase().includes(searchLower)

        return (
          userName.includes(searchLower) || tasksMatch || blockersMatch || log.mood.toLowerCase().includes(searchLower)
        )
      })
    }

    setFilteredLogs(filtered)
  }, [teamLogs, search, activeTab, teamMembers])

  if (!user || user.role !== "manager") {
    return null
  }

  // Helper to get member name from ID
  const getMemberName = (userId: string) => {
    const member = teamMembers.find((m) => m.id === userId)
    return member ? member.name : "Unknown"
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team View</h1>
          <p className="text-muted-foreground">Monitor your team's logs and productivity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Overview of your team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-4 rounded-lg border p-4">
                  <Avatar>
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{member.team}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <div>
                <CardTitle>Team Logs</CardTitle>
                <CardDescription>View and manage your team's work logs</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Logs</TabsTrigger>
                <TabsTrigger value="unreviewed">Unreviewed</TabsTrigger>
                <TabsTrigger value="withBlockers">With Blockers</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No logs found</h3>
                    <p className="text-muted-foreground max-w-sm">
                      {search.trim() !== ""
                        ? `No logs match your search "${search}"`
                        : activeTab === "unreviewed"
                          ? "All logs have been reviewed!"
                          : activeTab === "withBlockers"
                            ? "No blockers reported by the team"
                            : "No logs have been submitted yet"}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team Member</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Tasks</TableHead>
                          <TableHead>Mood</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => {
                          const totalTasks = log.tasks.length
                          const completedTasks = log.tasks.filter((t: any) => t.completed).length

                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{getMemberName(log.userId)}</TableCell>
                              <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {completedTasks}/{totalTasks}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({formatTime(log.tasks.reduce((t: number, task: any) => t + task.timeSpent, 0))})
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="capitalize">{log.mood}</span>
                                {log.blockers && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Blocker
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {log.reviewed ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Reviewed
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                  >
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/team/${log.id}`)}>
                                  {log.reviewed ? "View" : "Review"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
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
