// src/app/api/googlesheets/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
	try {
		// Получаем переменные окружения
		const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
		const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
		const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

		if (!privateKey || !clientEmail || !spreadsheetId) {
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

		// Объект для хранения данных
		const allSheetsData: Record<string, any> = {};

		const ranges = spreadsheet.data.sheets
			.filter(sheet => sheet.properties?.title)
			.map(sheet => sheet.properties!.title!);

		if (ranges.length > 0) {
			const response = await sheets.spreadsheets.values.batchGet({
				auth: jwtClient,
				spreadsheetId,
				ranges
			});

			// Обработка полученных данных
			if (response.data.valueRanges) {
				response.data.valueRanges.forEach((valueRange, index) => {
					if (valueRange.range) {
						const sheetTitle = ranges[index];
						allSheetsData[sheetTitle] = valueRange.values || [];
					}
				});
			}
		}

		// Получение данных с каждого листа
		for (const sheet of spreadsheet.data.sheets) {
			if (!sheet.properties?.title) continue;

			const sheetTitle = sheet.properties.title;

			const response = await sheets.spreadsheets.values.get({
				auth: jwtClient,
				spreadsheetId,
				range: sheetTitle
			});

			allSheetsData[sheetTitle] = response.data.values || [];
		}

		// Метаданные для отслеживания синхронизации
		const metadata = {
			lastSync: new Date().toISOString(),
			sheetCount: Object.keys(allSheetsData).length
		};

		return NextResponse.json({
			data: allSheetsData,
			metadata
		});
	} catch (error) {
		console.error('Error fetching Google Sheets data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch Google Sheets data', details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}