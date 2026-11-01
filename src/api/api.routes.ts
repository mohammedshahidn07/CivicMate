
import { db } from '../database/db.js';

export function registerApiRoutes(app: any) {
  // Search government schemes
  app.post('/api/schemes/search', async (req: any, res: any) => {
    try {
      const { keyword = '', state = '', category = '', limit = 50 } = req.body || {};

      const result = await db.query(
        `SELECT scheme_id, scheme_name, government_level, state, category,
          target_beneficiaries, benefit_summary, eligibility_summary,
          required_documents_summary, application_url, official_source_url,
          publication_label, verification_status
         FROM schemes
         WHERE
          ($1 = '' OR scheme_name ILIKE '%' || $1 || '%' OR
           category ILIKE '%' || $1 || '%' OR
           target_beneficiaries ILIKE '%' || $1 || '%')
          AND ($2 = '' OR state ILIKE '%' || $2 || '%')
          AND ($3 = '' OR category ILIKE '%' || $3 || '%')
         ORDER BY scheme_name
         LIMIT $4`,
        [keyword, state, category, Math.min(Math.max(Number(limit) || 50, 1), 50)]
      );

      res.json({ success: true, schemes: result.rows, total_results: result.rows.length });
    } catch (error) {
      console.error('Scheme search error:', error);
      res.status(500).json({ success: false, message: 'Failed to search schemes.' });
    }
  });

  // Compare schemes
  app.post('/api/schemes/compare', async (req: any, res: any) => {
    try {
      const { scheme_ids } = req.body || {};

      if (!Array.isArray(scheme_ids) || scheme_ids.length < 2 || scheme_ids.length > 5) {
        return res.status(400).json({ success: false, message: 'Provide 2 to 5 scheme IDs.' });
      }

      const result = await db.query(
        `SELECT scheme_id, scheme_name, state, category, benefit_summary,
          eligibility_summary, verification_status, official_source_url
         FROM schemes WHERE scheme_id = ANY($1)`,
        [scheme_ids]
      );

      res.json({ success: true, schemes: result.rows, total_results: result.rows.length });
    } catch (error) {
      console.error('Scheme comparison error:', error);
      res.status(500).json({ success: false, message: 'Failed to compare schemes.' });
    }
  });

  // Informational eligibility lookup
  app.post('/api/eligibility/check', async (req: any, res: any) => {
    try {
      const { scheme_id, annual_income, age, gender, state, education } = req.body || {};

      if (!scheme_id) {
        return res.status(400).json({ success: false, message: 'scheme_id is required.' });
      }

      const result = await db.query(
        `SELECT scheme_id, scheme_name, state, eligibility_summary,
          verification_status, official_source_url
         FROM schemes WHERE scheme_id = $1`,
        [scheme_id]
      );

      if (!result.rows.length) {
        return res.status(404).json({ success: false, message: 'Scheme not found.' });
      }

      const scheme = result.rows[0];

      res.json({
        success: true,
        scheme_name: scheme.scheme_name,
        verification_status: scheme.verification_status,
        eligibility_information: scheme.eligibility_summary,
        applicant_information: { age, annual_income, gender, state, education },
        result: 'Eligibility requires verification against the official scheme criteria.',
        official_source: scheme.official_source_url
      });
    } catch (error) {
      console.error('Eligibility error:', error);
      res.status(500).json({ success: false, message: 'Failed to check eligibility.' });
    }
  });

  // Required documents
  app.get('/api/schemes/:id/documents', async (req: any, res: any) => {
    try {
      const result = await db.query(
        `SELECT scheme_id, scheme_name, required_documents_summary,
          official_source_url, verification_status
         FROM schemes WHERE scheme_id = $1`,
        [req.params.id]
      );

      if (!result.rows.length) {
        return res.status(404).json({ success: false, message: 'Scheme not found.' });
      }

      res.json({ success: true, ...result.rows[0] });
    } catch (error) {
      console.error('Documents error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
    }
  });

  console.log('CivicMate REST API routes registered.');
}
