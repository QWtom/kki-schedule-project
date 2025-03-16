// src/app/api/googlesheets/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
	try {
		// Проверяем наличие всех необходимых переменных окружения
		// Для работы с приватным ключом
		const privateKey = process.env.GOOGLE_PRIVATE_KEY
			? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/(^"|"$)/g, '')
			: undefined;
		const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
		const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

		// Более детальная проверка и обработка ошибок
		if (!privateKey) {
			console.error('GOOGLE_PRIVATE_KEY is missing or undefined');
			return NextResponse.json(
				{ error: 'Missing GOOGLE_PRIVATE_KEY environment variable' },
				{ status: 500 }
			);
		}

		if (!clientEmail) {
			console.error('GOOGLE_CLIENT_EMAIL is missing or undefined');
			return NextResponse.json(
				{ error: 'Missing GOOGLE_CLIENT_EMAIL environment variable' },
				{ status: 500 }
			);
		}

		if (!spreadsheetId) {
			console.error('GOOGLE_SPREADSHEET_ID is missing or undefined');
			return NextResponse.json(
				{ error: 'Missing GOOGLE_SPREADSHEET_ID environment variable' },
				{ status: 500 }
			);
		}

		// Обработка приватного ключа, который может быть в разных форматах в зависимости от среды
		const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

		// Создаем JWT клиент для авторизации
		const jwtClient = new google.auth.JWT(
			clientEmail,
			undefined,
			formattedPrivateKey,
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