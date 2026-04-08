// ============================================
// pages/transportation/AddVehicleForm.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Save, X, Upload, Calendar, AlertCircle, CheckCircle
} from 'lucide-react';

interface VehicleFormData {
  vehicleNo: string;
  vehicleType: string;
  capacity: string;
  manufacturer: string;
  model: string;
  yearOfManufacture: string;
  ownerId: string;
  ownerName: string;
  driverName: string;
  driverPhone: string;
  driverLicenseNo: string;
  registrationDate: string;
  insuranceProvider: string;
  insuranceNo: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
  rcBookNo: string;
  chassisNo: string;
  engineNo: string;
  fuelType: string;
  status: string;
}

export const AddVehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNo: '',
    vehicleType: '',
    capacity: '',
    manufacturer: '',
    model: '',
    yearOfManufacture: '',
    ownerId: '',
    ownerName: '',
    driverName: '',
    driverPhone: '',
    driverLicenseNo: '',
    registrationDate: '',
    insuranceProvider: '',
    insuranceNo: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    pollutionExpiry: '',
    rcBookNo: '',
    chassisNo: '',
    engineNo: '',
    fuelType: 'Diesel',
    status: 'Active'
  });

  const vehicleTypes = ['Truck', 'Mini Truck', 'Heavy Truck', 'Trailer', 'Container'];
  const fuelTypes = ['Diesel', 'Petrol', 'CNG', 'Electric'];
  const statusOptions = ['Active', 'Inactive', 'Maintenance'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleNo.trim()) newErrors.vehicleNo = 'Vehicle number is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.capacity.trim()) newErrors.capacity = 'Capacity is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!formData.driverPhone.trim()) newErrors.driverPhone = 'Driver phone is required';
    if (!formData.registrationDate) newErrors.registrationDate = 'Registration date is required';
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry is required';
    if (!formData.fitnessExpiry) newErrors.fitnessExpiry = 'Fitness expiry is required';

    // Validate phone number
    if (formData.driverPhone && !/^[6-9]\d{9}$/.test(formData.driverPhone)) {
      newErrors.driverPhone = 'Invalid phone number';
    }

    // Validate vehicle number format (basic)
    if (formData.vehicleNo && !/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(formData.vehicleNo.replace(/[- ]/g, ''))) {
      newErrors.vehicleNo = 'Invalid vehicle number format (e.g., AP16TY0677)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form submitted:', formData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/transportation/vehicles');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/transportation/vehicles');
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-slide-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Vehicle Added Successfully!</p>
              <p className="text-sm text-green-700">Redirecting to vehicles list...</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-600" />
            Add New Vehicle
          </h1>
          <p className="text-gray-500 mt-1">Register a new vehicle in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Details Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Vehicle Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleChange}
                placeholder="AP16TY0677"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.vehicleNo 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.vehicleNo && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.vehicleNo}
                </p>
              )}
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.vehicleType 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select Type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.vehicleType && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.vehicleType}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity (in Tons) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="10"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.capacity 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.capacity}
                </p>
              )}
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Tata Motors"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="LPT 1613"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Year of Manufacture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Manufacture
              </label>
              <input
                type="text"
                name="yearOfManufacture"
                value={formData.yearOfManufacture}
                onChange={handleChange}
                placeholder="2020"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fuelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Chassis Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chassis Number
              </label>
              <input
                type="text"
                name="chassisNo"
                value={formData.chassisNo}
                onChange={handleChange}
                placeholder="MAT123456789012345"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Engine Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engine Number
              </label>
              <input
                type="text"
                name="engineNo"
                value={formData.engineNo}
                onChange={handleChange}
                placeholder="ENG123456789"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Owner & Driver Details Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Owner & Driver Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner/Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="M/s New Lorry Owners Association"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.ownerName 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.ownerName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.ownerName}
                </p>
              )}
            </div>

            {/* Driver Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="Rajesh Kumar"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.driverName 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.driverName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.driverName}
                </p>
              )}
            </div>

            {/* Driver Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="driverPhone"
                value={formData.driverPhone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.driverPhone 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.driverPhone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.driverPhone}
                </p>
              )}
            </div>

            {/* Driver License */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver License Number
              </label>
              <input
                type="text"
                name="driverLicenseNo"
                value={formData.driverLicenseNo}
                onChange={handleChange}
                placeholder="AP1234567890123"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Registration & Compliance Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Registration & Compliance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Registration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.registrationDate 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.registrationDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.registrationDate}
                </p>
              )}
            </div>

            {/* RC Book Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RC Book Number
              </label>
              <input
                type="text"
                name="rcBookNo"
                value={formData.rcBookNo}
                onChange={handleChange}
                placeholder="RC123456789"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Insurance Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider
              </label>
              <input
                type="text"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleChange}
                placeholder="ICICI Lombard"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Insurance Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Policy Number
              </label>
              <input
                type="text"
                name="insuranceNo"
                value={formData.insuranceNo}
                onChange={handleChange}
                placeholder="INS123456789"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Insurance Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.insuranceExpiry 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.insuranceExpiry && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.insuranceExpiry}
                </p>
              )}
            </div>

            {/* Fitness Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Certificate Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fitnessExpiry"
                value={formData.fitnessExpiry}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.fitnessExpiry 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.fitnessExpiry && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fitnessExpiry}
                </p>
              )}
            </div>

            {/* Pollution Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pollution Certificate Expiry
              </label>
              <input
                type="date"
                name="pollutionExpiry"
                value={formData.pollutionExpiry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicleForm;