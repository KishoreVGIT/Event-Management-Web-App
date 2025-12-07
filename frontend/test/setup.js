import 'jsdom-global/register.js';

// Set a valid URL for JSDOM so that window.location.href is not empty/invalid
// jsdom-global/register automatically sets up the environment, but defaults to 'about:blank'
// We need to reconfigure it or just modify the location if possible.
// Since jsdom-global is already imported, we can try to use the 'changeURL' API if exposed or try to set it.
// Actually, jsdom-global doesn't expose easy reconfig after require.

// Let's try to overwrite the window.location or use the recommended way:
// Pass config to the register. But with 'import', it executes immediately.

// Workaround: We can use the 'reconfigure' method if we had access to the JSDOM instance, but we don't.
// However, the 'ics' library validation limits us.

// Better approach: Since 'calendar-export.js' uses window.location.href, let's just mock the function or the window object property if configurable.
// But window.location is non-configurable in JSDOM.

// Alternative: clean up and do manual setup
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:3000'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  userAgent: 'node.js'
};
global.Blob = dom.window.Blob;
global.URL = dom.window.URL;
