const fs = require('fs');

// ── Compare slider HTML (replaces every ba-images block) ─────────────────────
const compareHTML =
`<div class="ba-compare">` +
  `<div class="ba-compare-after"><div class="ba-ph ba-ph-after"></div></div>` +
  `<div class="ba-compare-before"><div class="ba-ph ba-ph-before"></div></div>` +
  `<div class="ba-compare-divider">` +
    `<div class="ba-compare-handle">` +
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-4 6 4 6"/><path d="M15 6l4 6-4 6"/></svg>` +
    `</div>` +
  `</div>` +
  `<span class="ba-cmp-lbl ba-cmp-lbl-l lang-ar">قبل</span>` +
  `<span class="ba-cmp-lbl ba-cmp-lbl-l lang-en" style="display:none">Before</span>` +
  `<span class="ba-cmp-lbl ba-cmp-lbl-r lang-ar">بعد</span>` +
  `<span class="ba-cmp-lbl ba-cmp-lbl-r lang-en" style="display:none">After</span>` +
`</div>`;

// ── CSS ───────────────────────────────────────────────────────────────────────
const compareCSS = `<style>
.ba-compare{position:relative;height:220px;overflow:hidden;cursor:ew-resize;user-select:none;-webkit-user-select:none;border-radius:12px 12px 0 0}
.ba-compare-after,.ba-compare-before{position:absolute;inset:0;width:100%;height:100%}
.ba-compare-before{clip-path:inset(0 50% 0 0)}
.ba-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.ba-ph-before{background:rgba(18,22,12,.95)}
.ba-ph-after{background:linear-gradient(135deg,rgba(20,45,12,.95),rgba(38,75,22,.9))}
.ba-cmp-img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none}
.ba-compare-divider{position:absolute;top:0;bottom:0;left:50%;width:2px;background:rgba(255,255,255,.7);transform:translateX(-50%);pointer-events:none;z-index:3}
.ba-compare-handle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;background:var(--wild-green-mid);border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;cursor:ew-resize;pointer-events:all;box-shadow:0 0 0 5px rgba(92,168,50,.2),0 4px 20px rgba(0,0,0,.5);transition:background .2s}
.ba-compare-handle:hover{background:var(--wild-green-light)}
.ba-cmp-lbl{position:absolute;top:10px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.75);background:rgba(0,0,0,.45);padding:3px 9px;border-radius:4px;pointer-events:none;z-index:4;backdrop-filter:blur(4px);font-family:'Tajawal',sans-serif;font-weight:700}
.ba-cmp-lbl-l{left:10px}
.ba-cmp-lbl-r{right:10px}
</style>`;

// ── JS ────────────────────────────────────────────────────────────────────────
const compareJS = `<script>
(function(){
  document.querySelectorAll('.ba-compare').forEach(function(el){
    var dragging=false;
    var divider=el.querySelector('.ba-compare-divider');
    var before=el.querySelector('.ba-compare-before');
    function setPos(cx){
      var r=el.getBoundingClientRect();
      if(!r.width)return;
      var pct=Math.min(95,Math.max(5,(cx-r.left)/r.width*100));
      before.style.clipPath='inset(0 '+(100-pct)+'% 0 0)';
      divider.style.left=pct+'%';
    }
    el.addEventListener('mousedown',function(e){dragging=true;setPos(e.clientX);e.preventDefault()});
    window.addEventListener('mousemove',function(e){if(dragging)setPos(e.clientX)});
    window.addEventListener('mouseup',function(){dragging=false});
    el.addEventListener('touchstart',function(e){dragging=true;setPos(e.touches[0].clientX)},{passive:true});
    el.addEventListener('touchmove',function(e){if(dragging){setPos(e.touches[0].clientX);e.preventDefault()}},{passive:false});
    el.addEventListener('touchend',function(){dragging=false});
  });
})();
</script>`;

// ── Replace all ba-images blocks with depth-counting parser ──────────────────
function replaceBAImages(html) {
  const OPEN  = '<div class="ba-images">';
  const DTAG  = '<div';
  const CTAG  = '</div>';
  var result = '';
  var pos = 0;

  while (true) {
    var start = html.indexOf(OPEN, pos);
    if (start === -1) { result += html.slice(pos); break; }

    result += html.slice(pos, start);   // everything before this block

    // walk forward counting div depth to find matching </div>
    var depth = 1;
    var cur = start + OPEN.length;
    while (depth > 0 && cur < html.length) {
      var nextOpen  = html.indexOf(DTAG, cur);
      var nextClose = html.indexOf(CTAG, cur);
      if (nextClose === -1) { cur = html.length; break; }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cur = nextOpen + DTAG.length;
      } else {
        depth--;
        cur = nextClose + CTAG.length;
      }
    }

    result += compareHTML;
    pos = cur;
  }
  return result;
}

// ── Process each file ─────────────────────────────────────────────────────────
const files = [
  'index.html',
  'coach-ahmad.html',
  'coach-abdelhadi.html',
  'coach-asem.html',
  'coach-mahmoud.html'
];

files.forEach(function(file) {
  const path = 'C:/Users/anasr/OneDrive/Desktop/wild gym/' + file;
  var c = fs.readFileSync(path, 'utf8');

  // 1. Replace ba-images blocks
  var before = (c.match(/<div class="ba-images">/g) || []).length;
  c = replaceBAImages(c);
  var after = (c.match(/<div class="ba-compare">/g) || []).length;

  // 2. Inject CSS before </body>
  c = c.replace('</body>', compareCSS + '\n</body>');

  // 3. Inject JS before </body>
  c = c.replace('</body>', compareJS + '\n</body>');

  fs.writeFileSync(path, c, 'utf8');
  var kb = Math.round(fs.statSync(path).size / 1024);
  console.log(file + ' | replaced: ' + before + ' -> ' + after + ' compare blocks | ' + kb + ' KB');
});
