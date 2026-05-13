'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Search, CheckCircle, Info, Laptop, Key, Wallet, Shirt, CreditCard, ShoppingBag, BookOpen, Package, MapPin, Calendar, Upload, X } from 'lucide-react';
import { supabaseClient } from '@/utils/supabaseClient';
import Link from 'next/link';

interface ReportWizardClientProps {
  userId: string;
}

const categories = [
  { id: 'electronics', name: 'Electronics', icon: Laptop },
  { id: 'keys', name: 'Keys', icon: Key },
  { id: 'wallets', name: 'Wallets', icon: Wallet },
  { id: 'bags', name: 'Bags', icon: ShoppingBag },
  { id: 'phones', name: 'Phones', icon: Laptop },
  { id: 'jewelry', name: 'Jewelry', icon: Package },
  { id: 'documents', name: 'Documents', icon: BookOpen },
  { id: 'clothing', name: 'Clothing', icon: Shirt },
  { id: 'accessories', name: 'Accessories', icon: Package },
  { id: 'other', name: 'Other', icon: Package },
] as const;

const campusLocations = [
  { id: 'library', name: 'University Main Library' },
  { id: 'cafeteria', name: 'Student Center Cafeteria' },
  { id: 'science-building', name: 'Science Building' },
  { id: 'engineering-complex', name: 'Engineering Complex' },
  { id: 'student-center', name: 'Student Center' },
  { id: 'auditorium', name: 'University Auditorium' },
  { id: 'sports-complex', name: 'Sports Complex' },
  { id: 'parking-north', name: 'North Campus Parking Lot' },
  { id: 'parking-south', name: 'South Campus Parking Lot' },
  { id: 'shuttle-stop', name: 'Campus Shuttle Stop' },
  { id: 'admin-building', name: 'Administration Building' },
  { id: 'health-center', name: 'Health Center' },
  { id: 'other', name: 'Other' },
] as const;

const steps = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Review' },
] as const;

export default function ReportWizardClient({ userId }: ReportWizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    category: '',
    name: '',
    description: '',
    location: '',
    date: '',
    image: null as File | null,
  });
  const [error, setError] = useState('');

  const updateForm = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.category) {
        return 'Please select a category';
      }
    }
    if (step === 2) {
      if (!formData.name.trim()) {
        return 'Please enter an item name';
      }
    }
    if (step === 3) {
      if (!formData.location) {
        return 'Please select a location';
      }
      if (!formData.date) {
        return 'Please select a date';
      }
    }
    return '';
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      let imageUrl = null;
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabaseClient.storage
          .from('item-images')
          .upload(fileName, formData.image);

        if (!uploadError) {
          const { data: { publicUrl } } = supabaseClient.storage
            .from('item-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      console.log('Submitting report:', {
        reporter_id: userId,
        type: formData.type,
        category: formData.category,
        title: formData.name,
        description: formData.description,
        location: formData.location,
        date_lost: formData.date,
        image_url: imageUrl,
      });

      const { error: insertError } = await supabaseClient.from('items').insert({
        reporter_id: userId,
        type: formData.type,
        category_id: formData.category,
        title: formData.name,
        description: formData.description,
        description_public: formData.description,
        location_id: formData.location,
        date_lost: formData.date || null,
        image_url: imageUrl,
        status: 'active',
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      router.push(formData.type === 'found' ? '/found-items' : '/lost-items');
    } catch (err) {
      console.error('Report submission failed:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate image preview URL
  const imagePreviewUrl = formData.image ? URL.createObjectURL(formData.image) : null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-20">
        {/* Vertical Progress Stepper - Left Side */}
        <div className="flex flex-col justify-center items-center py-4">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s.id === step
                      ? 'bg-[#2563EB] text-white shadow-md ring-2 ring-[#2563EB]/20'
                      : s.id < step
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {s.id < step ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    s.id === step ? 'text-[#2563EB]' : s.id < step ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-0.5 h-16 my-1 ${
                    s.id < step ? 'bg-[#2563EB]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Content - Right Side */}
        <div className="flex-1">
          {/* Step Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 && 'What are you reporting?'}
              {step === 2 && 'Item Details'}
              {step === 3 && 'Location & Time'}
              {step === 4 && 'Review & Submit'}
            </h1>
            <p className="text-gray-500">
              {step === 1 && 'Provide the core details to help us categorize the item correctly.'}
              {step === 2 && 'Describe the item with as much detail as possible.'}
              {step === 3 && 'Where and when did you lose or find this item?'}
              {step === 4 && 'Please verify all information before submitting.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            {step === 1 && (
              <div className="space-y-8">
                {/* Item Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    1. Item Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateForm('type', 'lost')}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        formData.type === 'lost'
                          ? 'border-[#2563EB] bg-blue-50/50 ring-1 ring-[#2563EB]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center">
                          <Search className="w-6 h-6 text-white" />
                        </div>
                        {formData.type === 'lost' && (
                          <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">I Lost an Item</h3>
                      <p className="text-sm text-gray-500">
                        Report something you&apos;ve misplaced so we can match it when found.
                      </p>
                    </button>

                    <button
                      onClick={() => updateForm('type', 'found')}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        formData.type === 'found'
                          ? 'border-[#2563EB] bg-blue-50/50 ring-1 ring-[#2563EB]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        {formData.type === 'found' && (
                          <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">I Found an Item</h3>
                      <p className="text-sm text-gray-500">
                        Log an item you&apos;ve discovered to help return it to its owner.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Item Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    2. Item Category
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => updateForm('category', cat.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.category === cat.id
                              ? 'border-[#2563EB] bg-blue-50/50 ring-1 ring-[#2563EB]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                            formData.category === cat.id ? 'bg-[#2563EB]' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${formData.category === cat.id ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="e.g., Black Leather Wallet"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Add any distinctive features, brand names, or identifying marks..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Image (Optional)
                  </label>
                  {imagePreviewUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => updateForm('image', null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50/50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateForm('image', e.target.files?.[0] || null)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload an image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.location}
                      onChange={(e) => updateForm('location', e.target.value)}
                      className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none appearance-none bg-white cursor-pointer transition-all"
                    >
                      <option value="">Select a campus location...</option>
                      {campusLocations.map((location) => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date {formData.type === 'lost' ? 'Lost' : 'Found'}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Report Type</span>
                    <span className="font-medium text-gray-900 capitalize">{formData.type}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">
                      {categories.find(c => c.id === formData.category)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Item Name</span>
                    <span className="font-medium text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium text-gray-900">{campusLocations.find(l => l.id === formData.location)?.name}</span>
                  </div>
                  {formData.date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium text-gray-900">{formData.date}</span>
                    </div>
                  )}
                  {imagePreviewUrl && (
                    <div className="pt-4 border-t border-gray-200">
                      <span className="text-gray-600 block mb-2">Image</span>
                      <img
                        src={imagePreviewUrl}
                        alt="Item"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
                  <Info className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Once submitted, our system will automatically cross-reference this report with existing items to find potential matches.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-end justify-end mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all shadow-sm"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1 px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  {!isSubmitting && <CheckCircle className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
