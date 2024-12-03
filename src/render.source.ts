import { client } from './render.client';
import { z } from 'zod';

export class RenderSource  {
  public client: ReturnType<typeof client>;

  constructor(token: string) {
    this.client = client(token);
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
  
  public async updateEnvs (serviceId: string, envs: Record<string, string> = {}) {
    Object.keys(envs).forEach(async (key) => {
      await this.client.put(`/services/${serviceId}/env-vars/${key}`, {
        value: envs[key],
      })
    });
  };
  
  public async deleteEnvs (serviceId: string, keys: string[] = []) {
    keys.forEach(async (key) => {
      await this.client.delete(`/services/${serviceId}/env-vars/${key}`);
    });
  };
  
  public async deploy(serviceId: string) {
    await this.client.post(`/services/${serviceId}/deploys`);
  };
}
