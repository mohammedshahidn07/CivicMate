import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { db } from '../../database/db.js';

export class SchemesTools {

  @Tool({
    name: 'search_schemes',
    description: 'Search government schemes by keyword, state or category.',
    inputSchema: z.object({
      keyword: z.string().optional(),
      state: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().int().min(1).max(50).optional()
    })
  })
  async searchSchemes(input: any, ctx: ExecutionContext) {

    const keyword = input.keyword || '';
    const state = input.state || '';
    const category = input.category || '';
    const limit = input.limit || 20;

    const result = await db.query(
      `SELECT
        scheme_id,
        scheme_name,
        government_level,
        state,
        category,
        target_beneficiaries,
        benefit_summary,
        eligibility_summary,
        required_documents_summary,
        application_url,
        official_source_url,
        publication_label,
        verification_status
      FROM schemes
      WHERE
        ($1 = '' OR
          scheme_name ILIKE '%' || $1 || '%' OR
          category ILIKE '%' || $1 || '%' OR
          target_beneficiaries ILIKE '%' || $1 || '%')
        AND ($2 = '' OR state ILIKE '%' || $2 || '%')
        AND ($3 = '' OR category ILIKE '%' || $3 || '%')
      ORDER BY scheme_name
      LIMIT $4`,
      [keyword, state, category, limit]
    );

    return {
      success: true,
      total_results: result.rows.length,
      schemes: result.rows,
      message: 'Government scheme search completed.'
    };
  }


@Tool({
  name: 'check_eligibility',
  description: 'Check whether a person may qualify for a government scheme.',
  inputSchema: z.object({
    scheme_id: z.string(),
    annual_income: z.number().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    state: z.string().optional(),
    education: z.string().optional()
  })
})
async checkEligibility(input: any, ctx: ExecutionContext) {

  const result = await db.query(
    `SELECT scheme_id, scheme_name, state,
            eligibility_summary, verification_status,
            official_source_url
     FROM schemes
     WHERE scheme_id = $1`,
    [input.scheme_id]
  );

  if (result.rows.length === 0) {
    return {
      success: false,
      message: 'Scheme not found.'
    };
  }

  const scheme = result.rows[0];

  return {
    success: true,
    scheme_name: scheme.scheme_name,
    verification_status: scheme.verification_status,
    eligibility_information: scheme.eligibility_summary,
    applicant_information: {
      age: input.age,
      annual_income: input.annual_income,
      gender: input.gender,
      state: input.state,
      education: input.education
    },
    result: 'Eligibility requires verification against the official scheme criteria.',
    official_source: scheme.official_source_url
  };
}


@Tool({
  name: 'compare_schemes',
  description: 'Compare multiple government schemes.',
  inputSchema: z.object({
    scheme_ids: z.array(z.string()).min(2).max(5)
  })
})
async compareSchemes(input: any, ctx: ExecutionContext) {
  const result = await db.query(
    `SELECT scheme_id, scheme_name, state, category,
            benefit_summary, eligibility_summary,
            verification_status, official_source_url
     FROM schemes
     WHERE scheme_id = ANY($1)`,
    [input.scheme_ids]
  );

  return {
    success: true,
    schemes: result.rows,
    total_results: result.rows.length
  };
}

@Tool({
  name: 'get_required_documents',
  description: 'Get the required documents for a government scheme.',
  inputSchema: z.object({
    scheme_id: z.string()
  })
})
async getRequiredDocuments(input: any, ctx: ExecutionContext) {
  const result = await db.query(
    `SELECT scheme_name, required_documents_summary,
            official_source_url, verification_status
     FROM schemes
     WHERE scheme_id = $1`,
    [input.scheme_id]
  );

  if (result.rows.length === 0) {
    return {
      success: false,
      message: 'Scheme not found.'
    };
  }

  return {
    success: true,
    ...result.rows[0]
  };
}

}
