'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Search, Mail, Phone, Building, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  ON_LEAVE: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  TERMINATED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  RESIGNED: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const roleColors: Record<string, string> = {
  WEBSITE_ADMIN: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  COMPANY_ADMIN: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  HR: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  MANAGER: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
  EMPLOYEE: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

// Generate random password
function generateRandomPassword(length = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*!';
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Get display role name
function getDisplayRole(role: string): string {
  switch (role) {
    case 'WEBSITE_ADMIN': return 'Website Admin';
    case 'COMPANY_ADMIN': return 'Company Admin';
    case 'HR': return 'HR Manager';
    case 'MANAGER': return 'Manager';
    case 'EMPLOYEE': return 'Employee';
    default: return role;
  }
}

function AdminEmployeesContent() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'EMPLOYEE' as 'WEBSITE_ADMIN' | 'COMPANY_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE',
    departmentId: '',
    designationId: '',
    employmentType: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN',
    dateOfJoining: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: employees, isLoading, refetch } = trpc.employee.getAll.useQuery();
  const createEmployee = trpc.employee.create.useMutation({
    onSuccess: () => {
      toast.success(`Employee created successfully! Temporary password: ${generatedPassword}`);
      setIsAddOpen(false);
      refetch();
      setGeneratedPassword('');
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'EMPLOYEE',
        departmentId: '',
        designationId: '',
        employmentType: 'FULL_TIME',
        dateOfJoining: format(new Date(), 'yyyy-MM-dd'),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get departments and designations for select
  const { data: departments } = trpc.employee.getAll.useQuery(undefined, {
    select: (data) => {
      const depts = new Map();
      data.forEach((e) => {
        if (e.department && !depts.has(e.department.id)) {
          depts.set(e.department.id, e.department);
        }
      });
      return Array.from(depts.values());
    },
  });

  const { data: designations } = trpc.employee.getAll.useQuery(undefined, {
    select: (data) => {
      const desigs = new Map();
      data.forEach((e) => {
        if (e.designation && !desigs.has(e.designation.id)) {
          desigs.set(e.designation.id, e.designation);
        }
      });
      return Array.from(desigs.values());
    },
  });

  const handleSubmit = () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill all required fields');
      return;
    }

    // Generate password if not set
    let password = formData.password;
    if (!password) {
      password = generateRandomPassword();
      setGeneratedPassword(password);
      setFormData({ ...formData, password });
    }

    createEmployee.mutate({
      email: formData.email,
      password: password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      role: formData.role,
      departmentId: formData.departmentId || undefined,
      designationId: formData.designationId || undefined,
      employmentType: formData.employmentType,
      dateOfJoining: new Date(formData.dateOfJoining),
    });
  };

  const filteredEmployees = employees?.filter(
    (e) =>
      (e.firstName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (e.lastName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (e.user?.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (e.user?.employeeId?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage all employees in the organization</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Create a new employee account</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (Auto-generated)</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Click Generate or enter manually"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const pwd = generateRandomPassword();
                      setGeneratedPassword(pwd);
                      setFormData({ ...formData, password: pwd });
                    }}
                  >
                    Generate
                  </Button>
                </div>
                {formData.password && (
                  <p className="text-xs text-muted-foreground">
                    User will be required to change password on first login
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'WEBSITE_ADMIN' | 'COMPANY_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="HR">HR Manager</SelectItem>
                    <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>
                    <SelectItem value="WEBSITE_ADMIN">Website Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept: { id: string; name: string }) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select
                  value={formData.designationId}
                  onValueChange={(value) => setFormData({ ...formData, designationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations?.map((desig: { id: string; title: string }) => (
                      <SelectItem key={desig.id} value={desig.id}>
                        {desig.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(
                    value: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
                  ) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERN">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createEmployee.isPending}>
                {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {employees?.filter((e) => e.employmentStatus === 'ACTIVE').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-foreground">
                  {employees?.filter((e) => e.employmentStatus === 'ON_LEAVE').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{departments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            {filteredEmployees?.length || 0} employees found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredEmployees?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {employee.firstName?.[0] || ''}
                            {employee.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.firstName || ''} {employee.lastName || ''}
                          </p>
                          <p className="text-sm text-muted-foreground">{employee.user?.email || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{employee.user?.employeeId || ''}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[employee.user?.role] || roleColors.EMPLOYEE}>
                        {getDisplayRole(employee.user?.role || 'EMPLOYEE')}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.department?.departmentName || '-'}</TableCell>
                    <TableCell>{employee.designation?.designationName || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[employee.employmentStatus]}>
                        {employee.employmentStatus?.replace('_', ' ') || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.joinDate ? format(new Date(employee.joinDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminEmployeesPage() {
  return (
    <RoleGuard allowedRoles={['WEBSITE_ADMIN', 'COMPANY_ADMIN', 'HR']}>
      <AdminEmployeesContent />
    </RoleGuard>
  );
}
