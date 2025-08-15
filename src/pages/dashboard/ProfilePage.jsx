import React, { useState, useRef } from 'react';
import { AppLayout } from '../../components/layout';
import { useApp, ActionTypes } from '../../context/AppContext';
import { Card } from '../../components/common';
import toast from '../../utils/toast';
import apiService from '../../services/api';

const ProfilePage = () => {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Use real user data from state
  const userData = state.auth.user || {};
  const userProfile = userData.profile_json || {};
  
  // Initialize profile picture from user data
  const [profilePicture, setProfilePicture] = useState(userData.avatar_url || null);
  
  // Initialize profile with real user data or empty values
  const [profile, setProfile] = useState({
    personal: {
      firstName: userData.name?.split(' ')[0] || userProfile.name?.split(' ')[0] || '',
      lastName: userData.name?.split(' ')[1] || userProfile.name?.split(' ')[1] || '',
      email: userData.email || '',
      phone: userData.phone || userProfile.phone || '',
      dateOfBirth: userData.date_of_birth || userProfile.date_of_birth || '',
      gender: userData.sex || userProfile.sex || ''
    },
    medical: {
      bloodType: userProfile.blood_type || '',
      height: userProfile.height || '',
      weight: userProfile.weight || '',
      allergies: userProfile.allergies || '',
      medications: userProfile.current_medications || '',
      conditions: userProfile.medical_conditions || ''
    },
    emergency: {
      contactName: userProfile.emergency_contact_name || '',
      contactPhone: userProfile.emergency_contact_phone || '',
      relationship: userProfile.emergency_contact_relationship || '',
      physicianName: userProfile.primary_physician_name || '',
      physicianPhone: userProfile.primary_physician_phone || ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    // Validation
    if (!editedProfile.personal.firstName || !editedProfile.personal.lastName) {
      toast.error('First name and last name are required');
      return;
    }
    
    if (editedProfile.personal.email && !isValidEmail(editedProfile.personal.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (editedProfile.personal.phone && !isValidPhone(editedProfile.personal.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    if (editedProfile.medical.height && isNaN(editedProfile.medical.height)) {
      toast.error('Height must be a number');
      return;
    }
    
    if (editedProfile.medical.weight && isNaN(editedProfile.medical.weight)) {
      toast.error('Weight must be a number');
      return;
    }
    
    try {
      // Prepare profile data for API - only email and profile_json are accepted
      const profileData = {
        email: editedProfile.personal.email || null,
        profile_json: {
          name: `${editedProfile.personal.firstName} ${editedProfile.personal.lastName}`.trim() || null,
          phone: editedProfile.personal.phone || null,
          date_of_birth: editedProfile.personal.dateOfBirth || null,
          sex: editedProfile.personal.gender || null,
          blood_type: editedProfile.medical.bloodType || null,
          height: editedProfile.medical.height ? parseFloat(editedProfile.medical.height) : null,
          weight: editedProfile.medical.weight ? parseFloat(editedProfile.medical.weight) : null,
          allergies: editedProfile.medical.allergies || null,
          current_medications: editedProfile.medical.medications || null,
          medical_conditions: editedProfile.medical.conditions || null,
          emergency_contact_name: editedProfile.emergency.contactName || null,
          emergency_contact_phone: editedProfile.emergency.contactPhone || null,
          emergency_contact_relationship: editedProfile.emergency.relationship || null,
          primary_physician_name: editedProfile.emergency.physicianName || null,
          primary_physician_phone: editedProfile.emergency.physicianPhone || null
        }
      };
      
      // Call API to save profile
      const updatedUser = await apiService.updateProfile(profileData);
      
      // Update local state
      setProfile(editedProfile);
      setIsEditing(false);
      
      // Update global user state
      dispatch({
        type: ActionTypes.SET_USER,
        payload: updatedUser
      });
      
      // Show success notification
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Show error notification
      toast.error(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file); // Store the file for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
      };
      reader.readAsDataURL(file);
      // Show that picture needs to be saved
      toast.info('Click "Save Picture" to upload your new profile photo');
    }
  };

  const handleSavePicture = async () => {
    if (!uploadedFile) {
      toast.error('Please select a picture first');
      return;
    }

    // Check file size (5MB limit)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      toast.error('Please upload a JPG, PNG, or GIF file');
      return;
    }

    try {
      const response = await apiService.uploadAvatar(uploadedFile);
      toast.success('Profile picture uploaded successfully!');
      setUploadedFile(null); // Clear the pending upload
      
      // Update user avatar URL if returned
      if (response.avatar_url) {
        setProfilePicture(response.avatar_url);
        dispatch({
          type: ActionTypes.UPDATE_USER_AVATAR,
          payload: response.avatar_url
        });
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload picture. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setProfilePicture(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Validation helpers
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPhone = (phone) => {
    // Remove all non-digits and check if it's 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(section, field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
            {...(field === 'phone' && { pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}', placeholder: '123-456-7890' })}
            {...(field === 'height' && { type: 'number', min: '0', max: '300', placeholder: 'Height in cm' })}
            {...(field === 'weight' && { type: 'number', min: '0', max: '500', placeholder: 'Weight in kg' })}
          />
        </div>
      );
    }

    return (
      <div key={field} className="flex justify-between py-2">
        <span className="text-sm font-medium text-gray-600">
          {label}:
        </span>
        <span className="text-sm text-gray-900">
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
            <h1 className="text-3xl font-bold text-black mb-2">
              Profile
            </h1>
            <p className="text-gray-600 font-medium">
              Manage your personal and medical information
            </p>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <span className="text-3xl font-bold text-gray-600">
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
                >
                  Choose Photo
                </button>
                {uploadedFile && (
                  <button
                    onClick={handleSavePicture}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Save Picture
                  </button>
                )}
                {profilePicture && (
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
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