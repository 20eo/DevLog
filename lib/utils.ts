import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock database helpers
export const MOCK_DATA = {
  logs: [
    {
      id: "log-1",
      userId: "dev-123",
      date: "2025-04-19",
      tasks: [
        { id: "task-1", description: "Implemented login flow", timeSpent: 120, completed: true },
        { id: "task-2", description: "Fixed navigation bug", timeSpent: 45, completed: true },
        { id: "task-3", description: "Started work on profile page", timeSpent: 90, completed: false },
      ],
      mood: "productive",
      blockers: "Need design assets for profile page",
      reviewed: false,
      managerComments: null,
    },
    {
      id: "log-2",
      userId: "dev-123",
      date: "2025-04-18",
      tasks: [
        { id: "task-4", description: "Code review for PR #123", timeSpent: 60, completed: true },
        { id: "task-5", description: "Team meeting", timeSpent: 45, completed: true },
        { id: "task-6", description: "Documentation update", timeSpent: 120, completed: true },
      ],
      mood: "neutral",
      blockers: null,
      reviewed: true,
      managerComments: "Good work on the documentation. Let's discuss the login flow implementation.",
    },
    {
      id: "log-3",
      userId: "dev-456",
      date: "2025-04-19",
      tasks: [
        { id: "task-7", description: "API integration", timeSpent: 180, completed: true },
        { id: "task-8", description: "Unit testing", timeSpent: 120, completed: false },
      ],
      mood: "frustrated",
      blockers: "API documentation is outdated",
      reviewed: false,
      managerComments: null,
    },
  ],

  teamMembers: [
    {
      id: "dev-123",
      name: "John Developer",
      email: "john@example.com",
      role: "developer",
      team: "frontend",
      managerId: "mgr-456",
    },
    {
      id: "dev-456",
      name: "Alice Engineer",
      email: "alice@example.com",
      role: "developer",
      team: "backend",
      managerId: "mgr-456",
    },
    {
      id: "dev-789",
      name: "Bob Coder",
      email: "bob@example.com",
      role: "developer",
      team: "frontend",
      managerId: "mgr-456",
    },
  ],
}

// Helper function to get user logs
export function getUserLogs(userId: string) {
  return MOCK_DATA.logs.filter((log) => log.userId === userId)
}

// Helper function to get team members for a manager
export function getTeamMembers(managerId: string) {
  return MOCK_DATA.teamMembers.filter((member) => member.managerId === managerId)
}

// Helper function to get logs for a team
export function getTeamLogs(managerId: string) {
  const teamMemberIds = getTeamMembers(managerId).map((member) => member.id)
  return MOCK_DATA.logs.filter((log) => teamMemberIds.includes(log.userId))
}

// Mood options
export const moodOptions = [
  { value: "productive", label: "Productive 😄" },
  { value: "neutral", label: "Neutral 😐" },
  { value: "frustrated", label: "Frustrated 😓" },
  { value: "stressed", label: "Stressed 😰" },
  { value: "inspired", label: "Inspired 🚀" },
]

// Generate dates for the past 30 days
export function getPast30Days() {
  const dates = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }
  return dates
}

// Generate productivity data for heatmap
export function generateProductivityData(userId: string) {
  const dates = getPast30Days()
  const userLogs = getUserLogs(userId)

  return dates.map((date) => {
    const log = userLogs.find((log) => log.date === date)

    if (!log) {
      return { date, value: 0 }
    }

    // Calculate productivity value (0-10) based on completed tasks
    const completedTasksCount = log.tasks.filter((task) => task.completed).length
    const totalTasksCount = log.tasks.length
    const value = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 10) : 0

    return { date, value }
  })
}

// Format time (minutes) to hours and minutes
export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  }

  return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
}
