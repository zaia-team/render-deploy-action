import { client } from './render.client';
import { z } from 'zod';

export class RenderSource  {
  public client: ReturnType<typeof client>;

  constructor(token: string) {
    this.client = client(token);
  }

  public async fetchServiceIDByName(name: string) {
    const { data } = await this.client.get('/services', {
      params: {
        name: name,
      }
    });

    const validation = z.array(
      z.object({
        service: z.object({
          id: z.string(),
        }),
      })
    ).parse(data);

    if (validation.length !== 1) {
      throw new Error(`Service ${name} not found`);
    }

    const { service } = validation[0];
    return service.id;
  }

  public async fetchCurrentEnvs(serviceId: string) {
    const { data } = await this.client.get(`/services/${serviceId}/env-vars`, {
      params: {
        limit: 100,
      },
    });

    const validation = z.array(
      z.object({
        envVar: z.object({
          key: z.string(),
          value: z.string(),
        }),
      })
    ).parse(data);

    const mapped = validation.reduce((acc, { envVar: env }) => ({
      ...acc,
      [env.key]: env.value,
    }), {}) as Record<string, string>;
  
    return mapped;
  };
  
  public async updateEnvs (serviceId: string, envs: Record<string, string | number> = {}) {
    await Promise.all(
      Object.keys(envs).map((key) => {
        return async () => 
          await this.client.put(`/services/${serviceId}/env-vars/${key}`, {
            value: envs[key],
          })
      })
    );
  };
  
  public async deleteEnvs (serviceId: string, keys: string[] = []) {
    Promise.all(
      keys.map(async (key) => {
        return async () => 
          await this.client.delete(`/services/${serviceId}/env-vars/${key}`);
      })
    );
  };
  
  public async deploy(serviceId: string) {
    await this.client.post(`/services/${serviceId}/deploys`);
  };
}
