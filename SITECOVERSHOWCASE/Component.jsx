import React, { useEffect } from 'react';
import Component_1 from './components/Component_1';
import Component_2 from './components/Component_2';
import Component_3 from './components/Component_3';

function App() {
  useEffect(() => {
    // Execute delayed scripts after React has rendered
    console.log('[React] DOM rendered, executing delayed scripts...');

    // Execute regular delayed scripts first
    const delayedScripts = document.querySelectorAll(
      'script[type="text/delayed"]'
    );

    delayedScripts.forEach((script) => {
      const newScript = document.createElement('script');

      // External script (has data-src)
      if (script.dataset.src) {
        newScript.src = script.dataset.src;

        // Copy other attributes (integrity, crossorigin, defer, etc.)
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== 'type' && attr.name !== 'data-src') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
      } else {
        // Inline script
        newScript.textContent = script.textContent;

        // Copy data-* attributes
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== 'type' && attr.name.startsWith('data-')) {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
      }

      document.body.appendChild(newScript);
    });

    // Execute delayed module scripts (Pattern 006: Pre-bundled ES Module Scripts)
    const delayedModules = document.querySelectorAll(
      'script[type="text/delayed-module"]'
    );

    delayedModules.forEach((script) => {
      const newScript = document.createElement('script');
      newScript.type = 'module'; // Restore original type

      // External module script (has data-src)
      if (script.dataset.src) {
        newScript.src = script.dataset.src;

        // Copy other attributes (crossorigin, etc.)
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== 'type' && attr.name !== 'data-src') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
      } else {
        // Inline module script
        newScript.textContent = script.textContent;

        // Copy data-* attributes
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== 'type' && attr.name.startsWith('data-')) {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
      }

      document.body.appendChild(newScript);
    });

    console.log(
      `[React] Executed ${delayedScripts.length} delayed scripts + ${delayedModules.length} delayed modules`
    );
  }, []);

  return (
    <>
      <div className='[font-family:"Times_New_Roman",system-ui,sans-serif] h-full overflow-x-hidden overflow-y-hidden'>
        <div
          id="ice-container"
          className='[font-family:"system-ui,ui-sans-serif,-apple-system,BlinkMacSystemFont,sans-serif,Inter,NotoSansHans",-apple-system,BlinkMacSystemFont,"Segoe_UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open_Sans","Helvetica_Neue",sans-serif,system-ui,sans-serif]'
        >
          <div className="bg-black min-w-full min-h-[959px] max-h-[959px] overflow-y-hidden items-center">
            <div id="qwen-ai-layout-top">
              <Component_1 />
            </div>
            <div
              id="GLOBAL_ID.QWEN_AI_LAYOUT_CONTENT"
              className="mt-[-128px] w-full h-[959px] pt-20 scroll-pt-20"
            >
              <Component_2 />
              <Component_3 />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
