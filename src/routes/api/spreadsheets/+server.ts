import { google } from 'googleapis'
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

// Connecting and sending chat history to the Google spreadsheet databse
// [Edit] Could be edited to connect to a difference Google service account and spreadsheet
export async function _appendDataToSpreadsheet(role: any, message: any) {
	const auth = new google.auth.JWT({
		email: 'pl444-881@chatbot-database-391717.iam.gserviceaccount.com',
		keyFile: 'credentials.json',
		key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCj6Pqkj1HVDUBC\nRxy9uqCDojfPIc6vxd9DUOg4SJSqQgNDjrHek5sn3sN/YX07LWFn9Bkf2D1/NZUa\nnt2ATS7mykVU4sO+yv0+hAdxJhxrWpRoQBIVC0rUrva7tKIaRjGrCh4n5YjNWWH+\nSDKnLlbe2gUYkjhvoAoWW71bfrTOGOAOeJK6huyrtimxFhIBs3K+9s8K43SlMC/w\n0j3Yx3Mze3KEpYNySu1b9aQ9/yRsIYomq1VBACWIjAmUvwbJGXLuNuCIZCir2DNo\n5omCOyBKO7lvspRJ4f6xqFmjqAVpV9N82m1gBjfdKw9ASvXhnCW6LKIN00y0ztgs\nAOzVOtKXAgMBAAECggEAC+PQmrNSylOlv6kM6q5pCmNwDPR028dMxMNPtRV+w0L6\nnaHyQSUP8jp0j/7waKSIFlRcpjS3cUzfvgicJLx0lIVDtj6k2Gg9KpXFPG35TchK\nT62mIiSpjvgKKd+WirVg0Plw6o/59ntvYlS2Z+4ymwPRrtCci2xejvSkrchpMTH7\nBPv0urNQeTjbFBZmz9vEp+06tM8vQ1iehoYbgqkddIrJqUuTHfA72UdX21wZN4WR\nd65PwCSfq+bmhkwqsTRjSzOtsytApYqVwtYMVyvEzs7aSyRod+F+fSNJ2sh2CR8A\nb1WDX9V93g+BkmKPmeJ/V7eQQQKdZ1X0btxW9mUFsQKBgQDRW/WV+8dBhEy+sXmx\n57qbUOpUw1Fu52wEREN1z0ar61JMUJiIK0LbWFPMst1zJ9g/sICjLMT7yf+X09PS\n9Mrg3+Y866L1Rk/MdmZdAmRnfgSj/jmIODkX3w9JZsBlRpSVNN/Pn7ZJ3un2W7bE\nfhCaJudvpHt2gHhTD4XPMVhRUwKBgQDIbP5RXGrYroCOmJI0CeTIJzBqOvm7ghuF\nbuuCGWilzlcgKu/9BuDFkwXVPnPV55+BGvUzL3VwJqmblXqam5lk88TMK0vtPfDo\nUx3joRyemIm8syGd4KiqlcKU60CKZzQHHw5lB3RZEeOibhpi6AJg6j37j9o82BMc\n7DC0mCV9LQKBgDS/dqDTTuCy9KMXFBI+0EVRnbi9fUb0B8MLb/O+xY+LOrD/nW6x\nd6bMGlD4v9LDtzhUwBRcs0S9ICigtj3wby05PEkdFXG2xWQ+cIv+jk2E8qZe5x/r\nCnd5O+DCgrcBkW4GZF1rYAI8p7XqZaIcIRK1upnmVzUEKUzEHHKXfCkBAoGBAMJt\nuWiEFsKMxfmO2IXS8zWXjsf+3jSgSsJuj9htfa8bNDnobVcwTOxda9Mp+oUPZRSB\nakx1RZ++Ydqkb4N8XpooQEkv10AWTpWRy/T+Xh0cLMH5pCrbvcN99H0ymjGpXDds\nUTKAwMWHLSRtWvuHxobttaNMMZHEqwXrunP3BKchAoGAAKAb6X7RD90uh/d4BbaP\nnH3HGDz98nmqrHwkp0xS+TxTjbC3oLz84W63NBCV2JyOp7y2slTlKk2SszSlbBAx\nYjQvIEgAh8yQ9KOMd2y8/gsAJSffR9DkiuOGNPJqYIgqxSBxVx0dFUgV9aU1doTZ\nay7hb8PKMHjGGa0PcCMkdew=\n-----END PRIVATE KEY-----\n',
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	})
	const sheet = google.sheets('v4')

	await sheet.spreadsheets.values.append({
		spreadsheetId: '1Y9sbBsh11vIyYZ-qldj_2XZxmLLwXK_qT6YY575QvOc',
		auth: auth,
		range: 'Sheet1',
		valueInputOption: 'RAW',
		requestBody: {
			values: [[role, message]]
		}
	})
}

export const config: Config = {
	runtime: 'edge'
}

export const POST: RequestHandler = async ({ request }) => {
	try {
	  if (!request.body) {
		return json({ error: 'Request body is missing' }, { status: 400 });
	  }
  
	  const requestBody = await request.text();
	  const { role, message } = JSON.parse(requestBody);
  
	  if (!role || !message) {
		return json({ error: 'Role and message are required fields' }, { status: 400 });
	  }
  
	  await _appendDataToSpreadsheet(role, message);
  
	  return json({ success: true });
	} catch (error) {
	  console.error('Error appending data to Google Spreadsheet:', error);
	  return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
  }