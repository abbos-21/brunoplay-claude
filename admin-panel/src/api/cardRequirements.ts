import client from './client';
import type { CardRequirement } from '../types';

export const listCardRequirements = () =>
  client.get<{ data: CardRequirement[] }>('/admin/card-requirements').then((r) => r.data.data);

export const createCardRequirement = (data: Partial<CardRequirement>) =>
  client.post('/admin/card-requirements', data).then((r) => r.data);

export const updateCardRequirement = (id: number, data: Partial<CardRequirement>) =>
  client.put(`/admin/card-requirements/${id}`, data).then((r) => r.data);

export const deleteCardRequirement = (id: number) =>
  client.delete(`/admin/card-requirements/${id}`).then((r) => r.data);
