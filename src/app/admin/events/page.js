"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const eventsPerPage = 10;
  
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      
      const data = await res.json();
      console.log(data)
      setEvents(data.events || []);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setIsDeleting(true);
  };
  
  const cancelDelete = () => {
    setEventToDelete(null);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete event');
      }
      
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Events Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <Link
            href="/admin/events/create"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <Loader2 className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-300">No events found</h2>
            <p className="text-gray-400 mt-2">Start by creating your first event using the button above.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registrations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded bg-purple-800 flex items-center justify-center">
                            <Calendar size={16} className="text-purple-200" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{event.title}</div>
                            <div className="text-xs text-gray-400">{event.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{formatDate(event.startDate)}</div>
                        <div className="text-xs text-gray-400">to {formatDate(event.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {event.venue}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {event.registrations?.length || 0} registrations
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/events/${event.id}/view`}
                            className="p-1 rounded text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => confirmDelete(event)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        currentPage === i + 1 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-500" size={24} />
                <h3 className="text-xl font-semibold">Confirm Deletion</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



