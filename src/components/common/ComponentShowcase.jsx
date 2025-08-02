import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  StatCard,
  HealthCard,
  Modal,
  ConfirmModal,
  Alert,
  Toast,
  LoadingSpinner,
  Skeleton,
  Table,
  Badge,
  HealthStatusBadge,
  PriorityBadge,
  RequestStatusBadge,
  Tabs,
  TabPanel
} from './index';

const ComponentShowcase = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectValue, setSelectValue] = useState(null);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', role: 'User' }
  ];

  const tableColumns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { 
      key: 'status', 
      title: 'Status', 
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'error'} pill>
          {value}
        </Badge>
      )
    },
    { key: 'role', title: 'Role' }
  ];

  const tabs = [
    {
      key: 'components',
      label: 'Components',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5zM21 15a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2z" />
        </svg>
      ),
      content: (
        <TabPanel>
          <div className="space-y-8">
            {/* Buttons */}
            <Card title="Buttons" className="p-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </Card>

            {/* Inputs */}
            <Card title="Inputs & Selects" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  helperText="We'll never share your email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  error="Password is required"
                />
                <Select
                  label="Select Option"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Choose an option..."
                />
                <Select
                  label="Multiple Select"
                  options={selectOptions}
                  multiple
                  searchable
                  placeholder="Choose multiple options..."
                />
              </div>
            </Card>

            {/* Badges */}
            <Card title="Badges" className="p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary-solid">Primary Solid</Badge>
                  <Badge variant="success-solid">Success Solid</Badge>
                  <Badge variant="warning-solid">Warning Solid</Badge>
                  <Badge variant="error-solid">Error Solid</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <HealthStatusBadge status="normal" />
                  <HealthStatusBadge status="abnormal" />
                  <HealthStatusBadge status="warning" />
                  <HealthStatusBadge status="pending" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <PriorityBadge priority="low" />
                  <PriorityBadge priority="medium" />
                  <PriorityBadge priority="high" />
                  <PriorityBadge priority="critical" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <RequestStatusBadge status="pending" />
                  <RequestStatusBadge status="in_progress" />
                  <RequestStatusBadge status="completed" />
                  <RequestStatusBadge status="failed" />
                </div>
              </div>
            </Card>

            {/* Alerts */}
            <Card title="Alerts" className="p-6">
              <div className="space-y-4">
                <Alert variant="success" title="Success!" dismissible>
                  This is a success alert with a title.
                </Alert>
                <Alert variant="error" title="Error!">
                  This is an error alert that cannot be dismissed.
                </Alert>
                <Alert variant="warning">
                  This is a warning alert without a title.
                </Alert>
                <Alert variant="info" title="Information">
                  This is an info alert with some information.
                </Alert>
              </div>
            </Card>

            {/* Modals */}
            <Card title="Modals" className="p-6">
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setShowModal(true)}>Show Modal</Button>
                <Button onClick={() => setShowConfirmModal(true)} variant="danger">
                  Show Confirm Modal
                </Button>
                <Button onClick={() => setShowToast(true)} variant="success">
                  Show Toast
                </Button>
              </div>
            </Card>

            {/* Loading States */}
            <Card title="Loading States" className="p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <LoadingSpinner size="xs" />
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                  <LoadingSpinner size="xl" />
                </div>

                <div className="space-y-2">
                  <Skeleton width="full" height="4" />
                  <Skeleton width="3/4" height="4" />
                  <Skeleton width="1/2" height="4" />
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>
      )
    },
    {
      key: 'cards',
      label: 'Cards',
      badge: '3',
      content: (
        <TabPanel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value="1,234"
              change="+12.5%"
              changeType="positive"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="Revenue"
              value="$45.6K"
              change="-2.3%"
              changeType="negative"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />

            <HealthCard
              category="Blood Pressure"
              value="120/80"
              unit="mmHg"
              status="normal"
              date="2 hours ago"
              trend={-2.5}
            />

            <HealthCard
              category="Cholesterol"
              value="240"
              unit="mg/dL"
              status="abnormal"
              date="1 week ago"
              trend={5.2}
            />

            <HealthCard
              category="Blood Sugar"
              value="95"
              unit="mg/dL"
              status="normal"
              date="3 days ago"
              trend={0}
            />

            <HealthCard
              category="Heart Rate"
              value="72"
              unit="bpm"
              status="normal"
              date="1 hour ago"
              trend={-1.8}
            />
          </div>
        </TabPanel>
      )
    },
    {
      key: 'table',
      label: 'Table',
      content: (
        <TabPanel>
          <Card className="p-6">
            <Table
              data={tableData}
              columns={tableColumns}
              selectable
              emptyMessage="No users found"
            />
          </Card>
        </TabPanel>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Premium Component Library
          </h1>
          <p className="text-neutral-600">
            A showcase of all premium UI components with luxury design principles
          </p>
        </div>

        <Tabs tabs={tabs} variant="pills" />

        {/* Modals */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Example Modal"
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowModal(false)}>
                Save Changes
              </Button>
            </div>
          }
        >
          <p className="text-neutral-600">
            This is an example modal with a header, body content, and footer actions.
            You can customize the size, behavior, and styling as needed.
          </p>
        </Modal>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setTimeout(() => setShowConfirmModal(false), 1000);
          }}
          title="Confirm Deletion"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />

        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50">
            <Toast
              variant="success"
              title="Success!"
              message="Your action was completed successfully."
              onClose={() => setShowToast(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentShowcase;