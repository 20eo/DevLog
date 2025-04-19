import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight, ClipboardCheck, Clock, BarChart3, UserCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Track, reflect, improve your development workflow
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  DevLog helps developers log their daily work, track productivity, and share updates with managers and
                  teammates.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/login" className={buttonVariants({ size: "lg" })}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/about" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[450px] w-full overflow-hidden rounded-xl border bg-muted p-4 md:p-8">
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <h3 className="ml-2 text-xl font-bold">Daily Dev Log</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track your progress, reflect on your work, and share updates with your team.
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Today's Progress</span>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted-foreground/20">
                      <div className="h-full w-[85%] rounded-full bg-primary"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-card p-3">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Tasks Completed</p>
                          <p className="text-xl font-bold">12</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Team Updates</p>
                          <p className="text-xl font-bold">5</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-2">
                      {["API Integration", "Bug Fix #324", "Documentation"].map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-2">
                          <span className="text-sm">{item}</span>
                          <span className="text-xs text-muted-foreground">Today</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features Built for Developers
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to log your work, track productivity, and collaborate with your team.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary p-2 text-primary-foreground">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Daily Logs</h3>
              <p className="text-center text-muted-foreground">
                Record tasks, time spent, mood, and blockers in your daily work logs.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary p-2 text-primary-foreground">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Visualization</h3>
              <p className="text-center text-muted-foreground">
                Track your productivity with weekly and monthly heat maps and progress charts.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
              <div className="rounded-full bg-primary p-2 text-primary-foreground">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Team Insights</h3>
              <p className="text-center text-muted-foreground">
                Share updates with managers and receive feedback on your daily work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
