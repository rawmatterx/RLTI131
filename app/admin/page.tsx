"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download, Search, Settings, Users, FileText, Shield } from "lucide-react"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")

  // Mock data for demonstration
  const auditLogs = [
    {
      id: "1",
      timestamp: "2024-01-15 14:30:22",
      user: "Dr. Smith",
      action: "Assessment Completed",
      patient: "Patient #12345",
      details: "I-131 eligibility assessment completed with PASS result",
    },
    {
      id: "2",
      timestamp: "2024-01-15 13:45:10",
      user: "Dr. Johnson",
      action: "Protocol Exported",
      patient: "Patient #12344",
      details: "High-dose ablation protocol exported as PDF",
    },
    {
      id: "3",
      timestamp: "2024-01-15 12:15:33",
      user: "Dr. Wilson",
      action: "Safety Checklist Signed",
      patient: "Patient #12343",
      details: "Isolation room preparation checklist digitally signed",
    },
  ]

  const users = [
    {
      id: "1",
      name: "Dr. Sarah Smith",
      email: "sarah.smith@hospital.com",
      role: "Endocrinologist",
      status: "Active",
      lastLogin: "2024-01-15 14:30",
    },
    {
      id: "2",
      name: "Dr. Michael Johnson",
      email: "michael.johnson@hospital.com",
      role: "Nuclear Medicine",
      status: "Active",
      lastLogin: "2024-01-15 13:45",
    },
    {
      id: "3",
      name: "Dr. Emily Wilson",
      email: "emily.wilson@hospital.com",
      role: "Resident",
      status: "Active",
      lastLogin: "2024-01-15 12:15",
    },
  ]

  const systemStats = {
    totalSessions: 1247,
    activeUsers: 23,
    completedAssessments: 892,
    exportedReports: 445,
    systemUptime: "99.8%",
    lastBackup: "2024-01-15 02:00",
  }

  return (
    <div className="min-h-screen bg-clinical-bg">
      {/* Header */}
      <div className="bg-white border-b border-clinical-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-semibold text-clinical-text">System Administration</h1>
              <p className="text-clinical-text-secondary mt-1">
                Manage users, monitor system activity, and configure settings
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export System Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="h-4 w-4 text-clinical-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalSessions.toLocaleString("en-US")}</div>
              <p className="text-xs text-clinical-text-secondary">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-clinical-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
              <p className="text-xs text-clinical-text-secondary">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Shield className="h-4 w-4 text-clinical-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.systemUptime}</div>
              <p className="text-xs text-clinical-text-secondary">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="audit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="exports">Export Center</TabsTrigger>
          </TabsList>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Trail</CardTitle>
                <CardDescription>Complete log of all system activities and user actions</CardDescription>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-clinical-text-secondary" />
                    <Input
                      placeholder="Search audit logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.patient}</TableCell>
                        <TableCell className="text-sm text-clinical-text-secondary">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                <Button className="w-fit">Add New User</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{user.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Disable
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure system security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-clinical-text-secondary">Enforce 2FA for all user accounts</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-clinical-text-secondary">Auto-logout after inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Retention</CardTitle>
                  <CardDescription>Configure data retention and backup policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Log Retention</Label>
                      <p className="text-sm text-clinical-text-secondary">How long to keep audit logs</p>
                    </div>
                    <Select defaultValue="365">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="1095">3 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-clinical-text-secondary">Enable scheduled system backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Export Center Tab */}
          <TabsContent value="exports" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export Center</CardTitle>
                  <CardDescription>Export system data for reporting and compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                      <FileText className="h-6 w-6" />
                      Export Audit Logs
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                      <Users className="h-6 w-6" />
                      Export User Data
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                      <Settings className="h-6 w-6" />
                      Export System Config
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                      <Shield className="h-6 w-6" />
                      Export Compliance Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Configure automatic report generation and delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-clinical-border rounded-lg">
                      <div>
                        <h4 className="font-medium">Weekly Activity Report</h4>
                        <p className="text-sm text-clinical-text-secondary">System usage and audit summary</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Enabled</Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-clinical-border rounded-lg">
                      <div>
                        <h4 className="font-medium">Monthly Compliance Report</h4>
                        <p className="text-sm text-clinical-text-secondary">Regulatory compliance and audit trail</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Enabled</Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Clinical Disclaimer */}
      <div className="bg-clinical-warning border-t border-clinical-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-clinical-text-secondary text-center">
            <strong>Administrative Notice:</strong> All system activities are logged for compliance and audit purposes.
            Ensure proper authorization before making configuration changes.
          </p>
        </div>
      </div>
    </div>
  )
}
