
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import AccessManagement from './AccessManagement';
import { useAuth } from '@/contexts/AuthContext';

// Mock the Auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AccessManagement Page', () => {
  const mockAddUser = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock the navigate function
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
    
    // Set up auth context mock
    (useAuth as any).mockReturnValue({
      isAdmin: true,
      isAuthenticated: true,
      addUser: mockAddUser,
      updateUser: mockUpdateUser,
      users: [
        {
          id: '1',
          name: 'Test Admin',
          email: 'admin@example.com',
          role: 'administrator',
          campaigns: ['1', '2']
        },
        {
          id: '2',
          name: 'Test User',
          email: 'user@example.com',
          role: 'campaigner',
          campaigns: ['1']
        }
      ]
    });
  });
  
  test('renders access management page for admins', async () => {
    render(<AccessManagement />);
    
    // Check that the page renders key elements
    await waitFor(() => {
      expect(screen.getByText(/Manage Access/i)).toBeInTheDocument();
      expect(screen.getByText(/User Management/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });
  });
  
  test('displays user table with user data', async () => {
    render(<AccessManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Admin/i)).toBeInTheDocument();
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
    });
  });
  
  test('can open add user dialog and add a new user', async () => {
    const user = userEvent.setup();
    render(<AccessManagement />);
    
    // Click the Add User button
    const addButton = screen.getByRole('button', { name: /Add User/i });
    await user.click(addButton);
    
    // Fill in the form
    await waitFor(() => {
      expect(screen.getByText(/Add New User/i)).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/Full Name/i), 'New Test User');
    await user.type(screen.getByLabelText(/Email Address/i), 'newuser@example.com');
    
    // Select role
    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    await user.click(screen.getByText(/Campaigner/i));
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Add User/i }));
    
    // Check that addUser was called with the right params
    await waitFor(() => {
      expect(mockAddUser).toHaveBeenCalledWith({
        name: 'New Test User',
        email: 'newuser@example.com',
        role: 'campaigner',
        campaigns: []
      });
    });
  });
  
  test('can view user details', async () => {
    const user = userEvent.setup();
    render(<AccessManagement />);
    
    // Find the view button for a user
    const viewButtons = screen.getAllByLabelText(/View/i);
    await user.click(viewButtons[0]); // Click first view button
    
    // Check that the user details dialog appears
    await waitFor(() => {
      expect(screen.getByText(/User Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Admin/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
    });
  });
  
  test('redirects non-admin users', async () => {
    // Mock auth to return non-admin user
    (useAuth as any).mockReturnValue({
      isAdmin: false,
      isAuthenticated: true
    });
    
    render(<AccessManagement />);
    
    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
