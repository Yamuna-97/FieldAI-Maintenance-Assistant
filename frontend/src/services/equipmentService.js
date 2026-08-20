import { fetchApi } from './api';
import { MOCK_EQUIPMENT_LIST, MOCK_MANUALS_LIST, MOCK_MAINTENANCE_HISTORY } from '../data/mockData';

export async function getEquipmentList(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    const endpoint = `/api/v1/equipment${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint);
  } catch (error) {
    console.warn('Falling back to local equipment mock data:', error.message);
    let results = [...MOCK_EQUIPMENT_LIST];
    if (params.category && params.category !== 'All') {
      results = results.filter(e => e.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.status && params.status !== 'All') {
      results = results.filter(e => e.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      results = results.filter(e => 
        e.id.toLowerCase().includes(s) || 
        e.name.toLowerCase().includes(s) || 
        e.model.toLowerCase().includes(s)
      );
    }
    return results;
  }
}

export async function getManualsList(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.equipment_type && params.equipment_type !== 'All') query.append('equipment_type', params.equipment_type);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    const endpoint = `/api/v1/manuals${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint);
  } catch (error) {
    return MOCK_MANUALS_LIST;
  }
}

export async function getMaintenanceHistory(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.asset_id) query.append('asset_id', params.asset_id);
    const queryString = query.toString();
    const endpoint = `/api/v1/maintenance/history${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint);
  } catch (error) {
    return MOCK_MAINTENANCE_HISTORY;
  }
}
