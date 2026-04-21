// function to scrape restaurant info from flatiron meal plan website
// returns an array of objects with restaurant name, address, phone number, and image path if available

const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeRestaurants() {
  const { data: html } = await axios.get('https://flatironmealplan.com/merchantslist/');
  const $ = cheerio.load(html);

  const extractedData = [];

  $('.fusion-fullwidth.fullwidth-box.fusion-equal-height-columns').each((_, row) => {
    const columns = $(row).find('.fusion-layout-column');

    if (columns.length >= 4) {
      extractedData.push({
        name:       $(columns[1]).text().trim(),
        address:    $(columns[2]).text().trim().replace(/\s+/g, ' '),
        phone:      $(columns[3]).text().trim() || 'No phone listed',
        image_path: $(columns[0]).find('img').attr('src') || '/resources/default_restaurant.jpg'
      });
    }
  });

  return extractedData;
}

module.exports = { scrapeRestaurants };