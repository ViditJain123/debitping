// src/app/api/tally/sync/route.js        <-- keep the same location

import { getAuth } from '@clerk/nextjs/server';
import tallyService from '../../../../utils/tally-service';
import { errorResponse, successResponse } from '../../../../utils/api-helpers';

export async function POST(req) {
  try {
    /* -----------------------------------------------------------
       1. Auth ­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­ */
    const { userId } = getAuth(req);
    if (!userId) return errorResponse('Unauthorized', 401);

    /* -----------------------------------------------------------
       2. Tally up? ­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­­ */
    if (!(await tallyService.isTallyAvailable()))
      return errorResponse(
        'Tally not reachable on http://localhost:9000',
        503
      );

    /* -----------------------------------------------------------
       3. Body – expects { companyName }                            */
    const { companyName = '' } = await req.json().catch(() => ({}));
    if (!companyName) return errorResponse('Company name is required', 400);

    /* -----------------------------------------------------------
       4. Companies list                                            */
    const companiesRaw = await tallyService.getCompanies();
    const companies    = [].concat(companiesRaw || []); // always array

    if (!companies.some(c => c.NAME === companyName))
      return errorResponse(`Company "${companyName}" not found in Tally`, 404);

    /* -----------------------------------------------------------
       5. Ledgers + Bills                                           */
    const ledgers = [].concat((await tallyService.getLedgers(companyName)) || []);
    const bills   = [].concat((await tallyService.getOutstandingBills(companyName)) || []);

    /* -----------------------------------------------------------
       6. Build dealer sheet                                        */
    const dealers = tallyService.processDealerData(ledgers, bills);

    /* -----------------------------------------------------------
       7. Done                                                      */
    return successResponse({
      company      : companyName,
      dealersCount : dealers.length,
      dealers,
      timestamp    : new Date().toISOString()
    });
  } catch (err) {
    console.error('Tally sync error:', err);
    return errorResponse(err.message || 'Failed to sync data from Tally', 500);
  }
}