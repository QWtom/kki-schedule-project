import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
	try {
		const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;
		const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
		const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
		const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

		let privateKey;

		if (privateKeyBase64) {
			try {
				// Если есть Base64 кодированный ключ, используем его
				privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');
				console.log('Using Base64 decoded key');
			} catch (decodeError) {
				console.error('Error decoding Base64 key:', decodeError);
				throw new Error('Invalid Base64 private key format');
			}
		} else if (privateKeyRaw) {
			// Иначе используем обычный ключ
			privateKey = privateKeyRaw.replace(/\\n/g, '\n');
			// Удаляем лишние кавычки
			if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
				privateKey = privateKey.slice(1, -1);
			}
			console.log('Using standard key format');
		} else {
			throw new Error('No private key found in environment variables');
		}

		if (!clientEmail || !spreadsheetId) {
			throw new Error('Missing required environment variables for Google Sheets API');
		}

		// Создаем JWT клиент для авторизации
		const jwtClient = new google.auth.JWT(
			clientEmail,
			undefined,
			privateKey,
			['https://www.googleapis.com/auth/spreadsheets']
		);

		// Авторизация
		await jwtClient.authorize();

		// Создание Sheets API клиента
		const sheets = google.sheets('v4');

		// Получение метаданных таблицы
		const spreadsheet = await sheets.spreadsheets.get({
			auth: jwtClient,
			spreadsheetId
		});

		if (!spreadsheet.data.sheets) {
			throw new Error('No sheets found in the spreadsheet');
		}

		// Объявляем тип для allSheetsData, чтобы исправить ошибку TypeScript
		const allSheetsData: Record<string, any[]> = {};

		const ranges = spreadsheet.data.sheets
			.filter(sheet => sheet.properties?.title)
			.map(sheet => sheet.properties!.title!);

		if (ranges.length > 0) {
			// В src/app/api/googlesheets/route.ts
			const response = await sheets.spreadsheets.values.batchGet({
				auth: jwtClient,
				spreadsheetId,
				ranges,
				valueRenderOption: 'FORMATTED_VALUE',
				dateTimeRenderOption: 'FORMATTED_STRING',
				majorDimension: 'ROWS'
			});

			// Обработка полученных данных
			if (response.data.valueRanges) {
				response.data.valueRanges.forEach((valueRange, index) => {
					if (valueRange.range) {
						const sheetTitle = ranges[index];
						if (sheetTitle) {
							allSheetsData[sheetTitle] = valueRange.values || [];
						}
					}
				});
			}
		}

		// Метаданные для отслеживания синхронизации
		const metadata = {
			lastSync: new Date().toISOString(),
			sheetCount: Object.keys(allSheetsData).length
		};

		// В src/app/api/googlesheets/route.ts
		return NextResponse.json(
			{ data: allSheetsData, metadata },
			{
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0',
					'Surrogate-Control': 'no-store'
				}
			}
		);
	} catch (error) {
		console.error('Error fetching Google Sheets data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch Google Sheets data', details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}