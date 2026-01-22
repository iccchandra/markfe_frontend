import React, { useState } from 'react';
import {
  Eye, Download, CheckCircle, XCircle, Clock, Calendar,
  Search, Filter, User, Building2, DollarSign, Phone,
  Mail, MapPin, FileText, Edit, RefreshCw
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
interface Booking {
  id: string;
  bookingNumber: string;
  venue: string;
  venueType: 'event' | 'shooting';
  applicantName: string;
  email: string;
  mobile: string;
  eventName: string;
  bookedFrom: string;
  bookedTo: string;
  prefixDays: number;
  suffixDays: number;
  rentAmount: number;
  securityDeposit: number;
  gst: number;
  totalAmount: number;
  paymentId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  gstNumber?: string;
}

const BookingsMaster: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      bookingNumber: 'BPP20250115001',
      venue: 'Peoples Plaza',
      venueType: 'event',
      applicantName: 'John Doe',
      email: 'john@example.com',
      mobile: '+91 9876543210',
      eventName: 'Annual Tech Conference 2025',
      bookedFrom: '2025-01-20',
      bookedTo: '2025-01-22',
      prefixDays: 2,
      suffixDays: 1,
      rentAmount: 300000,
      securityDeposit: 75000,
      gst: 54000,
      totalAmount: 429000,
      paymentId: 'pay_123456789',
      status: 'confirmed',
      bookingDate: '2025-01-15T10:30:00',
      gstNumber: '29ABCDE1234F1Z5'
    },
    {
      id: '2',
      bookingNumber: 'BPP20250115002',
      venue: 'Lumbini Park',
      venueType: 'shooting',
      applicantName: 'Jane Smith',
      email: 'jane@example.com',
      mobile: '+91 9876543211',
      eventName: 'Movie Shooting - Scene 42',
      bookedFrom: '2025-01-22',
      bookedTo: '2025-01-22',
      prefixDays: 0,
      suffixDays: 0,
      rentAmount: 16000,
      securityDeposit: 4000,
      gst: 2880,
      totalAmount: 22880,
      paymentId: 'pay_987654321',
      status: 'pending',
      bookingDate: '2025-01-15T11:45:00'
    },
    {
      id: '3',
      bookingNumber: 'BPP20250115003',
      venue: 'Necklace Road',
      venueType: 'shooting',
      applicantName: 'Mike Johnson',
      email: 'mike@example.com',
      mobile: '+91 9876543212',
      eventName: 'Commercial Ad Shoot',
      bookedFrom: '2025-01-25',
      bookedTo: '2025-01-25',
      prefixDays: 0,
      suffixDays: 0,
      rentAmount: 10000,
      securityDeposit: 2500,
      gst: 1800,
      totalAmount: 14300,
      paymentId: 'pay_456789123',
      status: 'confirmed',
      bookingDate: '2025-01-15T14:20:00'
    },
    {
      id: '4',
      bookingNumber: 'BPP20250114004',
      venue: 'Sanjeevaiah Park',
      venueType: 'shooting',
      applicantName: 'Sarah Williams',
      email: 'sarah@example.com',
      mobile: '+91 9876543213',
      eventName: 'Fashion Photoshoot',
      bookedFrom: '2025-01-18',
      bookedTo: '2025-01-18',
      prefixDays: 0,
      suffixDays: 0,
      rentAmount: 17500,
      securityDeposit: 4375,
      gst: 3150,
      totalAmount: 25025,
      paymentId: 'pay_789123456',
      status: 'cancelled',
      bookingDate: '2025-01-14T09:15:00'
    },
    {
      id: '5',
      bookingNumber: 'BPP20250113005',
      venue: 'Peoples Plaza',
      venueType: 'event',
      applicantName: 'Robert Brown',
      email: 'robert@example.com',
      mobile: '+91 9876543214',
      eventName: 'Cultural Festival 2025',
      bookedFrom: '2025-02-01',
      bookedTo: '2025-02-03',
      prefixDays: 1,
      suffixDays: 1,
      rentAmount: 320000,
      securityDeposit: 80000,
      gst: 57600,
      totalAmount: 457600,
      paymentId: 'pay_321654987',
      status: 'confirmed',
      bookingDate: '2025-01-13T16:50:00',
      gstNumber: '29XYZAB5678G2W4'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVenueType, setFilterVenueType] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesVenueType = filterVenueType === 'all' || booking.venueType === filterVenueType;
    return matchesSearch && matchesStatus && matchesVenueType;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return theme.success;
      case 'pending': return theme.warning;
      case 'cancelled': return theme.error;
      case 'completed': return theme.secondaryBlue;
      default: return theme.gray600;
    }
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Calculate statistics
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0)
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: theme.gray900,
          marginBottom: '8px'
        }}>
          Bookings Management
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: theme.gray600
        }}>
          View and manage all venue bookings
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Total Bookings', value: stats.total, color: theme.primaryPink, icon: <Calendar size={20} /> },
          { label: 'Confirmed', value: stats.confirmed, color: theme.success, icon: <CheckCircle size={20} /> },
          { label: 'Pending', value: stats.pending, color: theme.warning, icon: <Clock size={20} /> },
          { label: 'Cancelled', value: stats.cancelled, color: theme.error, icon: <XCircle size={20} /> }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: theme.white,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.gray200}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `${stat.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                {stat.icon}
              </div>
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: theme.gray900,
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: theme.gray600,
              fontWeight: '500'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
        <div style={{
          background: `linear-gradient(135deg, ${theme.primaryPink}15, ${theme.secondaryBlue}15)`,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme.primaryPink}30`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `${theme.success}15`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.success
            }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: theme.gray900,
            marginBottom: '4px'
          }}>
            ₹{(stats.totalRevenue / 100000).toFixed(1)}L
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: theme.gray600,
            fontWeight: '500'
          }}>
            Total Revenue
          </div>
        </div>
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
              placeholder="Search bookings..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Venue Type Filter */}
          <select
            value={filterVenueType}
            onChange={(e) => setFilterVenueType(e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${theme.gray200}`,
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Venue Types</option>
            <option value="event">Event Venues</option>
            <option value="shooting">Shooting Locations</option>
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

      {/* Bookings Table */}
      <div style={{
        background: theme.white,
        borderRadius: '12px',
        border: `1px solid ${theme.gray200}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: theme.gray50 }}>
                {['Booking #', 'Applicant', 'Venue', 'Event', 'Date', 'Amount', 'Status', 'Actions'].map((header, index) => (
                  <th
                    key={index}
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: theme.gray700,
                      borderBottom: `1px solid ${theme.gray200}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  style={{
                    borderBottom: `1px solid ${theme.gray100}`,
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.gray50}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{
                    padding: '16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: theme.primaryPink
                  }}>
                    {booking.bookingNumber}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: theme.gray900,
                      marginBottom: '2px'
                    }}>
                      {booking.applicantName}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: theme.gray600
                    }}>
                      {booking.mobile}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: theme.gray900,
                      marginBottom: '2px'
                    }}>
                      {booking.venue}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: theme.gray600,
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}>
                      {booking.venueType}
                    </div>
                  </td>
                  <td style={{
                    padding: '16px',
                    fontSize: '0.85rem',
                    color: theme.gray700,
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {booking.eventName}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      color: theme.gray700
                    }}>
                      {new Date(booking.bookedFrom).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: theme.gray600
                    }}>
                      to {new Date(booking.bookedTo).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </div>
                  </td>
                  <td style={{
                    padding: '16px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: theme.gray900
                  }}>
                    ₹{booking.totalAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                      style={{
                        padding: '6px 12px',
                        background: `${getStatusColor(booking.status)}15`,
                        color: getStatusColor(booking.status),
                        border: `1px solid ${getStatusColor(booking.status)}40`,
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => viewBookingDetails(booking)}
                      style={{
                        padding: '8px 16px',
                        background: theme.secondaryBlue,
                        color: theme.white,
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryPink}
                      onMouseLeave={(e) => e.currentTarget.style.background = theme.secondaryBlue}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div style={{
            padding: '60px',
            textAlign: 'center'
          }}>
            <Calendar size={64} style={{ color: theme.gray600, margin: '0 auto 16px', opacity: 0.3 }} />
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: theme.gray900,
              marginBottom: '8px'
            }}>
              No Bookings Found
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: theme.gray600
            }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
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
          padding: '24px',
          overflowY: 'auto'
        }}
        onClick={() => setShowDetailsModal(false)}>
          <div style={{
            background: theme.white,
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.gray200}`,
              background: `linear-gradient(135deg, ${theme.primaryPink}10, ${theme.secondaryBlue}10)`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: theme.gray900,
                    marginBottom: '8px'
                  }}>
                    Booking Details
                  </h2>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: theme.primaryPink
                  }}>
                    {selectedBooking.bookingNumber}
                  </div>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: `${getStatusColor(selectedBooking.status)}15`,
                  color: getStatusColor(selectedBooking.status),
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {getStatusIcon(selectedBooking.status)}
                  {selectedBooking.status}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Applicant Information */}
                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: theme.gray900,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <User size={20} style={{ color: theme.primaryPink }} />
                    Applicant Information
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    background: theme.gray50,
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        NAME
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: theme.gray900
                      }}>
                        {selectedBooking.applicantName}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        EMAIL
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: theme.gray900
                      }}>
                        {selectedBooking.email}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        MOBILE
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: theme.gray900
                      }}>
                        {selectedBooking.mobile}
                      </div>
                    </div>
                    {selectedBooking.gstNumber && (
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: theme.gray600,
                          marginBottom: '4px',
                          fontWeight: '600'
                        }}>
                          GST NUMBER
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: theme.gray900
                        }}>
                          {selectedBooking.gstNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue & Event Information */}
                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: theme.gray900,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Building2 size={20} style={{ color: theme.primaryPink }} />
                    Venue & Event Details
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    background: theme.gray50,
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        VENUE
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: theme.gray900
                      }}>
                        {selectedBooking.venue}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        VENUE TYPE
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: theme.gray900,
                        textTransform: 'capitalize'
                      }}>
                        {selectedBooking.venueType}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        EVENT NAME
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: theme.gray900
                      }}>
                        {selectedBooking.eventName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Dates */}
                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: theme.gray900,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Calendar size={20} style={{ color: theme.primaryPink }} />
                    Booking Period
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    background: theme.gray50,
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        FROM DATE
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: theme.gray900
                      }}>
                        {new Date(selectedBooking.bookedFrom).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        TO DATE
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: theme.gray900
                      }}>
                        {new Date(selectedBooking.bookedTo).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        PREFIX DAYS
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: theme.gray900
                      }}>
                        {selectedBooking.prefixDays} days
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: theme.gray600,
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        SUFFIX DAYS
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: theme.gray900
                      }}>
                        {selectedBooking.suffixDays} days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: theme.gray900,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <DollarSign size={20} style={{ color: theme.primaryPink }} />
                    Payment Breakdown
                  </h3>
                  <div style={{
                    background: `linear-gradient(135deg, ${theme.primaryPink}08, ${theme.secondaryBlue}08)`,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.primaryPink}20`
                  }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: `1px solid ${theme.gray200}`
                      }}>
                        <span style={{ color: theme.gray700, fontSize: '0.9rem' }}>Rent Amount:</span>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                          ₹{selectedBooking.rentAmount.toLocaleString()}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: `1px solid ${theme.gray200}`
                      }}>
                        <span style={{ color: theme.gray700, fontSize: '0.9rem' }}>
                          Security Deposit (Refundable):
                        </span>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                          ₹{selectedBooking.securityDeposit.toLocaleString()}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: `2px solid ${theme.gray100}`
                      }}>
                        <span style={{ color: theme.gray700, fontSize: '0.9rem' }}>GST (18%):</span>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                          ₹{selectedBooking.gst.toLocaleString()}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.2rem'
                      }}>
                        <span style={{ fontWeight: '800', color: theme.gray900 }}>Total Amount:</span>
                        <span style={{ fontWeight: '900', color: theme.primaryPink }}>
                          ₹{selectedBooking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: theme.white,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: theme.gray600 }}>Payment ID:</span>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: theme.secondaryBlue,
                        fontFamily: 'monospace'
                      }}>
                        {selectedBooking.paymentId}
                      </span>
                    </div>
                  </div>
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
                onClick={() => setShowDetailsModal(false)}
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
                Close
              </button>
              <button
                style={{
                  padding: '10px 24px',
                  background: theme.secondaryBlue,
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
                <Download size={18} />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsMaster;