
import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class SchemesResources {

  @Resource({
    uri: 'civicmate://scheme-search-guide',
    name: 'Scheme Search Guide',
    description: 'Information about searching official government scheme data',
    mimeType: 'application/json'
  })
  async getSearchGuide(uri: string, ctx: ExecutionContext) {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          application: 'CivicMate',
          purpose: 'Government scheme discovery',
          official_sources: [
            'https://www.myscheme.gov.in/',
            'https://data.gov.in/',
            'https://www.tn.gov.in/'
          ],
          accuracy_rule: 'Always verify eligibility and application details against the original government source.'
        }, null, 2)
      }]
    };
  }
}
