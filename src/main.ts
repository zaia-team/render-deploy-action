import fs from 'fs';
import { z } from "zod";
import core from '@actions/core';

import { RenderSource } from "./render.source";

try {
  // Get inputs defined in action.yml
  const definitionFile = core.getInput('definition_file', { required: true });
  const renderToken = core.getInput('token', { required: true });
  const triggerDeploy = core.getInput('trigger_deploy');

  const rawConfig = JSON.parse(fs.readFileSync(definitionFile, 'utf8'));

  if (!rawConfig) {
    throw new Error('definition_file must be a valid JSON file');
  }

  const validation = z.object({
    service: z.object({
      type: z.string(),
      name: z.string(),
      id: z.string(),
      envs: z.record(z.string()).optional(),
    }),
  }).safeParse(rawConfig);

  if (!validation.success || !validation.data) {
    throw new Error(validation.error.message);
  }

  const { data: { service }} = validation;
  const render = new RenderSource(renderToken);

  const currentEnvs = render.fetchCurrentEnvs(service.id);
  const deleteEnvKeys = Object.keys(currentEnvs).filter((key) => service.envs && !service.envs[key]);

  await render.updateEnvs(service.id, service.envs);
  await render.deleteEnvs(service.id, deleteEnvKeys);

  if (triggerDeploy) {
    await render.deploy(service.id);
  }
} catch (error: any) {
  core.setFailed(error.message);
}