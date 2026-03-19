import client from './client';

export const sendBroadcast = (data: { text: string; parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2' }) =>
  client.post('/admin/broadcast', data).then((r) => r.data);
