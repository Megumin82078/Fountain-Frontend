import React, { useState, useRef } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common';

const ProfilePage = () => {
  const { state } = useApp();
  const fileInputRef = useRef(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profile, setProfile] = useState({
    personal: {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@fountain.health',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-01',
      gender: 'male'
    },
    medical: {
      bloodType: 'O+',
      height: '5\'10"',
      weight: '175 lbs',
      allergies: 'Penicillin, Shellfish',
      medications: 'Lisinopril 10mg daily',
      conditions: 'Hypertension'
    },
    emergency: {
      contactName: 'Jane User',
      contactPhone: '+1 (555) 987-6543',
      relationship: 'Spouse',
      physicianName: 'Dr. Smith',
      physicianPhone: '+1 (555) 456-7890'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (section, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderField = (section, field, label, type = 'text') => {
    const value = isEditing ? editedProfile[section][field] : profile[section][field];
    
    if (isEditing) {
      if (type === 'select') {
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: 'var(--font-body)'}}>
              {label}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(section, field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              style={{fontFamily: 'var(--font-body)'}}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        );
      }
      
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1" style={{fontFamily: 'var(--font-body)'}}>
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            style={{fontFamily: 'var(--font-body)'}}
          />
        </div>
      );
    }

    return (
      <div key={field} className="flex justify-between py-2">
        <span className="text-sm font-medium text-gray-600" style={{fontFamily: 'var(--font-body)'}}>
          {label}:
        </span>
        <span className="text-sm text-gray-900" style={{fontFamily: 'var(--font-body)'}}>
          {value || 'Not specified'}
        </span>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="content-container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2" style={{fontFamily: 'var(--font-display)'}}>
              Profile
            </h1>
            <p className="text-gray-600 font-medium" style={{fontFamily: 'var(--font-body)'}}>
              Manage your personal and medical information
            </p>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                style={{fontFamily: 'var(--font-body)'}}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Picture Section - Full Width */}
          <Card title="Profile Picture">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-600" style={{fontFamily: 'var(--font-body)'}}>
                      {profile.personal.firstName?.charAt(0)}{profile.personal.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleUploadClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleUploadClick}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  Upload Photo
                </button>
                {profilePicture && (
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    style={{fontFamily: 'var(--font-body)'}}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500" style={{fontFamily: 'var(--font-body)'}}>
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </Card>

          {/* Information Sections in aligned grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <Card title="Personal Information" className="h-full">
              <div className={isEditing ? 'space-y-4' : 'space-y-1'}>
                {renderField('personal', 'firstName', 'First Name')}
                {renderField('personal', 'lastName', 'Last Name')}
                {renderField('personal', 'email', 'Email', 'email')}
                {renderField('personal', 'phone', 'Phone Number', 'tel')}
                {renderField('personal', 'dateOfBirth', 'Date of Birth', 'date')}
                {renderField('personal', 'gender', 'Gender', 'select')}
              </div>
            </Card>

            {/* Medical Information */}
            <Card title="Medical Information" className="h-full">
              <div className={isEditing ? 'space-y-4' : 'space-y-1'}>
                {renderField('medical', 'bloodType', 'Blood Type')}
                {renderField('medical', 'height', 'Height')}
                {renderField('medical', 'weight', 'Weight')}
                {renderField('medical', 'allergies', 'Allergies')}
                {renderField('medical', 'medications', 'Current Medications')}
                {renderField('medical', 'conditions', 'Medical Conditions')}
              </div>
            </Card>

            {/* Emergency Contacts */}
            <Card title="Emergency Contact" className="h-full">
              <div className={isEditing ? 'space-y-4' : 'space-y-1'}>
                {renderField('emergency', 'contactName', 'Contact Name')}
                {renderField('emergency', 'contactPhone', 'Contact Phone', 'tel')}
                {renderField('emergency', 'relationship', 'Relationship')}
                {renderField('emergency', 'physicianName', 'Primary Physician')}
                {renderField('emergency', 'physicianPhone', 'Physician Phone', 'tel')}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;