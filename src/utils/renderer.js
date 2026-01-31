
// ============== UTILITIES FOR RENDERING ==============


const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000; 
  const maxChecks = timeout / checkDurationMsecs; 
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0; 
  const minStableSizeIterations = 3; 

  while(checkCounts++ <= maxChecks){
    try {
      let html = await page.content();  // Get the full HTML content of the page
      let currentHTMLSize = html.length;   // Current size of the HTML content

      let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length); 

      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) // Checking if size is stable for this iteration
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; // Reset if size is changed

      if(countStableSizeIterations >= minStableSizeIterations) {  // If size has been stable for required iterations
        console.log("Fully Rendered Page: " + page.url());
        break;
      }

      lastHTMLSize = currentHTMLSize;
      await new Promise(resolve => setTimeout(resolve, checkDurationMsecs)); // Delay before next check
    } catch (e) {
      if (e.message.includes('Execution context was destroyed')) { // Handle navigation/context destruction errors
        console.log('Page navigated, waiting for new context...'); // Wait for a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));  // Wait before retrying
      } else {
        throw e;
      }
    }
  }  
};

module.exports = { waitTillHTMLRendered };
