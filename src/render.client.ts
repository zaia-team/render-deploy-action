import axios from 'axios';

export const client = (token: string) => {
  return axios.create({
    baseURL: 'https://api.render.com/v1',
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${token}`,
    },
  });
};
