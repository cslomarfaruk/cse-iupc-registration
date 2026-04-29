"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { 
  Calendar, Edit, Trash2, Plus, Award, MapPin, Clock, Users,
  DollarSign, FilePlus, Loader2, Check, X, AlertCircle
} from "lucide-react";
import { format } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [rules, setRules] = useState([""]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    prizeMoney: "",
    fee: "",
    venue: "",
    startDate: "",
    endDate: "",
    image: ""
  });

  useEffect(() => {
    fetchEvents();
  }, [router]);

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
      setEvents(data.events);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRuleChange = (index, value) => {
    const updatedRules = [...rules];
    updatedRules[index] = value;
    setRules(updatedRules);
  };

  const addRule = () => {
    setRules([...rules, ""]);
  };

  const removeRule = (index) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
  };

  const openCreateModal = () => {
    setCurrentEvent(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      prizeMoney: "",
      fee: "",
      venue: "",
      startDate: "",
      endDate: "",
      image: ""
    });
    setRules([""]);
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description,
      prizeMoney: event.prizeMoney,
      fee: event.fee,
      venue: event.venue,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      image: event.image
    });
    setRules(event.rules.map(rule => rule.text));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Create slug from title if empty
    if (!formData.slug) {
      const slug = formData.title.toLowerCase().replace(/\s+/g, '-');
      setFormData({...formData, slug});
    }
    
    const payload = {
      ...formData,
      rules: rules.filter(rule => rule.trim() !== "").map(text => ({ text }))
    };
    
    try {
      const url = currentEvent 
        ? `/api/admin/events/${currentEvent.id}`
        : "/api/admin/events";
        
      const method = currentEvent ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Failed to ${currentEvent ? 'update' : 'create'} event`);
      }
      
      closeModal();
      fetchEvents();
      toast.success(`Event ${currentEvent ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* <AdminNav /> */}
      <Toaster position="top-right" />
      
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Event Management</h1>
          <button
            onClick={openCreateModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl hover:translate-y-px">
                {event.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/200";
                        e.target.alt = "Image not available";
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                  <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar size={16} className="text-purple-400" />
                      <span>{formatDate(event.startDate)} to {formatDate(event.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={16} className="text-purple-400" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Award size={16} className="text-purple-400" />
                      <span>Prize: {event.prizeMoney}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign size={16} className="text-purple-400" />
                      <span>Fee: {event.fee}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => openEditModal(event)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-all"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(event)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-all"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">{currentEvent ? 'Edit Event' : 'Create New Event'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="auto-generated-from-title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Prize Money</label>
                    <input
                      type="text"
                      name="prizeMoney"
                      value={formData.prizeMoney}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Registration Fee</label>
                    <input
                      type="text"
                      name="fee"
                      value={formData.fee}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Venue</label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                ></textarea>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-300 mb-2">Rules</label>
                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="Enter rule"
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRule}
                  className="mt-3 flex items-center gap-2 text-purple-400 hover:text-purple-300"
                >
                  <FilePlus size={18} />
                  <span>Add Rule</span>
                </button>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                >
                  <Check size={18} />
                  {currentEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
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