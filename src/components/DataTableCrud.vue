<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :search="search"
    :items-per-page-options="[5,10, 20, 30, 50]"
    :server-items-length="totalItems"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    @update:options="handleOptionsChange"
    class="elevation-1"
  >
    <template #bottom>
      <div class="text-center pt-2 pb-2">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
        />
        <div class="text-caption mt-2">
          Total {{ totalItems }} items
        </div>
      </div>
    </template>

    <!-- Top Toolbar -->
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical />
        <v-spacer />
        
        <!-- Search Field -->
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          class="mr-4"
        />

        <!-- Add Button -->
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Add {{ itemName }}
        </v-btn>
      </v-toolbar>
    </template>

    <!-- Row Template -->
    <template v-slot:item="{ item }">
      <tr 
        :class="{ 'selected-row': item.id === selectedId }"
        @click="handleRowClick(item)"
      >
        <td v-for="header in headers" :key="header.key">
          <template v-if="header.key === 'actions'">
            <v-icon
              size="small"
              class="me-2"
              @click.stop="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              size="small"
              @click.stop="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
          <template v-else>
            <template v-if="header.key === 'status'">
              <v-chip
                size="small"
                :color="getStatusColor(item)"
                class="text-capitalize"
                variant="tonal"
                :prepend-icon="getStatusIcon(item)"
              >
                {{ getNestedValue(item, header.key) }}
              </v-chip>
            </template>
            <template v-else>
              {{ renderValue(item, header.key) }}
            </template>
          </template>
        </td>
      </tr>
    </template>

    <!-- Loading Progress -->
    <template #loader>
      <v-progress-linear
        color="primary"
        indeterminate
        :active="loading"
      />
    </template>
  </v-data-table>

  <!-- Edit/Create Dialog -->
  <v-dialog
    v-model="dialog.value"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ formTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <slot 
            name="dialog-form" 
            :form-data="editedItem"
            :update-form="updateFormData"
          />
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="saveItem"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation -->
  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="primary" variant="text" @click="confirmDelete">OK</v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCustomerStore } from '@/stores/customer';
import { useDriverStore } from '@/stores/driver';

const customerStore = useCustomerStore();
const driverStore = useDriverStore();

const props = defineProps<{
  title: string;
  itemName: string;
  headers: Array<{
    title: string;
    key: string;
    sortable?: boolean;
  }>;
  items: any[];
  loading: boolean;
  defaultItem: Record<string, any>;
  selectedId?: string;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
}>();

const emit = defineEmits<{
  create: [item: any];
  update: [id: string, item: any];
  delete: [id: string];
  'update:selectedId': [id: string | undefined];
  'update:page': [page: number];
  'update:items-per-page': [itemsPerPage: number];
  'visibleItemsChange': [ids: string[]];
}>();

const search = ref('');
const currentPage = computed({
  get: () => props.currentPage || 1,
  set: (value) => {
    if (value !== props.currentPage) {
      emit('update:page', value);
    }
  }
});

const itemsPerPage = computed({
  get: () => props.itemsPerPage || 5,
  set: (value) => {
    if (value !== props.itemsPerPage) {
      emit('update:items-per-page', value);
    }
  }
});

const totalPages = computed(() => {
  return Math.ceil((props.totalItems || 0) / itemsPerPage.value);
});

function handleOptionsChange(options: any) {
  
  if (options.page !== props.currentPage) {
    currentPage.value = options.page;
  }
  
  if (options.itemsPerPage !== props.itemsPerPage) {
    itemsPerPage.value = options.itemsPerPage;
  }
}

// Watch for items changes to emit visible items
watch(() => props.items, (newItems) => {
  if (Array.isArray(newItems)) {
    const validItems = newItems.filter(item => item?.id);
    emit('visibleItemsChange', validItems.map(item => item.id));
  } else {
    emit('visibleItemsChange', []);
  }
}, { immediate: true });

const dialog = ref({
  value: false,
  title: '',
});
const deleteDialog = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({ ...props.defaultItem });
const itemToDelete = ref<any>(null);

const formTitle = computed(() => {
  return editedIndex.value === -1 ? `New ${props.itemName}` : `Edit ${props.itemName}`;
});

function handleRowClick(item: any) {
  if (item?.id) {
    emit('update:selectedId', item.id === props.selectedId ? undefined : item.id);
  }
}

function getNestedValue(obj: any, path: string): any {
  if (!obj) return '';
  try {
    const value = path.split('.').reduce((o, i) => (o ? o[i] : ''), obj);
    return value ?? '';
  } catch (error) {
    return '';
  }
}

function getStatusColor(item: any): string {
  const status = getNestedValue(item, 'status');
  
  // Driver status
  if (item.location && !item.locationFrom) {
    return status === 'available' ? 'success' : 'warning';
  }
  
  // Tour status
  if (item.locationFrom && item.locationTo) {
    switch (status) {
      case 'active': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return '';
    }
  }
  
  return '';
}

function getStatusIcon(item: any): string {
  const status = getNestedValue(item, 'status');
  
  // Driver status
  if (item.location && !item.locationFrom) {
    return status === 'available' ? 'mdi-check-circle' : 'mdi-clock';
  }
  
  // Tour status
  if (item.locationFrom && item.locationTo) {
    switch (status) {
      case 'active': return 'mdi-truck-delivery';
      case 'completed': return 'mdi-check-circle';
      case 'cancelled': return 'mdi-close-circle';
      default: return '';
    }
  }
  
  return '';
}

function renderValue(item: any, key: string): string | null {
  const value = getNestedValue(item, key);
  if (!value) return '';

  // Handle dates
  if (key.toLowerCase().includes('date')) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  // Handle IDs that reference other entities
  if (key === 'customerId' && item.customerId) {
    const customer = customerStore?.customers.find(c => c.id === item.customerId);
    return customer ? customer.name : item.customerId;
  }

  if (key === 'assignedDriverId' && item.assignedDriverId) {
    const driver = driverStore?.drivers.find(d => d.id === item.assignedDriverId);
    return driver ? driver.name : item.assignedDriverId;
  }
  
  return value;
}

function openCreateDialog() {
  editedIndex.value = -1;
  editedItem.value = { ...props.defaultItem };
  dialog.value = {
    value: true,
    title: `New ${props.itemName}`,
  };
}

function editItem(item: any) {
  if (!item?.id) return;
  editedIndex.value = props.items.findIndex(i => i.id === item.id);
  editedItem.value = { ...item };
  dialog.value = {
    value: true,
    title: `Edit ${props.itemName}`,
  };
}

function deleteItem(item: any) {
  if (!item?.id) return;
  itemToDelete.value = item;
  deleteDialog.value = true;
}

function closeDialog() {
  dialog.value.value = false;
  setTimeout(() => {
    editedIndex.value = -1;
    editedItem.value = { ...props.defaultItem };
  }, 300);
}

async function saveItem() {
  try {
    if (editedIndex.value > -1 && editedItem.value?.id) {
      // Update
      await emit('update', editedItem.value.id, editedItem.value);
    } else {
      // Create
      await emit('create', editedItem.value);
    }
    closeDialog();
  } catch (error) {
    console.error('Error saving item:', error);
  }
}

async function confirmDelete() {
  if (itemToDelete.value?.id) {
    try {
      await emit('delete', itemToDelete.value.id);
      deleteDialog.value = false;
      itemToDelete.value = null;
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }
}

function updateFormData(data: any) {
  editedItem.value = { ...editedItem.value, ...data };
}
</script>

<style>
.selected-row {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.selected-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}

.v-chip {
  font-weight: 500;
}

.v-chip.v-chip--size-small {
  --v-chip-size: 24px;
}
</style> 