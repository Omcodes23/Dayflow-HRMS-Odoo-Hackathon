'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IndianRupee, Users, Edit, TrendingUp, Wallet, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils/currency';
import { RoleGuard } from '@/components/auth/RoleGuard';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    email: string;
    employeeId: string;
  };
  department: {
    departmentName: string;
  } | null;
  designation: {
    designationName: string;
  } | null;
  salary: {
    basicSalary: number;
    houseRentAllowance: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    specialAllowance: number;
    providentFund: number;
    professionalTax: number;
    incomeTax: number;
    effectiveFrom: Date;
  } | null;
};

function AdminPayrollContent() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [salaryData, setSalaryData] = useState({
    basicSalary: 0,
    houseRentAllowance: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0,
    effectiveFrom: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: employees, isLoading, refetch } = trpc.employee.getAll.useQuery();
  const upsertSalary = trpc.payroll.upsert.useMutation({
    onSuccess: () => {
      toast.success('Salary structure updated successfully!');
      setSelectedEmployee(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEditSalary = (employee: Employee) => {
    setSelectedEmployee(employee);
    if (employee.salary) {
      setSalaryData({
        basicSalary: employee.salary.basicSalary,
        houseRentAllowance: employee.salary.houseRentAllowance,
        conveyanceAllowance: employee.salary.conveyanceAllowance,
        medicalAllowance: employee.salary.medicalAllowance,
        specialAllowance: employee.salary.specialAllowance,
        providentFund: employee.salary.providentFund,
        professionalTax: employee.salary.professionalTax,
        incomeTax: employee.salary.incomeTax,
        effectiveFrom: format(new Date(employee.salary.effectiveFrom), 'yyyy-MM-dd'),
      });
    } else {
      setSalaryData({
        basicSalary: 0,
        houseRentAllowance: 0,
        conveyanceAllowance: 0,
        medicalAllowance: 0,
        specialAllowance: 0,
        providentFund: 0,
        professionalTax: 0,
        incomeTax: 0,
        effectiveFrom: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

  const handleSubmit = () => {
    if (!selectedEmployee) return;

    upsertSalary.mutate({
      employeeId: selectedEmployee.id,
      basicSalary: salaryData.basicSalary,
      hra: salaryData.houseRentAllowance,
      transportAllowance: salaryData.conveyanceAllowance,
      medicalAllowance: salaryData.medicalAllowance,
      specialAllowance: salaryData.specialAllowance,
      providentFund: salaryData.providentFund,
      professionalTax: salaryData.professionalTax,
      incomeTax: salaryData.incomeTax,
      effectiveFrom: salaryData.effectiveFrom,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateNetSalary = (emp: Employee) => {
    if (!emp.salary) return 0;
    return (
      emp.salary.basicSalary +
      emp.salary.houseRentAllowance +
      emp.salary.conveyanceAllowance +
      emp.salary.medicalAllowance +
      emp.salary.specialAllowance -
      emp.salary.providentFund -
      emp.salary.professionalTax -
      emp.salary.incomeTax
    );
  };

  const filteredEmployees = (employees as Employee[] | undefined)?.filter(
    (e) =>
      (e.firstName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (e.lastName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (e.user?.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (e.user?.employeeId?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const totalPayroll = filteredEmployees?.reduce(
    (sum, emp) => sum + calculateNetSalary(emp),
    0
  ) || 0;

  const employeesWithSalary = filteredEmployees?.filter((e) => e.salary)?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
        <p className="text-muted-foreground">Manage employee salary structures</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Salary</p>
                <p className="text-2xl font-bold">{employeesWithSalary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Setup</p>
                <p className="text-2xl font-bold">
                  {(employees?.length || 0) - employeesWithSalary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <p className="text-xl font-bold">{formatCurrency(totalPayroll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Salaries</CardTitle>
          <CardDescription>{filteredEmployees?.length || 0} employees found</CardDescription>
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
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No employees found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {employee.firstName?.[0] || ''}
                            {employee.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {employee.firstName || ''} {employee.lastName || ''}
                          </p>
                          <p className="text-xs text-gray-500">{employee.user?.employeeId || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {employee.department?.departmentName || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {employee.designation?.designationName || '-'}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {employee.salary
                        ? formatCurrency(employee.salary.basicSalary)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-green-600">
                      {employee.salary ? formatCurrency(calculateNetSalary(employee)) : '-'}
                    </TableCell>
                    <TableCell>
                      {employee.salary ? (
                        <Badge className="bg-green-100 text-green-700">Configured</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSalary(employee)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {employee.salary ? 'Edit' : 'Setup'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Salary Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee?.salary ? 'Edit' : 'Setup'} Salary Structure
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee && (
                <>
                  {selectedEmployee.firstName || ''} {selectedEmployee.lastName || ''} (
                  {selectedEmployee.user?.employeeId || ''})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Earnings */}
            <div>
              <h3 className="text-sm font-medium text-green-600 mb-3">Earnings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">Basic Salary *</Label>
                  <Input
                    id="basicSalary"
                    type="number"
                    value={salaryData.basicSalary}
                    onChange={(e) =>
                      setSalaryData({ ...salaryData, basicSalary: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hra">House Rent Allowance</Label>
                  <Input
                    id="hra"
                    type="number"
                    value={salaryData.houseRentAllowance}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        houseRentAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conveyance">Conveyance Allowance</Label>
                  <Input
                    id="conveyance"
                    type="number"
                    value={salaryData.conveyanceAllowance}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        conveyanceAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical">Medical Allowance</Label>
                  <Input
                    id="medical"
                    type="number"
                    value={salaryData.medicalAllowance}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        medicalAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="special">Special Allowance</Label>
                  <Input
                    id="special"
                    type="number"
                    value={salaryData.specialAllowance}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        specialAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Deductions */}
            <div>
              <h3 className="text-sm font-medium text-red-600 mb-3">Deductions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pf">Provident Fund</Label>
                  <Input
                    id="pf"
                    type="number"
                    value={salaryData.providentFund}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        providentFund: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pt">Professional Tax</Label>
                  <Input
                    id="pt"
                    type="number"
                    value={salaryData.professionalTax}
                    onChange={(e) =>
                      setSalaryData({
                        ...salaryData,
                        professionalTax: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Income Tax (TDS)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={salaryData.incomeTax}
                    onChange={(e) =>
                      setSalaryData({ ...salaryData, incomeTax: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveFrom">Effective From</Label>
                  <Input
                    id="effectiveFrom"
                    type="date"
                    value={salaryData.effectiveFrom}
                    onChange={(e) =>
                      setSalaryData({ ...salaryData, effectiveFrom: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Salary:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(
                    salaryData.basicSalary +
                      salaryData.houseRentAllowance +
                      salaryData.conveyanceAllowance +
                      salaryData.medicalAllowance +
                      salaryData.specialAllowance -
                      salaryData.providentFund -
                      salaryData.professionalTax -
                      salaryData.incomeTax
                  )}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={upsertSalary.isPending}>
              {upsertSalary.isPending ? 'Saving...' : 'Save Salary Structure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPayrollPage() {
  return (
    <RoleGuard allowedRoles={['WEBSITE_ADMIN', 'COMPANY_ADMIN', 'HR']}>
      <AdminPayrollContent />
    </RoleGuard>
  );
}
