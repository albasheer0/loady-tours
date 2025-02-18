export interface Location {
  city: string;
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  location: Location;
  status: 'available' | 'assigned';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  location: Location;
}

export interface Tour {
  id: string;
  customerId: string;
  shipmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
  locationFrom: Location;
  locationTo: Location;
  assignedDriverId: string;
  createdAt: string;
  updatedAt: string;
} 