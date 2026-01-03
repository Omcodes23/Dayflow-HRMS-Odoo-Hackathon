'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { format } from 'date-fns';

export default function PayrollPage() {
  const { data: salary, isLoading, error } = trpc.payroll.getMySalary.useQuery(undefined, {
    retry: false,
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500">View your salary details</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500">View your salary details</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No salary information available yet</p>
            <p className="text-sm text-gray-400">Contact HR for assistance</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the pre-calculated values from the server
  const { grossSalary, totalDeductions, netSalary } = salary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="text-gray-500">View your salary details and structure</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Salary</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(netSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gross Salary</p>
                <p className="text-xl font-bold">{formatCurrency(grossSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Basic Salary</p>
                <p className="text-xl font-bold">{formatCurrency(salary.basicSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Deductions</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Earnings</CardTitle>
            <CardDescription>Monthly salary components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">{formatCurrency(salary.basicSalary)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">House Rent Allowance (HRA)</span>
                <span className="font-medium">{formatCurrency(salary.hra)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transport Allowance</span>
                <span className="font-medium">{formatCurrency(salary.transportAllowance)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Medical Allowance</span>
                <span className="font-medium">{formatCurrency(salary.medicalAllowance)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Special Allowance</span>
                <span className="font-medium">{formatCurrency(salary.specialAllowance)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-green-600">Total Earnings</span>
                <span className="font-bold text-green-600">{formatCurrency(grossSalary)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Deductions</CardTitle>
            <CardDescription>Monthly deductions from salary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Provident Fund (PF)</span>
                <span className="font-medium">{formatCurrency(salary.providentFund)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Professional Tax</span>
                <span className="font-medium">{formatCurrency(salary.professionalTax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Income Tax (TDS)</span>
                <span className="font-medium">{formatCurrency(salary.incomeTax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-red-600">Total Deductions</span>
                <span className="font-bold text-red-600">{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Pay */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100">Net Take Home</p>
              <p className="text-3xl font-bold">{formatCurrency(netSalary)}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Monthly
              </Badge>
              <p className="text-sm text-blue-100 mt-2">
                Effective: {format(new Date(salary.effectiveFrom), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
