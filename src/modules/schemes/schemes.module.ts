import { Module } from '@nitrostack/core';
import { SchemesTools } from './schemes.tools.js';
import { SchemesResources } from './schemes.resources.js';
import { SchemesPrompts } from './schemes.prompts.js';


@Module({
  name: 'schemes',
  description: 'Government schemes and eligibility assistance',
  controllers: [SchemesTools, SchemesResources, SchemesPrompts]
})
export class SchemesModule {}