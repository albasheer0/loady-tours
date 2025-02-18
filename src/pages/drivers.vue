<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <DataMap
          :items="driverStore.drivers"
          type="driver"
          :loading="driverStore.loading"
          :selected-id="selectedId"
          @update:selected-id="selectedId = $event"
        />
      </v-col>
      <v-col cols="12" md="8">
        <DataTableCrud
          title="Drivers"
          item-name="Driver"
          :headers="headers"
          :items="driverStore.drivers"
          :loading="driverStore.loading"
          :default-item="defaultDriver"
          :total-items="driverStore.pagination.total"
          :current-page="driverStore.pagination.page"
          :items-per-page="driverStore.pagination.limit"
          :selected-id="selectedId"
          @update:selected-id="selectedId = $event"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
          @create="createDriver"
          @update="updateDriver"
          @delete="deleteDriver"
        >
          <template #dialog-form="{ formData, updateForm }">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Name"
                  @update:model-value="updateForm({ name: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.status"
                  :items="['available', 'assigned']"
                  label="Status"
                  @update:model-value="updateForm({ status: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.location.city"
                  :items="cities"
                  label="City"
                  @update:model-value="updateForm({ 
                    location: { 
                      ...formData.location, 
                      city: $event,
                      ...cityCoordinates[$event]
                    } 
                  })"
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
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDriverStore } from '@/stores';
import DataTableCrud from '@/components/DataTableCrud.vue';
import DataMap from '@/components/DataMap.vue';
import type { Driver } from '@/types/models';

const route = useRoute();
const router = useRouter();
const driverStore = useDriverStore();

const selectedId = ref<string | undefined>('');

// Table headers
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Status', key: 'status' },
  { title: 'City', key: 'location.city' },
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

// Default item
const defaultDriver = {
  name: '',
  status: 'available',
  location: {
    city: 'Berlin',
    lat: cityCoordinates['Berlin'].lat,
    lng: cityCoordinates['Berlin'].lng,
  },
};

// CRUD operations
async function createDriver(driver: Omit<Driver, 'id'>) {
  await driverStore.createDriver(driver);
}

async function updateDriver(id: string, driver: Partial<Driver>) {
  await driverStore.updateDriver(id, driver);
}

async function deleteDriver(id: string) {
  await driverStore.deleteDriver(id);
}

// URL state management
function updateUrlState(query = route.query) {
  const newQuery = {
    page: query.page?.toString() || '1',
    limit: query.limit?.toString() || '5',
    ...(query.status && { status: query.status }),
    ...(query.city && { city: query.city })
  };

  if (route.fullPath === router.resolve({ query: newQuery }).fullPath) {
    return;
  }

  router.replace({ query: newQuery });
}

// Add pagination handlers
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
    page: '1'
  });
}

// Watch for URL changes
watch(
  () => route.query,
  async (query) => {
    await driverStore.fetchDrivers(
      {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 5,
      },
      {
        status: query.status as 'available' | 'assigned' | undefined,
        city: query.city as string,
      }
    );
  },
  { immediate: true }
);

// Initial data load
onMounted(() => {
  if (!route.query.page || !route.query.limit) {
    updateUrlState();
  }
});
</script> 