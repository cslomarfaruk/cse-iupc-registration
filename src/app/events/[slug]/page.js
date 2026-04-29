"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  MapPin, 
  Users, 
  Clipboard,
  Share2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function EventDetailPage({ params }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    teamName: "",
    members: [{ name: "" }]
  });
  
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}`, {
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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return dateString;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);
    
    try {
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
      
      toast.success("Registration successful!");
      setFormData({
        email: "",
        phone: "",
        teamName: "",
        members: [{ name: "" }]
      });
      
      // Scroll back to top after successful registration
      window.scrollTo({ top: 0, behavior: "smooth" });
      
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const isEventActive = () => {
    if (!event) return false;
    
    const now = new Date();
    const endDate = new Date(event.endDate);
    return now <= endDate;
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      }).catch(err => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Animation classes for page transitions
  const fadeIn = "animate-fadeIn";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link
            href="/events"
            className="inline-flex items-center text-purple-200 hover:text-white transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Events
          </Link>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-12 w-12 text-purple-300 animate-spin" />
            </div>
          ) : !event ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto text-purple-300 mb-4" />
              <h1 className="text-3xl font-bold">Event Not Found</h1>
              <p className="mt-4 text-purple-200 max-w-2xl mx-auto">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Link
                href="/events"
                className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className={`${fadeIn}`}>
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-purple-200">
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                {event.venue && (
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2" />
                    <span>{event.venue}</span>
                  </div>
                )}
                {event.fee > 0 && (
                  <div className="flex items-center">
                    <DollarSign size={18} className="mr-2" />
                    <span>৳{event.fee}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      {!loading && event && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Description */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-800 rounded-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4">About this Event</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
                </div>
              </div>
              
              {/* Rules & Guidelines */}
              {event.rules && event.rules.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Clipboard size={20} className="mr-3 text-purple-400" />
                    Rules & Guidelines
                  </h2>
                  <ul className="space-y-3 text-gray-300">
                    {event.rules.map((rule, index) => (
                      <li key={index} className="flex">
                        <span className="text-purple-400 mr-2">•</span>
                        <span>{rule.content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Registration Form */}
              {isEventActive() ? (
                <div className="bg-gray-800 rounded-xl p-6 md:p-8" id="register">
                  <h2 className="text-2xl font-bold mb-6">Register for this Event</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone (optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    {/* Team Name */}
                    <div>
                      <label htmlFor="teamName" className="block text-sm font-medium text-gray-300">Team Name (optional)</label>
                      <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    {/* Team Members */}
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-300">Team Members</label>
                        <button
                          type="button"
                          onClick={addMember}
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          + Add Member
                        </button>
                      </div>
                      
                      <div className="mt-2 space-y-3">
                        {formData.members.map((member, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, e.target.value)}
                              placeholder={`Member ${index + 1} name`}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeMember(index)}
                                className="p-2 text-gray-400 hover:text-white"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={registering}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {registering ? (
                          <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            Registering...
                          </>
                        ) : (
                          <>Register Now</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-6 md:p-8 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-700 mb-4">
                    <Calendar className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium">Registration Closed</h3>
                  <p className="text-gray-400 mt-2">
                    This event has ended and is no longer accepting registrations.
                  </p>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Info Card */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock size={20} className="mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-300">{formatDate(event.startDate)}</p>
                      <p className="text-gray-400">to {formatDate(event.endDate)}</p>
                    </div>
                  </div>
                  
                  {event.venue && (
                    <div className="flex items-start">
                      <MapPin size={20} className="mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-300">{event.venue}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.fee > 0 && (
                    <div className="flex items-start">
                      <DollarSign size={20} className="mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-300">৳{event.fee}</p>
                        <p className="text-gray-400">Entry Fee</p>
                      </div>
                    </div>
                  )}
                  
                  {event.prizeMoney > 0 && (
                    <div className="flex items-start">
                      <DollarSign size={20} className="mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-300">৳{event.prizeMoney}</p>
                        <p className="text-gray-400">Prize Money</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* CTA Card */}
              {isEventActive() && (
                <div className="bg-gradient-to-br from-purple-800 to-blue-800 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Interested?</h3>
                  <p className="text-purple-200 mb-4">Register now to secure your spot!</p>
                  <a
                    href="#register"
                    className="inline-block w-full py-3 px-4 bg-white text-purple-900 font-medium rounded-md hover:bg-purple-100 transition-colors"
                  >
                    Register Now
                  </a>
                </div>
              )}
              
              {/* Share Card */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Share2 size={18} className="mr-2" />
                  Share this Event
                </h3>
                <button
                  onClick={shareEvent}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
              
              {/* Organizer Contact */}
              {event.organizer && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Organized by</h3>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-800 flex items-center justify-center">
                      <Users size={16} className="text-purple-200" />
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-medium">{event.organizer.name || "Event Team"}</div>
                      {event.organizer.email && (
                        <a href={`mailto:${event.organizer.email}`} className="text-sm text-purple-400 hover:text-purple-300">
                          {event.organizer.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Event Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}