import { describe, it, expect, beforeEach } from 'vitest';
import { VueWrapper, DOMWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import DataTableCrud from '../DataTableCrud.vue';
import { createWrapper } from '../../test/setup';
import type { ComponentPublicInstance } from 'vue';

interface VProgressLinearInstance extends ComponentPublicInstance {
  active: boolean;
}

interface VDialogInstance extends ComponentPublicInstance {
  modelValue: boolean;
}

interface DataTableCrudInstance extends ComponentPublicInstance {
  search: string;
  openCreateDialog: () => void;
  editedItem: any;
  saveItem: () => void;
  editItem: (item: any) => void;
  deleteItem: (item: any) => void;
  confirmDelete: () => void;
  handleRowClick: (item: any) => void;
  dialog: { value: boolean; title: string };
}

describe('DataTableCrud.vue', () => {
  const vuetify = createVuetify({ components });
  const mockItems = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' },
  ];

  const createTestWrapper = (props = {}) => {
    return createWrapper(DataTableCrud, {
      props: {
        title: 'Test Table',
        itemName: 'Item',
        headers: [
          { title: 'Name', key: 'name' },
          { title: 'Status', key: 'status' },
        ],
        items: mockItems,
        loading: false,
        defaultItem: { name: '', status: '' },
        ...props,
      },
    }) as VueWrapper<DataTableCrudInstance>;
  };

  describe('Loading State', () => {
    it('should show loading progress bar when loading is true', async () => {
      const wrapper = createTestWrapper({ loading: true });
      const dataTable = wrapper.findComponent({ name: 'v-data-table' });
      expect(dataTable.props('loading')).toBe(true);
    });

    it('should hide loading progress bar when loading is false', () => {
      const wrapper = createTestWrapper({ loading: false });
      const dataTable = wrapper.findComponent({ name: 'v-data-table' });
      expect(dataTable.props('loading')).toBe(false);
    });
  });

  describe('Search Functionality', () => {
    it('should filter items based on search input', async () => {
      const wrapper = createTestWrapper();
      const searchInput = wrapper.find('input[type="text"]');
      
      await searchInput.setValue('Item 1');
      expect(wrapper.vm.search).toBe('Item 1');
    });
  });

  describe('CRUD Operations', () => {
    it('should open create dialog when add button is clicked', async () => {
      const wrapper = createTestWrapper();
      const vm = wrapper.vm;
      
      await vm.openCreateDialog();
      expect(vm.dialog.value).toBe(true);
    });

    it('should emit create event with form data when saving new item', async () => {
      const wrapper = createTestWrapper();
      const vm = wrapper.vm;
      await vm.openCreateDialog();
      
      const newItem = { name: 'New Item', status: 'active' };
      vm.editedItem = newItem;
      
      await vm.saveItem();
      const createEvent = wrapper.emitted('create');
      expect(createEvent).toBeTruthy();
      expect(createEvent?.[0]).toEqual([newItem]);
    });

    it('should emit update event with form data when saving edited item', async () => {
      const wrapper = createTestWrapper();
      const vm = wrapper.vm;
      const itemToEdit = { ...mockItems[0], name: 'Updated Name' };
      
      await vm.editItem(mockItems[0]);
      vm.editedItem = itemToEdit;
      
      await vm.saveItem();
      const updateEvent = wrapper.emitted('update');
      expect(updateEvent).toBeTruthy();
      expect(updateEvent?.[0]).toEqual([itemToEdit.id, itemToEdit]);
    });

    it('should emit delete event when confirming deletion', async () => {
      const wrapper = createTestWrapper();
      const vm = wrapper.vm;
      const itemToDelete = mockItems[0];
      
      await vm.deleteItem(itemToDelete);
      await vm.confirmDelete();
      
      const deleteEvent = wrapper.emitted('delete');
      expect(deleteEvent).toBeTruthy();
      expect(deleteEvent?.[0]).toEqual([itemToDelete.id]);
    });
  });

  describe('Row Selection', () => {
    it('should highlight selected row', async () => {
      const wrapper = createTestWrapper({ selectedId: '1' });
      const row = wrapper.find('tr.selected-row');
      expect(row.exists()).toBe(true);
    });

    it('should emit selection event when row is clicked', async () => {
      const wrapper = createTestWrapper();
      const vm = wrapper.vm;
      
      await vm.handleRowClick(mockItems[0]);
      const selectionEvent = wrapper.emitted('update:selectedId');
      expect(selectionEvent).toBeTruthy();
      expect(selectionEvent?.[0]).toEqual(['1']);
    });
  });
}); 