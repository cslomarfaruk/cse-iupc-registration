"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  Eye, 
  Trash2, 
  Download, 
  Calendar, 
  Mail, 
  Phone,
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const registrationsPerPage = 10;
  
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events for the filter dropdown
      const eventsRes = await fetch("/api/admin/events", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (eventsRes.status === 401) {
        router.push("/login");
        return;
      }
      
      const eventsData = await eventsRes.json();
      setEvents(eventsData.events || []);
      
      // Fetch registrations
      const regsRes = await fetch("/api/admin/registrations", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (regsRes.status === 401) {
        router.push("/login");
        return;
      }
      
      const regsData = await regsRes.json();
      setRegistrations(regsData.registrations || []);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (registration) => {
    setRegistrationToDelete(registration);
    setIsDeleting(true);
  };
  
  const cancelDelete = () => {
    setRegistrationToDelete(null);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/registrations/${registrationToDelete.id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete registration');
      }
      
      setRegistrations(registrations.filter(reg => reg.id !== registrationToDelete.id));
      toast.success("Registration deleted successfully");
    } catch (error) {
      toast.error("Failed to delete registration");
    } finally {
      setIsDeleting(false);
      setRegistrationToDelete(null);
    }
  };

  // Filter registrations based on search term and event filter
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.members.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEvent = filterEvent === "" || reg.eventId.toString() === filterEvent;
    
    return matchesSearch && matchesEvent;
  });

  // Pagination logic
  const indexOfLastReg = currentPage * registrationsPerPage;
  const indexOfFirstReg = indexOfLastReg - registrationsPerPage;
  const currentRegistrations = filteredRegistrations.slice(indexOfFirstReg, indexOfLastReg);
  const totalPages = Math.ceil(filteredRegistrations.length / registrationsPerPage);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get event name by ID
  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  };
  
  // Function to export registrations to CSV
  const exportToCSV = () => {
    // Get the filtered registrations
    const dataToExport = filteredRegistrations;
    
    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Create CSV headers
    let csv = "Team Name,Event,Email,Phone,Members,Registration Date\n";
    
    // Add data rows
    dataToExport.forEach(reg => {
      const eventName = getEventName(reg.eventId);
      const members = reg.members.map(m => m.name).join('; ');
      const row = [
        `"${reg.teamName}"`,
        `"${eventName}"`,
        `"${reg.email}"`,
        `"${reg.phone}"`,
        `"${members}"`,
        `"${formatDate(reg.createdAt)}"`
      ];
      csv += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export successful");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Registrations</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search registrations..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <Loader2 className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-300">No registrations found</h2>
            <p className="text-gray-400 mt-2">Registrations will appear here once participants sign up for events.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{reg.teamName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-purple-400" />
                          <span>{getEventName(reg.eventId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail size={14} className="text-blue-400" />
                            <span>{reg.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone size={14} className="text-green-400" />
                            <span>{reg.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {reg.members.map(member => member.name).join(", ")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {reg.members.length} {reg.members.length === 1 ? 'member' : 'members'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(reg.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/registrations/${reg.id}`}
                            className="p-1 rounded text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => confirmDelete(reg)}
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
                  Showing {indexOfFirstReg + 1} to {Math.min(indexOfLastReg, filteredRegistrations.length)} of {filteredRegistrations.length} registrations
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
                Are you sure you want to delete the registration for team "{registrationToDelete?.teamName}"? This action cannot be undone.
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