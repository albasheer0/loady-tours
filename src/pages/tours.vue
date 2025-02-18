<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <DataMap
          :items="tourStore.tours"
          type="tour"
          :loading="tourStore.loading"
          :selected-id="selectedId"
          @update:selected-id="selectedId = $event"
        />
      </v-col>
      <v-col cols="12" md="8">
        <DataTableCrud
          title="Tours"
          item-name="Tour"
          :headers="headers"
          :items="tourStore.tours"
          :loading="tourStore.loading"
          :default-item="defaultTour"
          :total-items="tourStore.pagination.total"
          :current-page="tourStore.pagination.page"
          :items-per-page="tourStore.pagination.limit"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
          @create="createTour"
          @update="updateTour"
          @delete="deleteTour"
        >
          <template #dialog-form="{ formData, updateForm }">
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.customerId"
                  :items="customerStore.customers"
                  item-title="name"
                  item-value="id"
                  label="Customer"
                  @update:model-value="updateForm({ customerId: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.assignedDriverId"
                  :items="availableDriversForLocation(formData.locationFrom?.city)"
                  item-title="name"
                  item-value="id"
                  label="Driver"
                  :hint="!availableDriversForLocation(formData.locationFrom?.city).length ? 'No available drivers at the pickup location' : ''"
                  persistent-hint
                  @update:model-value="updateForm({ assignedDriverId: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.locationFrom.city"
                  :items="cities"
                  label="From City"
                  @update:model-value="(value) => {
                    updateForm({ 
                      locationFrom: { 
                        ...formData.locationFrom, 
                        city: value,
                        ...cityCoordinates[value]
                      },
                      // Clear assigned driver if location changes
                      assignedDriverId: ''
                    });
                    // Fetch available drivers for the new location
                    fetchAvailableDrivers(value);
                  }"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.locationTo.city"
                  :items="cities"
                  label="To City"
                  @update:model-value="updateForm({ 
                    locationTo: { 
                      ...formData.locationTo, 
                      city: $event,
                      ...cityCoordinates[$event]
                    } 
                  })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.shipmentDate"
                  label="Shipment Date"
                  type="datetime-local"
                  :min="minShipmentDate"
                  :rules="dateValidationRules"
                  @update:model-value="updateForm({ shipmentDate: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.status"
                  :items="['active', 'completed', 'cancelled']"
                  label="Status"
                  @update:model-value="updateForm({ status: $event })"
                />
              </v-col>
            </v-row>
          </template>
        </DataTableCrud>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTourStore, useCustomerStore, useDriverStore } from '@/stores';
import DataTableCrud from '@/components/DataTableCrud.vue';
import DataMap from '@/components/DataMap.vue';
import type { Tour, Driver } from '@/types/models';

const route = useRoute();
const router = useRouter();
const tourStore = useTourStore();
const customerStore = useCustomerStore();
const driverStore = useDriverStore();

const selectedId = ref<string>('');
const availableDrivers = ref<Driver[]>([]);

// Table headers
const headers = [
  { title: 'Customer', key: 'customerId' },
  { title: 'From', key: 'locationFrom.city' },
  { title: 'To', key: 'locationTo.city' },
  { title: 'Status', key: 'status' },
  { title: 'Shipment Date', key: 'shipmentDate' },
  { title: 'Driver', key: 'assignedDriverId' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// City data
const cities = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'];
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Munich': { lat: 48.1351, lng: 11.5820 },
  'Hamburg': { lat: 53.5511, lng: 9.9937 },
  'Frankfurt': { lat: 50.1109, lng: 8.6821 },
  'Cologne': { lat: 50.9375, lng: 6.9603 },
};

// Default item with proper Location interface
const defaultTour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'> = {
  customerId: '',
  assignedDriverId: '',
  shipmentDate: new Date().toISOString(),
  status: 'active' as const,
  locationFrom: {
    city: 'Berlin',
    lat: cityCoordinates['Berlin'].lat,
    lng: cityCoordinates['Berlin'].lng,
  },
  locationTo: {
    city: 'Munich',
    lat: cityCoordinates['Munich'].lat,
    lng: cityCoordinates['Munich'].lng,
  },
};

// CRUD operations
async function createTour(tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>) {  
  try {
    await tourStore.createTour(tour);
  } catch (error) {
    console.error('Tour Creation Failed:', error);
  }
}

async function updateTour(id: string, tour: Partial<Tour>) {
  try {
    await tourStore.updateTour(id, tour);
  } catch (error) {
    console.error('Tour Update Failed:', error);
  }
}

async function deleteTour(id: string) {
  await tourStore.deleteTour(id);
}

// URL state management
function updateUrlState(query = route.query) {
  router.push({
    query: {
      page: query.page?.toString() || tourStore.pagination.page.toString(),
      limit: query.limit?.toString() || tourStore.pagination.limit.toString(),
      status: query.status as string,
      customerId: query.customerId as string,
      driverId: query.driverId as string,
      fromCity: query.fromCity as string,
      toCity: query.toCity as string,
      dateFrom: query.dateFrom as string,
      dateTo: query.dateTo as string,
    }
  });
}

// Watch for URL changes
watch(
  () => route.query,
  async (query) => {
    await tourStore.fetchTours(
      {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 5,
      },
      {
        status: query.status as 'active' | 'completed' | 'cancelled' | undefined,
        customerId: query.customerId as string,
        assignedDriverId: query.driverId as string,
        fromCity: query.fromCity as string,
        toCity: query.toCity as string,
        dateFrom: query.dateFrom as string,
        dateTo: query.dateTo as string,
      }
    );
  },
  { immediate: true }
);

// Load related data
onMounted(async () => {
  await Promise.all([
    customerStore.fetchCustomers(),
    fetchAvailableDrivers(),
  ]);

  if (!route.query.page && !route.query.limit) {
    updateUrlState();
  }
});

// Computed properties
const minShipmentDate = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDate = now.toISOString().slice(0, 16);
  return minDate;
});

// Add validation rules with debugging
const dateValidationRules = [
  (v: string) => {
    const isValid = new Date(v) >= new Date();
    return isValid || 'Shipment date cannot be in the past';
  }
];

// Function to fetch available drivers for a location
async function fetchAvailableDrivers(city?: string) {
  availableDrivers.value = await driverStore.fetchActiveDrivers(city);
}

// Replace the getAvailableDriversForLocation function with a computed property
const availableDriversForLocation = computed(() => (city?: string) => {
  return availableDrivers.value.filter(driver => !city || driver.location?.city === city);
});

// Add these functions after the CRUD operations
function handlePageChange(page: number) {
  updateUrlState({
    ...route.query,
    page: page.toString()
  });
}

function handleItemsPerPageChange(itemsPerPage: number) {
  updateUrlState({
    ...route.query,
    limit: itemsPerPage.toString(),
    page: '1' // Reset to first page when changing items per page
  });
}
</script> 