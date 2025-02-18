<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <DataMap
          :items="customerStore.customers"
          type="customer"
          :loading="customerStore.loading"
          :selected-id="selectedId"
          @update:selected-id="selectedId = $event"
        />
      </v-col>
      <v-col cols="12" md="8">
        <DataTableCrud
          title="Customers"
          item-name="Customer"
          :headers="headers"
          :items="customerStore.customers"
          :loading="customerStore.loading"
          :default-item="defaultCustomer"
          :total-items="customerStore.pagination.total"
          :current-page="customerStore.pagination.page"
          :items-per-page="customerStore.pagination.limit"
          :selected-id="selectedId"
          @update:selected-id="selectedId = $event"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
          @create="createCustomer"
          @update="updateCustomer"
          @delete="deleteCustomer"
        >
          <template #dialog-form="{ formData, updateForm }">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.name"
                  label="Company Name"
                  @update:model-value="updateForm({ name: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  @update:model-value="updateForm({ email: $event })"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Phone"
                  @update:model-value="updateForm({ phone: $event })"
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
import { onMounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerStore } from '@/stores';
import DataTableCrud from '@/components/DataTableCrud.vue';
import DataMap from '@/components/DataMap.vue';
import type { Customer } from '@/types/models';

const route = useRoute();
const router = useRouter();
const customerStore = useCustomerStore();

const selectedId = ref<string | undefined>('');

// Table headers
const headers = [
  { title: 'Company Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
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
const defaultCustomer = {
  name: '',
  email: '',
  phone: '',
  location: {
    city: 'Berlin',
    lat: cityCoordinates['Berlin'].lat,
    lng: cityCoordinates['Berlin'].lng,
  },
  createdAt: new Date().toISOString(),
};

// CRUD operations
async function createCustomer(customer: Omit<Customer, 'id'>) {
  await customerStore.createCustomer(customer);
}

async function updateCustomer(id: string, customer: Partial<Customer>) {
  await customerStore.updateCustomer(id, customer);
}

async function deleteCustomer(id: string) {
  await customerStore.deleteCustomer(id);
}

// URL state management
function updateUrlState(query = route.query) {
  router.push({
    query: {
      page: query.page?.toString() || customerStore.pagination.page.toString(),
      limit: query.limit?.toString() || customerStore.pagination.limit.toString(),
      search: query.search as string,
      city: query.city as string,
    }
  });
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
    page: '1' // Reset to first page when changing items per page
  });
}

// Watch for URL changes
watch(
  () => route.query,
  async (query) => {
    await customerStore.fetchCustomers(
      {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 5,
      },
      {
        search: query.search as string,
        city: query.city as string,
      }
    );
  },
  { immediate: true }
);

// Initial data load
onMounted(async () => {
  if (!route.query.page && !route.query.limit) {
    updateUrlState();
  }
});
</script> 