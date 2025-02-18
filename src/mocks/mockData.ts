import { faker } from '@faker-js/faker';
import type { Driver, Customer, Tour, Location } from '../types/models';

const GERMAN_CITIES = [
  { city: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { city: 'Munich', lat: 48.1351, lng: 11.5820 },
  { city: 'Hamburg', lat: 53.5511, lng: 9.9937 },
  { city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { city: 'Cologne', lat: 50.9375, lng: 6.9603 }
];

function generateVariantLocation(baseLocation: typeof GERMAN_CITIES[0]): Location {
  // Add some random variation to the coordinates to make them unique
  const latVariation = faker.number.float({ min: -0.04, max: 0.77 });
  const lngVariation = faker.number.float({ min: -0.04, max: 0.77 });
  
  return {
    city: baseLocation.city,
    lat: baseLocation.lat + latVariation,
    lng: baseLocation.lng + lngVariation,
  };
}

export const generateLocation = (): Location => {
  const baseLocation = faker.helpers.arrayElement(GERMAN_CITIES);
  return generateVariantLocation(baseLocation);
};

export const generateDrivers = (count: number = 5): Driver[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `d${index + 1}`,
    name: faker.person.fullName(),
    location: generateLocation(),
    status: faker.helpers.arrayElement(['available', 'assigned'])
  }));
};

export const generateCustomers = (count: number = 5): Customer[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `c${index + 1}`,
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    createdAt: faker.date.past().toISOString(),
    location: generateLocation()
  }));
};

export const generateTours = (
  count: number = 5,
  customers: Customer[],
  drivers: Driver[]
): Tour[] => {
  return Array.from({ length: count }, (_, index) => {
    const createdAt = faker.date.recent().toISOString();
    const fromCity = faker.helpers.arrayElement(GERMAN_CITIES);
    let toCity;
    do {
      toCity = faker.helpers.arrayElement(GERMAN_CITIES);
    } while (toCity.city === fromCity.city); // Ensure different cities

    return {
      id: `t${index + 1}`,
      customerId: faker.helpers.arrayElement(customers).id,
      shipmentDate: faker.date.future().toISOString(),
      status: faker.helpers.arrayElement(['active', 'completed', 'cancelled']),
      locationFrom: generateVariantLocation(fromCity),
      locationTo: generateVariantLocation(toCity),
      assignedDriverId: faker.helpers.arrayElement(drivers).id,
      createdAt,
      updatedAt: faker.date.between({
        from: createdAt,
        to: new Date()
      }).toISOString()
    };
  });
};

// Generate initial mock data
export const mockDrivers = generateDrivers(22);
export const mockCustomers = generateCustomers(17);
export const mockTours = generateTours(34, mockCustomers, mockDrivers); 