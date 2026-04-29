"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  UserPlus, 
  Mail, 
  Phone, 
  Users, 
  User, 
  ArrowRight, 
  Check, 
  Loader2,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function EventRegistrationPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const eventSlug = searchParams.get("slug");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    teamName: "",
    members: [{ name: "" }]
  });
  
  // Steps for the registration process
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  useEffect(() => {
    if (eventSlug) {
      fetchEventBySlug();
    } else if (eventId) {
      fetchEventById();
    } else {
      setLoading(false);
    }
  }, [eventId, eventSlug]);
  
  const fetchEventBySlug = async () => {
    try {
      const res = await fetch(`/api/events/${eventSlug}`, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await res.json();
      setEvent(data.event);
    } catch (error) {
      toast.error("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEventById = async () => {
    try {
      const res = await fetch(`/api/events/details?id=${eventId}`, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await res.json();
      setEvent(data.event);
    } catch (error) {
      toast.error("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleMemberChange = (index, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { name: value };
    setFormData({ ...formData, members: updatedMembers });
  };
  
  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: "" }]
    });
  };
  
  const removeMember = (index) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: updatedMembers });
  };
  
  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.email.trim() !== "" && isValidEmail(formData.email);
      case 2:
        if (formData.teamName.trim() === "" && formData.members.length === 1 && formData.members[0].name.trim() === "") {
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      if (currentStep === 1) {
        toast.error("Please enter a valid email address");
      } else if (currentStep === 2) {
        toast.error("Please provide team name or at least one member name");
      }
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Filter out empty member entries
      const filteredMembers = formData.members.filter(member => member.name.trim() !== "");
      
      const payload = {
        ...formData,
        members: filteredMembers,
        eventId: event.id
      };
      
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      // Show success state
      setShowSuccess(true);
      window.scrollTo(0, 0);
      
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if event is still open for registration
  const isEventActive = () => {
    if (!event) return false;
    
    const now = new Date();
    const endDate = new Date(event.endDate);
    return now <= endDate;
  };
  
  // Animation classes
  const slideIn = "animate-fadeIn";
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (!event && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-gray-400 mb-6">
            The event you're trying to register for doesn't exist or has been removed.
          </p>
          <Link 
            href="/events"
            className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Browse Available Events
          </Link>
        </div>
      </div>
    );
  }
  
  if (!isEventActive() && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <Calendar className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Registration Closed</h1>
          <p className="text-gray-400 mb-2">
            Sorry, registration for "{event.title}" has closed.
          </p>
          <p className="text-gray-500 mb-6">
            This event ended on {formatDate(event.endDate)}
          </p>
          <Link 
            href="/events"
            className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Browse Other Events
          </Link>
        </div>
      </div>
    );
  }
  
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-900 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Registration Successful!</h1>
          <p className="text-gray-300 mb-2">
            You're all set for <span className="text-purple-400">{event.title}</span>
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6 mt-6">
            <div className="flex items-center justify-center mb-2">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-300 text-sm">{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center justify-center">
              <Mail size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-300 text-sm">Confirmation sent to {formData.email}</span>
            </div>
          </div>
          <div className="space-y-4">
            <Link 
              href={`/events/${event.slug}`}
              className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md transition-colors"
            >
              View Event Details
            </Link>
            <Link 
              href="/events"
              className="inline-flex items-center justify-center w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md transition-colors"
            >
              Browse Other Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 pt-6 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center text-purple-200 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Event
          </Link>
          
          <div className="mt-6 flex items-center">
            <div className="h-12 w-12 bg-purple-800 rounded-xl flex items-center justify-center mr-4">
              <UserPlus className="h-6 w-6 text-purple-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Register for Event</h1>
              <p className="text-purple-200">{event.title}</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-purple-200">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-purple-200">
                {currentStep === 1 ? "Basic Info" : currentStep === 2 ? "Team Details" : "Review"}
              </span>
            </div>
            
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-6">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className={`space-y-6 ${slideIn}`}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    We'll send event updates and confirmation to this email
                  </p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+1 123 456 7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    For important event updates (we won't spam you)
                  </p>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-purple-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  
                  {event.fee > 0 && (
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500 mr-2">৳</span>
                      <span className="text-sm text-gray-300">
                        {event.fee} registration fee
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 2: Team Details */}
            {currentStep === 2 && (
              <div className={`space-y-6 ${slideIn}`}>
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
                    Team Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="teamName"
                      name="teamName"
                      placeholder="Your Team Name"
                      value={formData.teamName}
                      onChange={handleInputChange}
                      className="block w-full pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-300">
                      Team Members
                    </label>
                    <button
                      type="button"
                      onClick={addMember}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Member
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.members.map((member, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleMemberChange(index, e.target.value)}
                            placeholder={`Member ${index + 1} name`}
                            className="block w-full pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="p-3 text-gray-400 hover:text-white bg-gray-700 rounded-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Add all participants who will be part of your team
                  </p>
                </div>
                
                {event.rules && event.rules.length > 0 && (
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Team Requirements
                    </h3>
                    <ul className="space-y-1 text-xs text-gray-300">
                      {event.rules.slice(0, 2).map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-400 mr-1">•</span>
                          <span>{rule.content}</span>
                        </li>
                      ))}
                      {event.rules.length > 2 && (
                        <li className="text-purple-400 text-xs cursor-pointer hover:underline">
                          <Link href={`/events/${event.slug}`}>
                            View all rules...
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className={`space-y-6 ${slideIn}`}>
                <h3 className="text-md font-medium text-white">Review Your Registration</h3>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs uppercase text-gray-400 mb-1">Event</h4>
                      <p className="text-white font-medium">{event.title}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-300">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-600 my-2"></div>
                    
                    <div>
                      <h4 className="text-xs uppercase text-gray-400 mb-1">Contact</h4>
                      <div className="flex items-center mb-1">
                        <Mail size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{formData.email}</span>
                      </div>
                      {formData.phone && (
                        <div className="flex items-center">
                          <Phone size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-300">{formData.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-600 my-2"></div>
                    
                    <div>
                      <h4 className="text-xs uppercase text-gray-400 mb-1">Team</h4>
                      {formData.teamName && (
                        <div className="flex items-center mb-2">
                          <Users size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-white font-medium">{formData.teamName}</span>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {formData.members.filter(m => m.name.trim() !== "").map((member, index) => (
                          <div key={index} className="flex items-center">
                            <User size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-300">{member.name}</span>
                          </div>
                        ))}
                        {formData.members.filter(m => m.name.trim() !== "").length === 0 && (
                          <p className="text-gray-400 text-sm">No team members added</p>
                        )}
                      </div>
                    </div>
                    
                    {event.fee > 0 && (
                      <>
                        <div className="border-t border-gray-600 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Registration Fee</span>
                          <span className="text-white font-medium">৳{event.fee}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 mr-2 h-4 w-4 rounded text-purple-500 focus:ring-purple-500 bg-gray-700 border-gray-500"
                      required
                    />
                    <span className="text-sm text-gray-300">
                      I confirm that I have read and agree to the event rules and guidelines.
                    </span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors"
                >
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Need help? Contact <a href="mailto:support@example.com" className="text-purple-400 hover:underline">support@example.com</a>
        </div>
      </div>
    </div>
  );
}