import fs from 'fs';
import { z } from "zod";
import * as core from '@actions/core';
import * as yaml from 'yaml'

import { RenderSource } from "./render.source";

try {
  const definitionFile = core.getInput('definition_file', { required: true });
  const renderToken = core.getInput('token', { required: true });
  const triggerDeploy = (core.getInput('trigger_deploy') || true) === true;

  const rawConfig = fs.readFileSync(definitionFile, 'utf8');
  const parsedConfig = yaml.parse(rawConfig);

  const validation = z.object({
    services: z.array(
      z.object({
        type: z.enum(['web', 'pserv', 'worker', 'cron', 'redis']),
        name: z.string(),
        envVars: z.array(
          z.object({
            key: z.string(),
            value: z.union([z.string(), z.number()]),
          }),
        ).optional(),
      }),
    ),
  }).parse(parsedConfig);

  if (validation.services.length !== 1) {
    throw new Error(`${definitionFile} should specify only one service`);
  }

  const render = new RenderSource(renderToken);
  const serviceId = await render.fetchServiceIDByName(validation.services[0].name);

  const service = {
    ...validation.services[0],
    id: serviceId,
    envs: validation.services[0].envVars?.reduce((acc, { key, value }) => ({
      ...acc,
      [key]: value,
    }), {} as Record<string, string | number>),
  };

  core.info(`Running action for ${service.name} [${serviceId}]`);
  const currentEnvs = await render.fetchCurrentEnvs(service.id);
  const deleteEnvKeys = Object.keys(currentEnvs).filter((key) => service.envs ? !service.envs[key] : true);

  core.info(`Updating service envs`);
  await render.updateEnvs(service.id, service.envs);
  await render.deleteEnvs(service.id, deleteEnvKeys);

  if (triggerDeploy) {
    core.info(`Triggering render deploy`);
    await render.deploy(service.id);
  }

  core.info(`Action executed with success`);
} catch (error: any) {
  core.error(
    error instanceof Error
      ? error.message
      : error
  );
  core.setFailed('Action failed with error');
}
