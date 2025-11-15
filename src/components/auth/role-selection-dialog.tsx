import { useState } from 'react';
import { GraduationCap, Building2, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type UserRole = 'student' | 'bachelor' | 'global_education_center';

type RoleSelectionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: UserRole) => void;
};

export const RoleSelectionDialog = ({ isOpen, onClose, onRoleSelect }: RoleSelectionDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      description: 'I am looking for scholarships',
      icon: GraduationCap,
      color: 'blue',
    },
    {
      id: 'bachelor' as UserRole,
      title: 'Bachelor',
      description: 'I am interested in finding Master or Phd scholarship',
      icon: Building2,
      color: 'purple',
    },
    {
      id: 'global_education_center' as UserRole,
      title: 'Global Education Center',
      description: 'I represent an education center',
      icon: Globe,
      color: 'green',
    },
  ];

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleAccept = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Who are you?</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="space-y-4 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className={cn(
                    'w-full p-5 rounded-lg border-2 transition-all',
                    'hover:border-purple-500 hover:shadow-md',
                    'flex items-center gap-4 text-left',
                    selectedRole === role.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0',
                    role.color === 'blue' && 'bg-blue-100',
                    role.color === 'purple' && 'bg-purple-100',
                    role.color === 'green' && 'bg-green-100'
                  )}>
                    <Icon className={cn(
                      'w-7 h-7',
                      role.color === 'blue' && 'text-blue-600',
                      role.color === 'purple' && 'text-purple-600',
                      role.color === 'green' && 'text-green-600'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-gray-900 mb-1">{role.title}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <Button
            onClick={handleAccept}
            disabled={!selectedRole}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
