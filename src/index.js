import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  page.on('response',  async (response) => {
    const regexp = new RegExp('https://api.twitter.com/graphql/.*AudioSpaceById')
    if (regexp.test(response.url())) {
      try {
        let res = await response.text()
        if (res) {
          res= JSON.parse(res)
          const metadata = res.data.audioSpace.metadata
          const participants = res.data.audioSpace.participants
          console.log(participants.listeners.map((p) => p.twitter_screen_name).join(', '))
        }
      } catch (e) {
      }
    }
  });
  await page.goto('https://twitter.com/i/spaces/1MYxNgYbXowKw');
})();
