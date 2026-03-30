import { get } from './client'

export const fetchGallery = ({ signal } = {}) =>
  get('/gallery', { auth: false, signal })
