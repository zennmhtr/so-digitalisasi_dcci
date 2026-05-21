const fs = require('fs');
const path = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  // management
  { ref: 'mio1Ref', key: 'management-mio-1', x: 250, y: 500, w: 'w-44' },
  { ref: 'mdo1Ref', key: 'management-mdo-1', x: 250, y: 590, w: 'w-44' },
  { ref: 'mro1Ref', key: 'management-mro-1', x: 250, y: 760, w: 'w-44' },
  { ref: 'cro1Ref', key: 'management-cro-1', x: 250, y: 850, w: 'w-44' },
  { ref: 'cro2Ref', key: 'management-cro-2', x: 250, y: 940, w: 'w-44' },
  
  // business
  { ref: 'bus1Ref', key: 'division-bus-1', x: 450, y: 650, w: 'w-44' }, 
  { ref: 'bus2Ref', key: 'division-bus-2', x: 450, y: 750, w: 'w-44' },
  
  // division
  { ref: 'mkt2_0Ref', key: 'division-mkt2-0', x: 450, y: 850, w: 'w-44' },
  
  // department
  { ref: 'qa1Ref', key: 'department-qa-1', x: 650, y: 540, w: 'w-44' },
  { ref: 'ppic1Ref', key: 'department-ppic-1', x: 650, y: 630, w: 'w-44' },
  { ref: 'mktEng1Ref', key: 'department-mkt-eng', x: 650, y: 720, w: 'w-44' },
  { ref: 'mkt2Ref', key: 'department-mkt-2', x: 650, y: 880, w: 'w-44' },
  { ref: 'mkt2AdvRef', key: 'department-mkt-adv', x: 650, y: 970, w: 'w-44' },
  { ref: 'hrd1Ref', key: 'department-hrd-1', x: 650, y: 1060, w: 'w-44' },
  { ref: 'rnd1Ref', key: 'department-rnd-1', x: 650, y: 1150, w: 'w-44' },
  { ref: 'pch1Ref', key: 'department-pch-1', x: 650, y: 1240, w: 'w-44' },
  
  // sections
  { ref: 'prd1Ref', key: 'section-prd-1', x: 850, y: 320, w: 'w-48' },
  { ref: 'eng1Ref', key: 'section-eng1-1', x: 850, y: 410, w: 'w-48' },
  { ref: 'mkt1_1Ref', key: 'section-mkt1-1', x: 850, y: 500, w: 'w-48' },
  { ref: 'hrd1_1Ref', key: 'section-hrd1-1', x: 850, y: 590, w: 'w-48' },
  { ref: 'mkt2_1Ref', key: 'section-mkt2-1', x: 850, y: 680, w: 'w-48' },
  { ref: 'prd2Ref', key: 'section-prd-2', x: 850, y: 770, w: 'w-48' },
  { ref: 'qac2Ref', key: 'section-qac2-0', x: 850, y: 860, w: 'w-48' },
  { ref: 'rnd1_1Ref', key: 'section-rnd1-1', x: 850, y: 950, w: 'w-48' },
  { ref: 'rnd1_2Ref', key: 'section-rnd1-2', x: 850, y: 1040, w: 'w-48' },
  { ref: 'rnd1_3Ref', key: 'section-rnd1-3', x: 850, y: 1130, w: 'w-48' },
  { ref: 'mkt3_0Ref', key: 'section-mkt3.0', x: 850, y: 1220, w: 'w-48' },
  { ref: 'fin1Ref', key: 'section-fin-1', x: 850, y: 1310, w: 'w-48' }
];

replacements.forEach(({ ref, key, x, y, w }) => {
  // Use a very flexible regex to match <div ref={xxxRef} ...
  // It could span multiple lines, use template strings, etc.
  // We'll replace just the ref={} part to inject the style.
  // E.g. ref={mio1Ref} -> ref={mio1Ref} style={getPos('...', x, y, 'w').style} className={getPos(...).className + " " + (existing class logic... wait, no we can't easily append to dynamic template strings.
  
  // It's easier to find `ref={ref}` and inject style there, and inject className... wait, if the class is dynamic like:
  // className={\`bg-white ... \${...}\`}
  // We can just add the width inside the style or as a new class?
  // Let's just put the width directly into the inline style! `width: w === 'w-44' ? '11rem' : '12rem'`
  // Then we don't need to touch className!
});

// Since we only need to inject style, let's just do:
replacements.forEach(({ ref, key, x, y, w }) => {
  const widthPx = w === 'w-44' ? '176px' : '192px'; // w-44 = 11rem = 176px, w-48 = 12rem = 192px
  const styleString = `style={{ position: 'absolute', left: organizationData?.positions?.['${key}']?.x || ${x}, top: organizationData?.positions?.['${key}']?.y || ${y}, zIndex: 20, width: '${widthPx}' }}`;
  
  // Replace only if it doesn't already have this style
  if (!content.includes(`['${key}']`)) {
    const regex = new RegExp(`ref={${ref}}`);
    content = content.replace(regex, `ref={${ref}} ${styleString}`);
  }
});

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
