// function to scrape weekly deal from flatiron meal plan website

const axios = require('axios');
const cheerio = require('cheerio');

function parseDateRange(dateStr) {

    dateStr = dateStr.replace(/–|—/g, '-');

    if (!dateStr) return { start: null, end: null };

    const parts = dateStr.split('-').map(s => s.trim());

    if (parts.length !== 2) {

        return { start: null, end: null };

    }

    const formatDate = (str) => {

        const cleaned = str.replace(/[^\d/]/g, '').trim();
        const [month, day, year] = cleaned.split('/');

        if (!month || !day || !year) return null;

        const fullYear = year.length === 2 ? `20${year}` : year;

        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    };

    return {
        start: formatDate(parts[0]),
        end: formatDate(parts[1])
    };

}

async function scrapeDeals() {
    const { data: html } = await axios.get('https://flatironmealplan.com/restaurantoftheweek/');
    const $ = cheerio.load(html);

    const extractedData = [];

    $('.fusion-builder-row.fusion-row').each((_, row) => {
        const columns = $(row).find('.fusion-layout-column');

        if (columns.length >= 4) {
            const date = $(columns[0]).text().trim();

            const image = $(columns[1]).find('img').attr('src') || '/resources/default_restaurant.jpg';

            const textBlocks = $(columns[2]).find('h2');

            const name = $(textBlocks[0]).text().trim();

            const note = textBlocks.length > 1 ? $(textBlocks[1]).text().trim() : null;

            const address = $(columns[3]).text().trim().replace(/\s+/g, ' ');

            const { start, end } = parseDateRange(date);

            if(!start || !end || !name || !address) {
                return;
            }

            extractedData.push({
                start_date: start,
                end_date: end,
                name,
                note: note || null,
                address,
                image_path: image
            });

        }

    })

    return extractedData;

}

module.exports = { scrapeDeals }