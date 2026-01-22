import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '../../components/common/Table/Table';
import { Badge } from '../../components/common/Badge/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { User } from '../../types';
import { apiService } from '../../services/api.service';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@telangana.gov.in',
          role: 'admin' as any,
          isActive: true,
          department: 'IT Department',
          lastLoginAt: new Date('2024-01-15'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          designation: '',
          permissions: []
        },
        {
          id: '2',
          name: 'Content Editor',
          email: 'editor@telangana.gov.in',
          role: 'editor' as any,
          isActive: true,
          department: 'Information Department',
          lastLoginAt: new Date('2024-01-14'),
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-14'),
          designation: '',
          permissions: []
        },
        {
          id: '3',
          name: 'Viewer User',
          email: 'viewer@telangana.gov.in',
          role: 'viewer' as any,
          isActive: false,
          department: 'General Administration',
          designation: 'Assistant',
          lastLoginAt: new Date('2024-01-10'),
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-10'),
          permissions: []
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'default'> = {
      admin: 'danger',
      editor: 'warning',
      viewer: 'default',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'success' : 'default'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage system users and their permissions
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Department</TableHeaderCell>
              <TableHeaderCell>Last Login</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-telangana-primary rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-sm">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                <TableCell>
                  <div>
                    <div className="text-gray-900">{user.department}</div>
                    <div className="text-gray-500 text-sm">{user.designation}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-900">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    
    </div>
  );
};