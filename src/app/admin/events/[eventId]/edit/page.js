"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  ChevronLeft, 
  Loader2, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle,
  X,
  Image
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function AdminEventEdit({ params }) {
    
  const isNewEvent = params.eventId === "create";
  const eventId = isNewEvent ? null : params.eventId;
  const router = useRouter();
  
  const [loading, setLoading] = useState(!isNewEvent);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [event, setEvent] = useState({
    title: "",
    slug: "",
    description: "",
    prizeMoney: "",
    fee: "",
    venue: "",
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"), // Next day
    image: "",
    rules: []
  });

  useEffect(() => {
    if (!isNewEvent) {
      fetchEvent();
    }
  }, [eventId]);

  // Auto-generate slug when title changes
  useEffect(() => {
    if (!event.slug || event.slug === "") {
      const slug = event.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setEvent(prev => ({ ...prev, slug }));
    }
  }, [event.title]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await res.json();
      
      // Format dates for datetime-local input
      const formattedEvent = {
        ...data.event,
        startDate: formatDateForInput(data.event.startDate),
        endDate: formatDateForInput(data.event.endDate),
      };
      
      setEvent(formattedEvent);
    } catch (error) {
      toast.error("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRuleChange = (index, value) => {
    const updatedRules = [...event.rules];
    updatedRules[index] = { ...updatedRules[index], text: value };
    setEvent(prev => ({ ...prev, rules: updatedRules }));
  };

  const addRule = () => {
    setEvent(prev => ({
      ...prev,
      rules: [...prev.rules, { text: "" }]
    }));
  };

  const removeRule = (index) => {
    const updatedRules = [...event.rules];
    updatedRules.splice(index, 1);
    setEvent(prev => ({ ...prev, rules: updatedRules }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!event.title.trim()) errors.title = "Title is required";
    if (!event.slug.trim()) errors.slug = "Slug is required";
    if (!event.description.trim()) errors.description = "Description is required";
    if (!event.venue.trim()) errors.venue = "Venue is required";
    if (!event.startDate) errors.startDate = "Start date is required";
    if (!event.endDate) errors.endDate = "End date is required";
    
    // Check if end date is after start date
    if (event.startDate && event.endDate) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (end <= start) {
        errors.endDate = "End date must be after start date";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    
    setSaving(true);
    
    try {
      const url = isNewEvent 
        ? "/api/admin/events" 
        : `/api/admin/events/${eventId}`;
      
      const method = isNewEvent ? "POST" : "PUT";
      
      // Clean up the event data
      const { id: _, eventId: __, ...eventData } = event;
      
      // Clean up the rules array by removing id and eventId from each rule
      const cleanedRules = event.rules.map(rule => {
        const { id, eventId, ...rest } = rule;
        return rest;
      });
  
      const finalEventData = {
        ...eventData,
        rules: cleanedRules,
      };
  
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(finalEventData)
      });
      
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Failed to ${isNewEvent ? 'create' : 'update'} event`);
      }
      
      const data = await res.json();
      toast.success(`Event ${isNewEvent ? 'created' : 'updated'} successfully`);
      
      setTimeout(() => {
        router.push(`/admin/events/${data.event.id}/view`);
      }, 1000);
    } catch (error) {
      toast.error(`Failed to ${isNewEvent ? 'create' : 'update'} event`);
    } finally {
      setSaving(false);
    }
  };

  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideUp = "animate-slideUp";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <Link
          href={isNewEvent ? "/admin/events" : `/admin/events/${eventId}/view`}
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          {isNewEvent ? "Back to Events" : "Back to Event Details"}
        </Link>
      </div>
      
      <div className={`bg-gray-800 rounded-lg p-6 ${fadeIn}`}>
        <h1 className="text-2xl font-bold mb-6">
          {isNewEvent ? "Create New Event" : "Edit Event"}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <Loader2 className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`space-y-6 ${slideUp}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Event Information */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={event.title}
                    onChange={handleChange}
                    className={`w-full bg-gray-900 border ${formErrors.title ? 'border-red-500' : 'border-gray-700'} rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Enter event title"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-500 error-message">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
                    Event Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={event.slug}
                    onChange={handleChange}
                    className={`w-full bg-gray-900 border ${formErrors.slug ? 'border-red-500' : 'border-gray-700'} rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="event-url-slug"
                  />
                  {formErrors.slug && (
                    <p className="mt-1 text-sm text-red-500 error-message">{formErrors.slug}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">This will be used in the event URL: /events/your-slug</p>
                </div>
                
                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-300 mb-1">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={event.venue}
                    onChange={handleChange}
                    className={`w-full bg-gray-900 border ${formErrors.venue ? 'border-red-500' : 'border-gray-700'} rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Enter venue location"
                  />
                  {formErrors.venue && (
                    <p className="mt-1 text-sm text-red-500 error-message">{formErrors.venue}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fee" className="block text-sm font-medium text-gray-300 mb-1">
                      Entry Fee
                    </label>
                    <input
                      type="text"
                      id="fee"
                      name="fee"
                      value={event.fee}
                      onChange={handleChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="prizeMoney" className="block text-sm font-medium text-gray-300 mb-1">
                      Prize Money
                    </label>
                    <input
                      type="text"
                      id="prizeMoney"
                      name="prizeMoney"
                      value={event.prizeMoney}
                      onChange={handleChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                      Start Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={event.startDate}
                      onChange={handleChange}
                      className={`w-full bg-gray-900 border ${formErrors.startDate ? 'border-red-500' : 'border-gray-700'} rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                    {formErrors.startDate && (
                      <p className="mt-1 text-sm text-red-500 error-message">{formErrors.startDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                      End Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={event.endDate}
                      onChange={handleChange}
                      className={`w-full bg-gray-900 border ${formErrors.endDate ? 'border-red-500' : 'border-gray-700'} rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                    {formErrors.endDate && (
                      <p className="mt-1 text-sm text-red-500 error-message">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Event Description and Images */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={event.description}
                    onChange={handleChange}
                    rows={8}
                    className={`w-full bg-gray-900 border ${formErrors.description ? 'border-red-500' : 'border-gray-700'} rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Describe your event..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500 error-message">{formErrors.description}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                    Event Banner Image
                  </label>
                  
                  <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                    {event.image ? (
                      <div className="relative">
                        <img 
                          src={event.image} 
                          alt="Event banner" 
                          className="w-full h-48 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setEvent(prev => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-700 rounded-md p-6 text-center">
                        <Image className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm mb-2">Upload event banner image</p>
                        <input
                          type="text"
                          id="image"
                          name="image"
                          value={event.image}
                          onChange={handleChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter image URL"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rules Section */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Rules & Guidelines</h3>
                <button
                  type="button"
                  onClick={addRule}
                  className="flex items-center gap-1 text-purple-500 hover:text-purple-400 transition-colors"
                >
                  <Plus size={16} />
                  Add Rule
                </button>
              </div>
              
              {event.rules.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 rounded p-4 text-center">
                  <p className="text-gray-400">No rules added yet. Click "Add Rule" to create one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {event.rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={rule.text}
                          onChange={(e) => handleRuleChange(index, e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter rule text"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Form Controls */}
            <div className="flex justify-end gap-4 pt-4">
              <Link
                href={isNewEvent ? "/admin/events" : `/admin/events/${eventId}/view`}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isNewEvent ? "Create Event" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}