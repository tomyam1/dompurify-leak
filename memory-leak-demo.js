const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

function createSanitizer() {
  const window = new JSDOM('').window;
  return DOMPurify(window);
}

function demonstrateMemoryLeak() {
  const sampleHtml = `
    <div>
      <h1>Hello World</h1>
      <p>This is a <b>test</b> with some <script>alert('xss')</script> content</p>
      <img src="x" onerror="alert('xss')">
      <a href="javascript:alert('xss')">Click me</a>
    </div>
  `;

  const purify = createSanitizer();
  
  let prevHeapUsed = process.memoryUsage().heapUsed;

  for (let i = 0; i < 500; i++) {
    purify.sanitize(sampleHtml);
    purify.removed.length = 0;

    gc();
    const heapUsed = process.memoryUsage().heapUsed;
    
    const diff = heapUsed - prevHeapUsed;
    const diffFormatted = (diff >= 0 ? '+' : '') + diff;
    
    console.log(`Iteration ${i}, Heap used: ${heapUsed} (${diffFormatted})`);
    
    prevHeapUsed = heapUsed;
  }
}

demonstrateMemoryLeak(); 