const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000; 
  const maxChecks = timeout / checkDurationMsecs; 
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0; 
  const minStableSizeIterations = 3; 

  while(checkCounts++ <= maxChecks){
    try {
      // 1. Отримуємо весь контент (це безпечно, бо повертає рядок)
      let html = await page.content();  
      let currentHTMLSize = html.length;

      // 2. БЕЗПЕЧНЕ отримання довжини body
      // Якщо document.body немає, повернемо 0
      let bodyHTMLSize = await page.evaluate(() => {
        return document.body ? document.body.innerHTML.length : 0;
      }); 

      if(lastHTMLSize !== 0 && currentHTMLSize === lastHTMLSize && bodyHTMLSize > 0) {
        countStableSizeIterations++;
      } else {
        countStableSizeIterations = 0; 
      }

      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Fully Rendered Page: " + page.url());
        break;
      }

      lastHTMLSize = currentHTMLSize;
      await new Promise(resolve => setTimeout(resolve, checkDurationMsecs));
    } catch (e) {
      // Додаємо ігнорування помилки, якщо body ще не з'явився
      if (e.message.includes('innerHTML') || e.message.includes('Execution context')) {
        console.log('Waiting for DOM/body to be available...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw e;
      }
    }
  }  
};

module.exports = { waitTillHTMLRendered };