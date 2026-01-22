import React, { useState } from 'react';
import {
  Plus, Edit, Trash2, Eye, MapPin, DollarSign, Calendar,
  Search, Filter, Download, Upload, X, Save, Building2
} from 'lucide-react';

// Theme Configuration
const theme = {
  primaryPink: '#FF1F8E',
  secondaryBlue: '#0066CC',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// Types
interface Venue {
  id: string;
  name: string;
  location: string;
  type: 'event' | 'shooting';
  rate: number;
  rateType: string;
  capacity: number;
  description: string;
  image: string;
  status: 'active' | 'inactive';
  totalBookings: number;
  amenities: string[];
}

const VenuesMaster: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: '1',
      name: 'Peoples Plaza',
      location: 'Necklace Road, Hussain Sagar',
      type: 'event',
      rate: 100000,
      rateType: 'per day',
      capacity: 5000,
      description: 'Premium open-air venue perfect for large exhibitions',
      image: '/images/peopleplaza.jpeg',
      status: 'active',
      totalBookings: 156,
      amenities: ['Parking', 'Security', 'Restrooms', 'Electricity']
    },
    {
      id: '2',
      name: 'Lumbini Park',
      location: 'Near Secretariat',
      type: 'shooting',
      rate: 16000,
      rateType: '4 hrs',
      capacity: 300,
      description: 'Tranquil park featuring Buddha statue and musical fountain',
      image: '/images/Lumbini_Park.jpg',
      status: 'active',
      totalBookings: 98,
      amenities: ['Parking', 'Gardens', 'Lake View', 'Lighting']
    },
    {
      id: '3',
      name: 'Necklace Road',
      location: 'Hussain Sagar Lake',
      type: 'shooting',
      rate: 10000,
      rateType: '4 hrs',
      capacity: 200,
      description: 'Beautiful waterfront location with stunning city views',
      image: '/images/Necklace_Road.jpg',
      status: 'active',
      totalBookings: 134,
      amenities: ['Lake View', 'Walking Path', 'Lighting', 'Public Access']
    },
    {
      id: '4',
      name: 'Sanjeevaiah Park',
      location: 'Tank Bund, Hyderabad',
      type: 'shooting',
      rate: 17500,
      rateType: '4 hrs',
      capacity: 400,
      description: 'Scenic park with natural greenery, ideal for film shooting',
      image: '/images/Sanjeevaiah_Park.jpg',
      status: 'active',
      totalBookings: 89,
      amenities: ['Gardens', 'Children Play Area', 'Jogging Track', 'Parking']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const [formData, setFormData] = useState<Partial<Venue>>({
    name: '',
    location: '',
    type: 'event',
    rate: 0,
    rateType: 'per day',
    capacity: 0,
    description: '',
    image: '',
    status: 'active',
    amenities: []
  });

  // Filter venues
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || venue.type === filterType;
    const matchesStatus = filterStatus === 'all' || venue.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddVenue = () => {
    const newVenue: Venue = {
      id: Date.now().toString(),
      name: formData.name || '',
      location: formData.location || '',
      type: formData.type || 'event',
      rate: formData.rate || 0,
      rateType: formData.rateType || 'per day',
      capacity: formData.capacity || 0,
      description: formData.description || '',
      image: formData.image || '',
      status: formData.status || 'active',
      totalBookings: 0,
      amenities: formData.amenities || []
    };
    setVenues([...venues, newVenue]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditVenue = () => {
    if (!selectedVenue) return;
    setVenues(venues.map(v => 
      v.id === selectedVenue.id ? { ...selectedVenue, ...formData } : v
    ));
    setShowEditModal(false);
    setSelectedVenue(null);
    resetForm();
  };

  const handleDeleteVenue = () => {
    if (!venueToDelete) return;
    setVenues(venues.filter(v => v.id !== venueToDelete.id));
    setShowDeleteModal(false);
    setVenueToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      type: 'event',
      rate: 0,
      rateType: 'per day',
      capacity: 0,
      description: '',
      image: '',
      status: 'active',
      amenities: []
    });
  };

  const openEditModal = (venue: Venue) => {
    setSelectedVenue(venue);
    setFormData(venue);
    setShowEditModal(true);
  };

  const openDeleteModal = (venue: Venue) => {
    setVenueToDelete(venue);
    setShowDeleteModal(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: theme.gray900,
            marginBottom: '8px'
          }}>
            Venues Master
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: theme.gray600
          }}>
            Manage all venue locations and their details
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: `linear-gradient(135deg, ${theme.primaryPink}, ${theme.secondaryBlue})`,
            color: theme.white,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Add New Venue
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{
        background: theme.white,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${theme.gray200}`,
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.gray600
              }}
            />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: `1px solid ${theme.gray200}`,
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${theme.gray200}`,
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Types</option>
            <option value="event">Event Venues</option>
            <option value="shooting">Shooting Locations</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${theme.gray200}`,
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Export Button */}
          <button
            style={{
              padding: '10px 16px',
              background: theme.secondaryBlue,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryPink}
            onMouseLeave={(e) => e.currentTarget.style.background = theme.secondaryBlue}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Venues Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            style={{
              background: theme.white,
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${theme.gray200}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            {/* Image */}
            <div style={{
              height: '180px',
              background: `linear-gradient(135deg, ${theme.primaryPink}20, ${theme.secondaryBlue}20)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: venue.status === 'active' ? theme.success : theme.error,
                color: theme.white,
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {venue.status}
              </div>
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(0,0,0,0.7)',
                color: theme.white,
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {venue.type}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: theme.gray900,
                marginBottom: '8px'
              }}>
                {venue.name}
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: theme.gray600,
                fontSize: '0.85rem',
                marginBottom: '12px'
              }}>
                <MapPin size={14} />
                {venue.location}
              </div>

              <p style={{
                fontSize: '0.85rem',
                color: theme.gray700,
                lineHeight: 1.6,
                marginBottom: '16px',
                height: '40px',
                overflow: 'hidden'
              }}>
                {venue.description}
              </p>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                background: theme.gray50,
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: theme.gray600,
                    marginBottom: '2px'
                  }}>
                    RATE
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: theme.gray900
                  }}>
                    ₹{(venue.rate / 1000).toFixed(0)}k
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: theme.gray600,
                    marginBottom: '2px'
                  }}>
                    CAPACITY
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: theme.gray900
                  }}>
                    {venue.capacity}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: theme.gray600,
                    marginBottom: '2px'
                  }}>
                    BOOKINGS
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: theme.gray900
                  }}>
                    {venue.totalBookings}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => openEditModal(venue)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: theme.secondaryBlue,
                    color: theme.white,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryPink}
                  onMouseLeave={(e) => e.currentTarget.style.background = theme.secondaryBlue}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(venue)}
                  style={{
                    padding: '10px',
                    background: theme.error,
                    color: theme.white,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = theme.error}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVenues.length === 0 && (
        <div style={{
          background: theme.white,
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${theme.gray200}`
        }}>
          <Building2 size={64} style={{ color: theme.gray600, margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            color: theme.gray900,
            marginBottom: '8px'
          }}>
            No Venues Found
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: theme.gray600,
            marginBottom: '24px'
          }}>
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterStatus('all');
            }}
            style={{
              padding: '10px 24px',
              background: theme.primaryPink,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}
        onClick={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }}>
          <div style={{
            background: theme.white,
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.gray200}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: theme.gray900
              }}>
                {showAddModal ? 'Add New Venue' : 'Edit Venue'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: theme.gray600
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: theme.gray900
                  }}>
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter venue name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme.gray200}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: theme.gray900
                  }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme.gray200}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      color: theme.gray900
                    }}>
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'event' | 'shooting' })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.gray200}`,
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="event">Event Venue</option>
                      <option value="shooting">Shooting Location</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      color: theme.gray900
                    }}>
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.gray200}`,
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      color: theme.gray900
                    }}>
                      Rate (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: parseInt(e.target.value) })}
                      placeholder="Enter rate"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.gray200}`,
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      color: theme.gray900
                    }}>
                      Rate Type *
                    </label>
                    <select
                      value={formData.rateType}
                      onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${theme.gray200}`,
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="per day">Per Day</option>
                      <option value="4 hrs">4 Hours</option>
                      <option value="8 hrs">8 Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: theme.gray900
                  }}>
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    placeholder="Enter capacity"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme.gray200}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: theme.gray900
                  }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter venue description"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${theme.gray200}`,
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: `1px solid ${theme.gray200}`,
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                style={{
                  padding: '10px 24px',
                  background: theme.white,
                  color: theme.gray700,
                  border: `1px solid ${theme.gray200}`,
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddVenue : handleEditVenue}
                style={{
                  padding: '10px 24px',
                  background: `linear-gradient(135deg, ${theme.primaryPink}, ${theme.secondaryBlue})`,
                  color: theme.white,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={18} />
                {showAddModal ? 'Add Venue' : 'Update Venue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && venueToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}
        onClick={() => setShowDeleteModal(false)}>
          <div style={{
            background: theme.white,
            borderRadius: '16px',
            maxWidth: '450px',
            width: '100%',
            padding: '32px',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '64px',
              height: '64px',
              background: `${theme.error}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: theme.error
            }}>
              <Trash2 size={32} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: theme.gray900,
              marginBottom: '12px'
            }}>
              Delete Venue
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: theme.gray600,
              marginBottom: '24px',
              lineHeight: 1.6
            }}>
              Are you sure you want to delete <strong>{venueToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 24px',
                  background: theme.white,
                  color: theme.gray700,
                  border: `1px solid ${theme.gray200}`,
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVenue}
                style={{
                  padding: '10px 24px',
                  background: theme.error,
                  color: theme.white,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Delete Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenuesMaster;