import { describe, it, expect, vi } from 'vitest';
import * as employeeController from '../../../backend/src/modules/users/employee.controller.js';
import { employeeService } from '../../../backend/src/modules/users/employee.service.js';

vi.mock('../../../backend/src/config/db.js', () => ({ logAudit: vi.fn() }));
vi.mock('../../../backend/src/sockets/index.js', () => ({ emitToOrg: vi.fn(), SOCKET_EVENTS: {} }));

describe('Employee Controller - IDOR & BOLA Prevention', () => {
  it('blocks EMPLOYEE from updating another user profile', async () => {
    const req: any = {
      user: { id: 'emp-101', role: 'EMPLOYEE', organizationId: 'org-1' },
      params: { id: 'emp-999' },
      body: { name: 'Hacked Name' }
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await employeeController.updateEmployee(req, res);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden: You can only update your own profile.' });
  });

  it('allows EMPLOYEE to update their own avatar and location', async () => {
    const req: any = {
      user: { id: 'emp-101', role: 'EMPLOYEE', organizationId: 'org-1' },
      params: { id: 'emp-101' },
      body: { avatar: 'new-pic.png', location: 'Remote', role: 'ADMIN' } // Attempt to elevate role
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.spyOn(employeeService, 'getEmployeeById').mockResolvedValue({ id: 'emp-101', avatar: 'old.png', location: 'Office' } as any);
    vi.spyOn(employeeService, 'updateEmployee').mockResolvedValue({ id: 'emp-101', avatar: 'new-pic.png', location: 'Remote' } as any);

    await employeeController.updateEmployee(req, res);
    
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'emp-101', avatar: 'new-pic.png', location: 'Remote' } });
    // Verify that role elevation was stripped and only avatar/location passed
    expect(employeeService.updateEmployee).toHaveBeenCalledWith('emp-101', 'org-1', { avatar: 'new-pic.png', location: 'Remote' });
  });

  it('allows HR to update another employee profile structural fields', async () => {
    const req: any = {
      user: { id: 'hr-1', role: 'HR', organizationId: 'org-1' },
      params: { id: 'emp-999' },
      body: { department: 'Sales', performanceScore: 98 }
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.spyOn(employeeService, 'getEmployeeById').mockResolvedValue({ id: 'emp-999', department: 'IT', performanceScore: 80 } as any);
    vi.spyOn(employeeService, 'updateEmployee').mockResolvedValue({ id: 'emp-999', department: 'Sales', performanceScore: 98 } as any);

    await employeeController.updateEmployee(req, res);
    
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'emp-999', department: 'Sales', performanceScore: 98 } });
    expect(employeeService.updateEmployee).toHaveBeenCalledWith('emp-999', 'org-1', { department: 'Sales', performanceScore: 98 });
  });
});
