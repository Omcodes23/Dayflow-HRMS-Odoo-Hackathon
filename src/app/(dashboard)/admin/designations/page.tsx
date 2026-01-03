'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function DesignationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<any>(null);
  const [formData, setFormData] = useState({
    designationName: '',
    description: '',
  });

  const utils = trpc.useUtils();
  const { data: designations, isLoading } = trpc.employee.getDesignations.useQuery();

  const createMutation = trpc.employee.createDesignation.useMutation({
    onSuccess: () => {
      toast.success('Designation created successfully');
      setIsCreateOpen(false);
      setFormData({ designationName: '', description: '' });
      utils.employee.getDesignations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create designation');
    },
  });

  const updateMutation = trpc.employee.updateDesignation.useMutation({
    onSuccess: () => {
      toast.success('Designation updated successfully');
      setIsEditOpen(false);
      setSelectedDesignation(null);
      setFormData({ designationName: '', description: '' });
      utils.employee.getDesignations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update designation');
    },
  });

  const deleteMutation = trpc.employee.deleteDesignation.useMutation({
    onSuccess: () => {
      toast.success('Designation deleted successfully');
      utils.employee.getDesignations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete designation');
    },
  });

  const handleCreate = () => {
    if (!formData.designationName.trim()) {
      toast.error('Designation name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (designation: any) => {
    setSelectedDesignation(designation);
    setFormData({
      designationName: designation.designationName,
      description: designation.description || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.designationName.trim()) {
      toast.error('Designation name is required');
      return;
    }
    updateMutation.mutate({
      id: selectedDesignation.id,
      ...formData,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this designation?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <RoleGuard allowedRoles={['HR', 'COMPANY_ADMIN']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Designations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage employee designations and roles
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Create New Designation</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Add a new designation for your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-white">Designation Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.designationName}
                    onChange={(e) =>
                      setFormData({ ...formData, designationName: e.target.value })
                    }
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-900 dark:text-white">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role and responsibilities..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="bg-white dark:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              All Designations
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {designations?.length || 0} designations in total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading designations...</div>
            ) : designations && designations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">Designation Name</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Description</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Employees</TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designations.map((designation) => (
                    <TableRow key={designation.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {designation.designationName}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {designation.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                          {designation._count?.employees || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(designation)}
                            className="text-gray-900 dark:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(designation.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No designations found. Create your first designation to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit Designation</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Update designation details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-900 dark:text-white">Designation Name</Label>
                <Input
                  id="edit-name"
                  value={formData.designationName}
                  onChange={(e) =>
                    setFormData({ ...formData, designationName: e.target.value })
                  }
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-gray-900 dark:text-white">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="bg-white dark:bg-gray-800"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
