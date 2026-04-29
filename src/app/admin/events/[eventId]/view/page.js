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
  ChevronLeft, 
  Eye, 
  Download, 
  Loader2, 
  Edit,
  Share2
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function AdminEventView({ params }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  
  const router = useRouter();
  const eventId = params.eventId;

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

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
      setEvent(data.event);
      console.log("Event data:", data.event);
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

  const downloadRegistrations = () => {
    // Implementation for downloading registrations as CSV
    if (!event?.registrations?.length) {
      toast.error("No registrations to download");
      return;
    }
    
    // Generate CSV content
    const headers = ["Team Name", "Email", "Phone", "Members"];
    const rows = event.registrations.map(reg => [
      reg.teamName || "N/A",
      reg.email,
      reg.phone || "N/A",
      reg.members?.map(m => m.name).join(", ") || "None"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Registrations downloaded successfully");
  };

  // Animation classes for page transitions
  const fadeIn = "animate-fadeIn";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Events
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <Loader2 className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      ) : !event ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-300">Event not found</h2>
            <p className="text-gray-400 mt-2">The event you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/admin/events"
              className="mt-4 inline-flex items-center text-purple-500 hover:text-purple-400"
            >
              <ChevronLeft size={16} className="mr-1" />
              Return to Events
            </Link>
          </div>
        </div>
      ) : (
        <div className={`space-y-6 ${fadeIn}`}>
          {/* Event Header */}
          <div className="flex flex-col md:flex-row justify-between bg-gray-800 rounded-lg p-6 gap-4">
            <div className="flex gap-4 items-start">
              <div className="h-16 w-16 rounded-lg bg-purple-800 flex items-center justify-center flex-shrink-0">
                <Calendar size={28} className="text-purple-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{event.title}</h1>
                <p className="text-gray-400">{event.slug}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all"
              >
                <Edit size={18} />
                <span>Edit Event</span>
              </Link>
              <Link
                href={`/events/${event.slug}`}
                target="_blank"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all"
              >
                <Eye size={18} />
                <span>Preview</span>
              </Link>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 relative font-medium text-sm transition-colors
                  ${activeTab === "details" 
                    ? "text-purple-500 border-b-2 border-purple-500" 
                    : "text-gray-400 hover:text-gray-300"}`}
              >
                Event Details
              </button>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`py-4 px-1 relative font-medium text-sm transition-colors flex items-center
                  ${activeTab === "registrations" 
                    ? "text-purple-500 border-b-2 border-purple-500" 
                    : "text-gray-400 hover:text-gray-300"}`}
              >
                Registrations
                {event.registrations?.length > 0 && (
                  <span className="ml-2 bg-purple-900 text-purple-200 text-xs rounded-full px-2 py-0.5">
                    {event.registrations.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "details" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">About this Event</h2>
                  <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
                  
                  {/* Rules */}
                  {event.rules && event.rules.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Clipboard size={18} className="mr-2 text-purple-400" />
                        Rules & Guidelines
                      </h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-300">
                        {event.rules.map((rule, index) => (
                          <li key={index}>{rule.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Sidebar Info */}
                <div className="space-y-6">
                  {/* Event Details Card */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Clock size={20} className="mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-300">{formatDate(event.startDate)}</p>
                          <p className="text-gray-400">to {formatDate(event.endDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin size={20} className="mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-300">{event.venue || "No venue specified"}</p>
                        </div>
                      </div>
                      
                      {event.fee && (
                        <div className="flex items-start">
                          <DollarSign size={20} className="mr-3 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-300">৳{event.fee}</p>
                            <p className="text-gray-400">Entry Fee</p>
                          </div>
                        </div>
                      )}
                      
                      {event.prizeMoney && (
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
                  
                  {/* Registration Stats */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Users size={18} className="mr-2" />
                      Registration Stats
                    </h3>
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-purple-500">
                        {event.registrations?.length || 0}
                      </div>
                      <div className="text-gray-400 mt-1">Total Registrations</div>
                    </div>
                    <button
                      onClick={() => setActiveTab("registrations")}
                      className="w-full mt-2 text-purple-500 hover:text-purple-400 text-sm flex justify-center items-center"
                    >
                      View all registrations
                    </button>
                  </div>
                  
                  {/* Share Link */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Share2 size={18} className="mr-2" />
                      Share Event
                    </h3>
                    <div className="bg-gray-900 p-3 rounded flex items-center justify-between">
                      <div className="text-gray-400 text-sm truncate">
                        {`${window.location.origin}/events/${event.slug}`}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`);
                          toast.success("Link copied to clipboard");
                        }}
                        className="text-purple-500 hover:text-purple-400 ml-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Registrations Tab */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Registrations</h2>
                  <button
                    onClick={downloadRegistrations}
                    disabled={!event.registrations?.length}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                      ${event.registrations?.length 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
                
                {!event.registrations?.length ? (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h2 className="text-xl font-medium text-gray-300">No registrations yet</h2>
                      <p className="text-gray-400 mt-2">
                        Share your event link to start getting registrations.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-900">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registered On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {event.registrations.map((registration) => (
                            <tr key={registration.id} className="hover:bg-gray-750">
                              <td className="px-6 py-4">
                                <div className="font-medium text-white">{registration.teamName || "Individual"}</div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div>{registration.email}</div>
                                {registration.phone && (
                                  <div className="text-xs text-gray-400">{registration.phone}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-wrap gap-1">
                                  {registration.members?.map((member, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-gray-700 text-xs px-2 py-1 rounded"
                                    >
                                      {member.name}
                                    </span>
                                  ))}
                                  {!registration.members?.length && (
                                    <span className="text-gray-400">None</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {formatDate(registration.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}