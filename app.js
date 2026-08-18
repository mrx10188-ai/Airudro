/* ═══════════════════════════════════════════════════════════
   UNSENSOR STUDIO — Application Logic
   ═══════════════════════════════════════════════════════════ */

// ─── STATE ───
const state = {
  i2v: { uploadedUrl: '', tmpl: null, mode: 'template', generating: false, jobId: null },
  i2i: { uploadedUrl: '', tmpl: null, mode: 'template', generating: false, jobId: null },
  t2i: { generating: false, jobId: null },
};
const STORAGE_KEY = 'active_jobs';
const HISTORY_KEY = 'unsensor_history';
const MAX_HISTORY = 50;
const SAVED_GEN_KEY = 'pre_gen_data';
const TEMPLATES_FIREBASE_URL = '/api/templates';

// ─── TEMPLATES (loaded from Firebase, falls back to hardcoded) ───
let TEMPLATES = null;

const DEFAULT_TEMPLATES = {
  i2v: [
    { name: '🔥 AI Undress', desc: 'Clothes dissolve, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same eyes, nose, mouth, facial structure, expression, age. Body must remain EXACTLY the same — same height, weight, shape, proportions, skin tone. The woman\'s clothes slowly dissolve and disappear, she becomes completely naked, nude body revealed, natural look. Zero changes to face, body proportions, or identity. NEGATIVE: different face, changed features, different person, morph, warp, distortion, body change, weight change, age change' },
    { name: '🔓 Undress Now', desc: 'Immediate undress, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same facial features, same expression. Body unchanged — same height, weight, shape, proportions. Instant undress, clothes fall away, fully nude revealed, natural. Zero changes to identity. NEGATIVE: different face, face change, morph, different person, body change, weight change' },
    { name: '💃 Striptease', desc: 'Strip dance, face preserved', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, shape, proportions. Seductive striptease, removing clothes slowly, sensual dance, bedroom lighting, slow motion. Zero changes to face or body. NEGATIVE: different face, body change, different person, morph, distortion, weight change' },
    { name: '👅 Tongue Tease', desc: 'Tongue tease, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same eyes, nose, mouth, face shape, expression. Sensual tongue tease, licking lips, teasing, close up, intimate. Zero changes to face or body. NEGATIVE: different face, changed features, morph, different person, face change' },
    { name: '💋 Missionary', desc: 'Missionary sex, face visible', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both faces must remain EXACTLY the same — same facial features, expressions, age. Both bodies unchanged — same height, weight, proportions. Missionary position sex, intimate lovemaking, faces visible, romantic, soft lighting. Zero changes to either person. NEGATIVE: different face, face change, morph, different people, body change, weight change, age change' },
    { name: '🎬 Sex Missionary', desc: 'Passionate missionary, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both faces must remain EXACTLY the same — same facial features, same expressions, same age, same identity. Bodies must remain EXACTLY the same — same height, weight, proportions. Passionate missionary sex, intimate lovemaking, faces visible, romantic, soft lighting. Zero changes to either person. NEGATIVE: different face, face change, morph, different people, body change, weight change, age change, distortion' },
    { name: '🐕 Doggy Style', desc: 'Doggy sex, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same facial features when visible. Body unchanged — same height, weight, shape, proportions. Doggy style sex from behind, passionate, rhythmic motion, intimate. Zero changes to face or body. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🐕 Doggy from Behind', desc: 'Doggy behind view, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same features when visible in profile. Body unchanged — same height, weight, shape, proportions. Doggy style from behind view, penetration visible, ass up, intimate. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '👩 Cowgirl', desc: 'Woman on top, face preserved', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, shape, bust size. Cowgirl position, woman on top riding, sensual bouncing, intimate eye contact, breasts natural. Zero changes to identity. NEGATIVE: different face, body change, different person, bust change, weight change, morph' },
    { name: '🔄 Reverse Cowgirl', desc: 'Reverse cowgirl, back view', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged when visible. Body unchanged — same height, weight, shape, proportions. Reverse cowgirl position, woman on top facing away, back view, sensual riding. Zero changes to face or body. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🍑 Anal', desc: 'Anal sex, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, shape, proportions. Anal sex, passionate, intimate, faces visible, natural bodies. Zero changes to either person. NEGATIVE: different face, body change, different person, weight change, morph, distortion' },
    { name: '👄 Blowjob', desc: 'Oral giving, face visible', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same eyes, nose, mouth, face shape, expression, age. Body unchanged — same height, weight, proportions. Giving blowjob, kneeling, passionate oral sex, face visible, natural lighting. Zero changes to face or body. NEGATIVE: different face, changed facial features, morph, different person, body change, age change' },
    { name: '👄 Double Blowjob', desc: 'Two mouths, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Both faces unchanged — same facial features, expressions, age. Both bodies unchanged — same proportions, height, weight. Double blowjob, two partners, intense oral, face visible. Identities preserved. NEGATIVE: different face, morph, body change, different people, weight change' },
    { name: '👄 Air Blowjob', desc: 'Air blowjob suction, locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, proportions. Air blowjob, suction technique, oral pleasure, face visible, intimate. Zero changes. NEGATIVE: different face, body change, different person, morph' },
    { name: '✋ Handjob', desc: 'Handjob, face preserved', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same facial features, expression. Body unchanged — same height, weight, shape. Giving handjob, intimate touch, close up, sensual. Zero changes to identity. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🤚 Masturbation', desc: 'Masturbation, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, shape, proportions. Masturbation, touching herself, sensual, intimate, soft moaning, face visible, natural body. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '👅 Oral (Cunnilingus)', desc: 'Eating pussy, face locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same facial features, same expression of pleasure. Body unchanged — same height, weight, shape, proportions. Receiving oral cunnilingus, legs spread, pleasure, intimate, natural. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '💦 Facial', desc: 'Cum on face, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same facial structure, features, expression, age. Only add cumshot on face. Zero changes to facial features or structure. NEGATIVE: different face, changed features, morph, different person, face change, distortion' },
    { name: '🔗 Bondage', desc: 'Tied up rope, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same facial features, expression. Body unchanged — same height, weight, shape, proportions. Tied up with ropes, bondage, submissive pose, ropes on body, intimate. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🚿 Shower Sex', desc: 'Shower sex, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both faces unchanged — same facial features, expressions. Both bodies unchanged — same height, weight, proportions. Shower sex, water flowing, wet bodies, intimate, steamy. Zero changes. NEGATIVE: different face, body change, different people, morph, weight change' },
    { name: '👀 Spread Legs', desc: 'Legs spread, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same features. Body unchanged — same shape, proportions, height, weight. Spread legs showcase, lying down, legs apart, intimate, natural. Zero changes. NEGATIVE: different face, body change, different person, weight change' },
    { name: '🌸 Spread Pussy POV', desc: 'Pussy spread POV, locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged when visible. Body unchanged — same shape, proportions, skin tone. Spread pussy close-up POV, labia spread, intimate view. Zero changes to identity. NEGATIVE: different face, body change, different person, weight change' },
    { name: '💏 POV Kiss', desc: 'Passionate kiss POV', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Both faces unchanged — same people, same facial features, same age. Both bodies unchanged — same proportions. Passionate kiss, POV view, intimate close up, lips touching, romantic. Zero changes. NEGATIVE: different face, morph, different people, body change, age change' },
    { name: '💋 Tender Kiss', desc: 'Tender kiss, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both faces unchanged — same facial features, expressions, age. Both bodies unchanged — same proportions. Tender romantic kiss, soft lips, intimate moment, warm lighting, faces close. Zero changes. NEGATIVE: different face, morph, different people, body change' },
    { name: '🔥 POV Missionary', desc: 'Missionary POV, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Both faces unchanged — same facial features when visible. Both bodies unchanged — same height, weight, proportions. POV missionary sex, looking down at partner, intimate, romantic, faces visible. Zero changes. NEGATIVE: different face, body change, different people, weight change, morph' },
    { name: '🔥 POV Insert', desc: 'POV penetration insert', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same features when visible. Body unchanged — same proportions. POV insertion, penis entering vagina, intimate close up, passionate. Zero changes. NEGATIVE: different face, body change, different person, morph' },
    { name: '🍑 POV Anal', desc: 'Anal POV, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged when visible — same facial features. Body unchanged — same height, weight, shape, proportions. POV anal sex, intimate view, passionate, body natural. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🐕 POV Doggy Face', desc: 'Doggy POV front face', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same facial features, expression. Body unchanged — same proportions, height, weight. Doggy style POV front-facing, looking back at camera, intimate, passionate. Zero changes. NEGATIVE: different face, body change, different person, morph' },
    { name: '💦 POV Cowgirl Bounce', desc: 'Cowgirl bounce POV', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, shape, bust size. Cowgirl bounce POV, riding up and down, breasts bouncing, intimate, romantic. Zero changes. NEGATIVE: different face, body change, bust change, different person, weight change' },
    { name: '👅 POV Deepthroat', desc: 'Deepthroat POV, locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same eyes, nose, mouth, facial structure, expression, age. Body unchanged — same proportions. Deepthroat blowjob POV, intimate, passionate oral, face visible. Zero changes to face or body. NEGATIVE: different face, changed features, morph, different person, body change, age change' },
    { name: '🔥 POV Rough Face Fuck', desc: 'Rough oral POV, locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, structure, expression, age. Body unchanged — same shape, proportions. Rough face fucking POV, deep throat, intense oral, face visible. Zero changes to identity. NEGATIVE: different face, changed facial features, morph, different person, body change' },
    { name: '💦 POV Mouthfull', desc: 'Mouthfull cumshot POV', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same proportions. POV mouthfull cumshot, semen in mouth, intimate close up. Zero changes to face. NEGATIVE: different face, changed features, morph, different person, face change' },
    { name: '💦 POV Body Cumshot', desc: 'Cum on body POV, locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same features. Body unchanged — same shape, proportions, skin tone. POV body cumshot, semen on chest and stomach, intimate. Zero changes to identity. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '💦 POV Cumshot Face', desc: 'Facial cumshot POV', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial structure, features, expression, age. POV cumshot on face, semen on skin, intimate close up. Zero changes to facial features. NEGATIVE: different face, changed features, morph, different person, face change, distortion' },
    { name: '🍑 POV Bend Over', desc: 'Bend over POV, locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged when visible — same features. Body unchanged — same height, weight, shape, proportions. POV bend over reveal, bending forward, intimate view. Zero changes to person. NEGATIVE: different face, body change, different person, weight change' },
    { name: '🎪 Sex Mode', desc: 'Full sex scene, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both people unchanged — same faces, same bodies, same proportions. Passionate sex scene, intimate lovemaking, natural bodies, face visible, romantic. Zero changes to either person. NEGATIVE: different face, different people, body change, morph, distortion, weight change, age change' },
    { name: '🔄 Turn Around', desc: 'Spin & strip reveal', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same features, expression. Body unchanged — same height, weight, shape, proportions. Turn around slowly, clothes fall away during spin, full nude revealed, graceful. Zero changes to identity. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🌊 Wave Dance', desc: 'Body wave strip, locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same facial features, expression, age. Body unchanged — same shape, proportions, height, weight. Body wave dance, clothes slip off during movement, sensual, fluid motion, nude body revealed. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🚶 Standing Lift POV', desc: 'Lift & carry POV', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face unchanged — same person, same features, expression. Body unchanged — same height, weight, shape, proportions. Standing lift POV, being lifted up, intimate embrace, passionate, face visible. Zero changes to identity. NEGATIVE: different face, body change, different person, weight change, morph' },
  ],
  i2i: [
    { name: '🔥 Nude Transform', desc: 'Only remove dress, nothing else changes', prompt: 'remove dress, make it nude, keep everything else exactly the same — same face, same background, same pose, same expression, same lighting. Zero changes except removing clothes.' },
    { name: '👙 Bikini', desc: 'Bikini, face+body ZERO change', prompt: '⚠️ABSOLUTE IDENTITY LOCK⚠️ CRITICAL: Do NOT change face, eyes, nose, mouth, facial structure, expression. Do NOT change body shape, waist size, hip size, bust size, height, weight. Do NOT change skin tone, hair, age. ONLY change the clothes to a bikini/swimsuit. The person remains EXACTLY the same in every way — same body proportions, same face, same everything. Just wearing a different outfit. NEGATIVE: different face, changed features, different person, morphed face, body change, weight loss, weight gain, height change, skin change, different hair, age change, slimmer, fatter, taller, shorter' },
    { name: '💋 Lingerie', desc: 'Lingerie, face+body locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same eyes, nose, mouth, expression, age. Body must remain EXACTLY the same — same height, weight, shape, proportions, bust, hips, waist. Only change outfit to seductive lingerie. Zero physical changes to the person. NEGATIVE: different face, face change, morph, different person, body change, weight change, height change, skin change' },
    { name: '👗 Sundress', desc: 'Sundress, face+body locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same person, same facial features, same expression, same age. Body unchanged — same height, weight, shape, proportions. Only change clothing to a cute sundress. The person is 100% identical in every way. NEGATIVE: different face, body change, different person, age change, weight change, face morph' },
    { name: '👆 Topless', desc: 'Topless, face+body locked', prompt: '⚠️IDENTITY LOCK⚠️ CRITICAL: Do NOT change face, body shape, proportions, height, weight. Only remove top clothing to reveal breasts. Everything else about the person stays EXACTLY the same — same face, same body shape, same skin tone, same hair. NEGATIVE: different face, changed features, body change, different person, morph, distortion' },
    { name: '💋 Missionary Still', desc: 'Missionary still, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both faces must remain EXACTLY the same — same facial features, same expressions, same age, same identity. Bodies must remain EXACTLY the same — same height, weight, proportions. Only show missionary position sex scene. Zero changes to either person. NEGATIVE: different face, face change, morph, different people, body change, weight change, age change, distortion' },
    { name: '🐕 Doggy Still', desc: 'Doggy still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same facial features when visible. Body unchanged — same height, weight, shape, proportions. Only show doggy style position. The person is 100% identical. NEGATIVE: different face, body change, different person, weight change, height change' },
    { name: '👩 Cowgirl Still', desc: 'Cowgirl still, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Both faces unchanged — same people, same facial features, same expressions. Bodies unchanged — same height, weight, shape. Only show cowgirl position. Identity 100% preserved for both. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '🍑 Anal Still', desc: 'Anal still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same facial features, expression, age. Body unchanged — same shape, proportions, height, weight. Only show anal sex position. Person remains EXACTLY the same. NEGATIVE: different face, body change, different person, weight change, morph, distortion' },
    { name: '👄 Blowjob Still', desc: 'Oral still, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same eyes, nose, mouth, expression, age. Do NOT change face shape, features, or any detail. Body unchanged — same height, weight, proportions. Only show blowjob scene. NEGATIVE: different face, changed facial features, morph, different person, body change, weight change, age change' },
    { name: '👄 Double BJ Still', desc: 'Double oral still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Faces unchanged — same people, same facial features. Bodies unchanged — same proportions. Only show double blowjob scene. Identities 100% preserved. NEGATIVE: different face, morph, body change, different person, weight change' },
    { name: '✋ Handjob Still', desc: 'Handjob still, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same person, same features, same expression. Body unchanged — same shape, proportions. Only show handjob scene. Zero changes to the person. NEGATIVE: different face, body change, different person, morph' },
    { name: '🤚 Masturbation Still', desc: 'Solo still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same facial features, expression, age. Body unchanged — same height, weight, shape, proportions. Only show self-pleasure scene. Person remains 100% identical. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '👅 Cunnilingus Still', desc: 'Oral receiving still, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ Face unchanged — same person, same features, same expression of pleasure. Body unchanged — same height, weight, shape. Only show receiving oral scene. Zero changes. NEGATIVE: different face, body change, different person, weight change, morph' },
    { name: '👀 Spread Legs Still', desc: 'Legs spread still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same facial features, expression. Body unchanged — same shape, proportions, height, weight. Only show spread legs pose. Person 100% identical. NEGATIVE: different face, body change, different person, weight change' },
    { name: '🔗 Bondage Still', desc: 'Bondage still, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same person, same features. Body unchanged — same shape, proportions. Only add ropes/bondage. Zero changes to the person. NEGATIVE: different face, body change, different person, morph, distortion' },
    { name: '🌸 Spread Pussy Still', desc: 'Pussy spread still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged when visible. Body unchanged — same shape, proportions, skin tone. Only show spread pussy close-up. Person remains identical. NEGATIVE: different face, body change, different person, weight change' },
    { name: '💦 Facial Still', desc: 'Facial cumshot still, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Face must remain EXACTLY the same — same features, same face shape, same expression, same age. Only add cumshot on face. Zero changes to facial structure or features. NEGATIVE: different face, changed facial features, morph, different person, body change, age change' },
    { name: '💦 Body Cumshot Still', desc: 'Cum on body still, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same features. Body unchanged — same shape, proportions, skin tone. Only add cumshot on body. Person 100% identical. NEGATIVE: different face, body change, different person, morph' },
    { name: '🎪 Sex Mode Still', desc: 'Sex scene still, identity locked', prompt: '⚠️STRICT IDENTITY LOCK⚠️ CRITICAL: Both people unchanged — same faces, same bodies, same proportions. Only show sex scene. Identity 100% preserved for both. NEGATIVE: different face, different people, body change, morph, distortion, weight change' },
    { name: '🏙️ City Scene', desc: 'City background, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same features. Body unchanged — same proportions. Only change background to city street. Person remains 100% identical. NEGATIVE: different face, body change, different person, morph' },
    { name: '🏖️ Beach Scene', desc: 'Beach background, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same features, same expression. Body unchanged — same shape, proportions. Only change background to beach. Zero changes to person. NEGATIVE: different face, body change, different person, weight change, skin tone change' },
    { name: '🏠 Indoor Scene', desc: 'Indoor room, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same features. Body unchanged — same proportions. Only change background to indoor room. Person 100% identical. NEGATIVE: different face, body change, different person, morph' },
    { name: '🌙 Night Scene', desc: 'Night setting, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same features. Body unchanged — same shape, proportions. Only change scene to night time. Person remains identical. NEGATIVE: different face, body change, different person, morph' },
    { name: '🌲 Forest Scene', desc: 'Forest nature, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same features. Body unchanged — same proportions. Only change background to forest. Zero changes to person. NEGATIVE: different face, body change, different person' },
    { name: '🧍 Standing Pose', desc: 'Standing pose, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same features, same expression. Body unchanged — same shape, height, weight, proportions. Only change to standing pose. Person 100% identical. NEGATIVE: different face, body change, different person, height change, weight change' },
    { name: '🪑 Sitting Pose', desc: 'Sitting pose, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same features. Body unchanged — same shape, proportions. Only change to sitting pose. Person remains identical. NEGATIVE: different face, body change, different person' },
    { name: '🛌 Lying Pose', desc: 'Lying down, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Face unchanged — same features, same expression. Body unchanged — same shape, proportions. Only change to lying down pose. Zero changes. NEGATIVE: different face, body change, different person' },
    { name: '🙇 Kneeling Pose', desc: 'Kneeling pose, identity locked', prompt: '⚠️IDENTITY LOCK⚠️ Face unchanged — same person, same features. Body unchanged — same shape, proportions. Only change to kneeling pose. Person 100% identical. NEGATIVE: different face, body change, different person' },
    { name: '🔙 Back View', desc: 'Back view, identity locked', prompt: '⚠️STRICT IDENTITY⚠️ Body unchanged — same shape, proportions, height, weight, skin tone. Only show back view. Person remains 100% identical. NEGATIVE: different body, body change, different person, weight change, height change' },
  ],
};

// ─── DOM HELPERS ───
const $ = (id) => document.getElementById(id);

function getActiveTemplate(tab) {
  const el = document.querySelector(`#${tab}Templates .tmpl-btn.active`);
  return el ? el.dataset.prompt || '' : '';
}

function selectTemplate(tab, el) {
  document.querySelectorAll(`#${tab}Templates .tmpl-btn`).forEach((b) => b.classList.remove('active'));
  el.classList.add('active');
  state[tab].tmpl = el.dataset.prompt || '';
  const override = $(tab + 'OverridePrompt');
  if (override) {
    override.placeholder = `Default: ${(el.dataset.prompt || '').slice(0, 90)}...`;
    override.value = '';
  }
}

function renderTemplates() {
  const tpls = TEMPLATES || DEFAULT_TEMPLATES;
  ['i2v', 'i2i'].forEach((tab) => {
    const grid = $(tab + 'Templates');
    if (!grid) return;
    grid.innerHTML = '';
    tpls[tab].forEach((t) => {
      if (t.enabled === false) return; // Skip disabled templates
      const btn = document.createElement('div');
      btn.className = 'tmpl-btn';
      btn.dataset.prompt = t.prompt;
      btn.dataset.negativePrompt = t.negativePrompt || '';
      btn.innerHTML = `<span class="tn">${t.name}</span><span class="tt">${t.desc}</span>`;
      btn.addEventListener('click', () => selectTemplate(tab, btn));
      grid.appendChild(btn);
    });
    // Auto-select first
    const first = grid.querySelector('.tmpl-btn');
    if (first) selectTemplate(tab, first);
  });
}

// ─── TAB SWITCHING ───
function switchTab(name) {
  // Don't switch to disabled tools
  if (window.TOOL_CONFIG && window.TOOL_CONFIG[name] === false) return;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach((t) => t.classList.toggle('active', t.id === 'tab-' + name));
}

// ─── MODE SWITCHING ───
function setMode(tab, mode) {
  state[tab].mode = mode;
  document.querySelectorAll(`#mode${tab.toUpperCase()} .mode-btn`).forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  const tpl = $(tab + 'TemplateSection');
  const cst = $(tab + 'CustomSection');
  const ovr = $(tab + 'OverrideSection');
  if (tpl) tpl.style.display = mode === 'template' ? 'block' : 'none';
  if (cst) cst.style.display = mode === 'custom' ? 'block' : 'none';
  if (ovr) ovr.style.display = mode === 'template' ? 'block' : 'none';
}

// ─── TOAST ───
let toastTimer = null;
function showToast(msg, isError) {
  const t = $('toast');
  if (!t) return;
  clearTimeout(toastTimer);
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  toastTimer = setTimeout(() => { t.classList.remove('show'); }, 3500);
}

// ─── UPLOAD ───
['i2v', 'i2i'].forEach((tab) => {
  const fileInput = $(tab + 'File');
  const uploadArea = $(tab + 'Upload');
  if (!fileInput || !uploadArea) return;

  // Click upload area → open file picker
  uploadArea.addEventListener('click', () => fileInput.click());

  // Click preview → re-open file picker (re-upload)
  const previewWrap = $(tab + 'PreviewWrap');
  const preview = $(tab + 'Preview');
  if (previewWrap) previewWrap.addEventListener('click', () => fileInput.click());
  if (preview) preview.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    // Show preview below upload area using FileReader (more reliable)
    const previewWrap = $(tab + 'PreviewWrap');
    const preview = $(tab + 'Preview');
    const placeholder = $(tab + 'Placeholder');
    placeholder.style.display = 'none';
    uploadArea.classList.add('has-img');
    previewWrap.style.display = 'block';
    
    // Read file as DataURL for reliable preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
    };
    reader.readAsDataURL(f);

    const btn = $(tab + 'Btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Uploading...';

    try {
      const fd = new FormData();
      fd.append('file', f);
      const r = await fetch('/api/upload/ugc', { method: 'POST', body: fd });

      // Safe JSON parse
      let d;
      try { d = await r.json(); } catch { throw new Error('Invalid upload response'); }

      if (d && d.success) {
        const url = typeof d.data === 'string' ? d.data : (d.data?.url || '');
        if (url) {
          state[tab].uploadedUrl = url;
          btn.disabled = false;
          btn.textContent = tab === 'i2v' ? '🎬 Generate Video (5s)' : '🎨 Generate Image';
          showToast('✅ Image uploaded!');
          return;
        }
      }
      // Fallback
      throw new Error(d?.message || 'Upload failed');
    } catch (e) {
      // Data URL fallback
      const reader = new FileReader();
      reader.onload = (ev) => {
        state[tab].uploadedUrl = ev.target.result;
        btn.disabled = false;
        btn.textContent = tab === 'i2v' ? '🎬 Generate Video (5s)' : '🎨 Generate Image';
        showToast('⚠️ Using local upload', true);
      };
      reader.readAsDataURL(f);
    }
  });
});

// ─── SAFE FETCH (no "Unexpected token" crashes) ───
async function safeFetch(url, options) {
  try {
    const r = await fetch(url, options);
    const text = await r.text();
    try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
    catch { return { ok: false, status: r.status, data: null, raw: text }; }
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message };
  }
}

// ─── GENERATE ───
$('i2vBtn')?.addEventListener('click', () => generate('i2v', 'video'));
$('i2iBtn')?.addEventListener('click', () => generate('i2i', 'image'));
$('t2iBtn')?.addEventListener('click', () => generateT2I());

async function generate(tab, type) {
  if (state[tab].generating) return;
  const s = state[tab];
  if (type !== 't2i' && !s.uploadedUrl) {
    showToast('📸 Upload an image first', true);
    return;
  }

  // Build prompt
  let prompt;
  if (s.mode === 'template') {
    const override = $(tab + 'OverridePrompt');
    prompt = (override?.value || '').trim() || getActiveTemplate(tab);
    if (!prompt) { showToast('📝 Select a template or write a prompt', true); return; }
  } else {
    const custom = $(tab + 'CustomPrompt');
    prompt = (custom?.value || '').trim();
    if (!prompt) { showToast('📝 Enter a prompt', true); return; }
  }

  // Negative prompt (from input OR from template)
  let negative = ($(tab + 'Negative')?.value || '').trim() || undefined;
  if (!negative && s.mode === 'template') {
    const activeEl = document.querySelector(`#${tab}Templates .tmpl-btn.active`);
    if (activeEl && activeEl.dataset.negativePrompt) {
      negative = activeEl.dataset.negativePrompt || undefined;
    }
  }

  s.generating = true;
  const btn = $(tab + 'Btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating...';

  showProgress(tab, type === 'video' ? '🎬 Generating Video...' : '🎨 Generating Image...', 5, 'Starting AI...');

  // Save ALL params BEFORE API call (survives refresh!)
  savePreGen({
    tab: tab,
    type: type,
    prompt: prompt,
    negativePrompt: negative || '',
    imageUrl: s.uploadedUrl || '',
    mode: s.mode || 'template',
    jobId: null, // Will be filled after API call
    timestamp: Date.now()
  });

  try {
    let jobId;
    if (type === 'video') {
      const r = await safeFetch('/api/chat/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: s.uploadedUrl,
          durationSeconds: 5,
          prompt,
          ...(negative ? { negativePrompt: negative } : {}),
        }),
      });
      if (!r.ok || !r.data) throw new Error(r.data?.message || r.raw || 'Video generation failed');
      if (!r.data.success) throw new Error(r.data.message || 'Video API error');
      jobId = r.data.taskId || r.data.data?.taskId || r.data.data?.id || r.data.id;
      if (!jobId) throw new Error('No task ID: ' + JSON.stringify(r.data).slice(0, 100));
      s.jobId = jobId;
      saveJob(jobId, tab, prompt);
      // Update preGen with real job ID
      const pg = restorePreGen();
      if (pg) savePreGen({ ...pg, jobId: jobId });
      updateProgress(tab, 10, '🎬 AI rendering...', `Task: ${jobId.slice(0, 12)}...`);
      await pollVideo(jobId, tab);
    } else {
      // Image generation
      const payload = { prompt, operation: 'generate' };
      if (s.uploadedUrl) payload.inputImages = [s.uploadedUrl];
      if (negative) payload.negativePrompt = negative;

      const r = await safeFetch('/api/chat/image/async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok || !r.data) throw new Error(r.data?.message || r.raw || 'Image generation failed');

      let imageId = r.data.imageId || r.data.data?.imageId || r.data.data?.id || r.data.id || r.data.taskId || r.data.data?.taskId;
      if (!imageId) throw new Error('No image ID: ' + JSON.stringify(r.data).slice(0, 100));
      s.jobId = imageId;
      saveJob(imageId, tab, prompt);
      // Update preGen with real job ID
      const pg = restorePreGen();
      if (pg) savePreGen({ ...pg, jobId: imageId });
      updateProgress(tab, 10, '🎨 AI working...', `ID: ${imageId.slice(0, 12)}...`);
      await pollImage(imageId, tab);
    }
  } catch (e) {
    showError(tab, e.message || 'Generation failed');
    showToast('❌ ' + (e.message || 'Error'), true);
  }

  s.generating = false;
  btn.disabled = false;
  btn.textContent = tab === 'i2v' ? '🎬 Generate Video (5s)' : '🎨 Generate Image';
}

async function generateT2I() {
  if (state.t2i.generating) return;
  const prompt = ($('t2iPrompt')?.value || '').trim();
  if (!prompt) { showToast('📝 Enter a prompt', true); return; }
  const negative = ($('t2iNegative')?.value || '').trim() || undefined;

  state.t2i.generating = true;
  const btn = $('t2iBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating...';

  showProgress('t2i', '🖼️ Generating Image...', 5, 'Starting AI...');

  // Save ALL params BEFORE API call (survives refresh!)
  savePreGen({
    tab: 't2i',
    type: 'image',
    prompt: prompt,
    negativePrompt: negative || '',
    imageUrl: '',
    mode: 'custom',
    jobId: null,
    timestamp: Date.now()
  });

  try {
    const r = await safeFetch('/api/chat/image/async', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, operation: 'generate', ...(negative ? { negativePrompt: negative } : {}) }),
    });
    if (!r.ok || !r.data) throw new Error(r.data?.message || r.raw || 'Generation failed');

    let imageId = r.data.imageId || r.data.data?.imageId || r.data.data?.id || r.data.id || r.data.taskId || r.data.data?.taskId;
    if (!imageId) throw new Error('No image ID: ' + JSON.stringify(r.data).slice(0, 100));
    state.t2i.jobId = imageId;
    saveJob(imageId, 't2i', prompt);
    const pg = restorePreGen();
    if (pg) savePreGen({ ...pg, jobId: imageId });
    updateProgress('t2i', 10, '🖼️ AI working...', `ID: ${imageId.slice(0, 12)}...`);
    await pollImage(imageId, 't2i');
  } catch (e) {
    showError('t2i', e.message || 'Generation failed');
    showToast('❌ ' + (e.message || 'Error'), true);
  }

  state.t2i.generating = false;
  btn.disabled = false;
  btn.textContent = '✨ Generate Image';
}

// ─── POLLING ───
async function pollImage(imageId, tab) {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(2000);
    const r = await safeFetch('/api/images/' + imageId);
    if (!r.data) continue;

    const imgData = r.data.data?.image || r.data.data || r.data;
    const status = imgData.generationStatus || imgData.status || '';
    const url = imgData.imageUrl || imgData.url || '';

    if (url && url.length > 15) {
      updateProgress(tab, 100, '✅ Complete!', '');
      await sleep(300);
      showResult(tab, url, false);
      removeJob(imageId);
      addHistory(imageId, tab, '', url, false);
      clearPreGen();
      showToast('✅ Image ready!');
      return;
    }
    if (status === 'completed') {
      if (url && url.length > 15) {
        updateProgress(tab, 100, '✅ Complete!', '');
        await sleep(300);
        showResult(tab, url, false);
        removeJob(imageId);
        showToast('✅ Image ready!');
        return;
      }
      // URL might not be ready; keep polling
    }
    if (status === 'failed') {
      throw new Error(imgData.generationErrorMessage || imgData.error || 'Generation failed');
    }

    const prog = imgData.progressPercent || Math.min(95, 10 + Math.floor(i * 1.5));
    updateProgress(tab, prog, status === 'generating' ? '🎨 Generating...' : '⏳ Processing...', `Poll ${i + 1}`);
  }
  throw new Error('Timeout — generation took too long');
}

async function pollVideo(taskId, tab) {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(2000);
    const r = await safeFetch('/api/chat/video/' + taskId);
    if (!r.data) continue;

    const vd = r.data.data || r.data;
    const status = vd.status || '';
    const url = vd.videoUrl || vd.url || '';

    if ((status === 'completed' || url) && url && url.length > 15) {
      updateProgress(tab, 100, '✅ Complete!', '');
      await sleep(300);
      showResult(tab, url, true);
      removeJob(taskId);
      addHistory(taskId, tab, '', url, true);
      clearPreGen();
      showToast('✅ Video ready!');
      return;
    }
    if (status === 'failed') {
      clearPreGen();
      throw new Error(vd.error || vd.message || 'Video generation failed');
    }

    const prog = vd.progressPercent || Math.min(95, 10 + Math.floor(i * 3));
    updateProgress(tab, prog, status === 'generating' ? '🎬 GPU rendering...' : '⏳ Processing...', `GPU: ${vd.progressStage || 'processing'} | ${i + 1}s`);
  }
  throw new Error('Timeout — video took too long');
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── LOCALSTORAGE RESUME ───
function saveJob(jobId, tab, prompt) {
  try {
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    jobs.unshift({ id: jobId, tab, prompt, timestamp: Date.now() });
    while (jobs.length > 20) jobs.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) { /* ignore quota errors */ }
}

function removeJob(jobId) {
  try {
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.filter((j) => j.id !== jobId)));
  } catch (e) { /* ignore */ }
}

// ─── PRE-GENERATION SAVE (saves BEFORE API call) ───
function savePreGen(params) {
  try {
    const data = { ...params, savedAt: Date.now() };
    localStorage.setItem(SAVED_GEN_KEY, JSON.stringify(data));
    console.log('[Resume] savePreGen:', data.type || data.tab, '| jobId:', data.jobId || 'null', '| hasImage:', !!data.imageUrl, '| prompt:', (data.prompt||'').slice(0,30));
  } catch (e) { console.warn('[Resume] savePreGen quota error:', e); }
}
function clearPreGen() {
  try {
    console.log('[Resume] clearPreGen — removing saved generation');
    localStorage.removeItem(SAVED_GEN_KEY);
  } catch {}
}
function restorePreGen() {
  try {
    console.log('[Resume] restorePreGen — checking localStorage...');
    const d = JSON.parse(localStorage.getItem(SAVED_GEN_KEY) || 'null');
    if (d && Date.now() - (d.savedAt || 0) < 7200000) {
      console.log('[Resume] restorePreGen — FOUND:', d.type || d.tab, '| jobId:', d.jobId || 'null', '| age:', Math.round((Date.now() - (d.savedAt||0))/1000)+'s');
      return d;
    }
    console.log('[Resume] restorePreGen — NOT FOUND or expired');
  } catch (e) { console.warn('[Resume] restorePreGen error:', e); }
  return null;
}

// ─── JOB HISTORY ───
function addHistory(jobId, tab, prompt, resultUrl, isVideo) {
  try {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    hist.unshift({
      id: jobId, tab, prompt, resultUrl, isVideo,
      timestamp: Date.now(),
    });
    while (hist.length > MAX_HISTORY) hist.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  } catch (e) { /* ignore quota */ }
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderSidebar();
}

let sidebarOpen = false;
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = $('sidebar');
  const overlay = $('sidebarOverlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle('open', sidebarOpen);
  overlay.classList.toggle('open', sidebarOpen);
  if (sidebarOpen) renderSidebar();
  // Prevent body scroll when sidebar open
  document.body.style.overflow = sidebarOpen ? 'hidden' : '';
}

function histThumbFallback(el) {
  try {
    const d = document.createElement('div');
    d.className = 'hist-thumb';
    d.style.background = 'rgba(168,85,247,0.15)';
    d.style.display = 'flex';
    d.style.alignItems = 'center';
    d.style.justifyContent = 'center';
    d.style.fontSize = '16px';
    d.textContent = '🖼️';
    el.replaceWith(d);
  } catch (e) {}
}

// Retry thumbnail with a FRESH signed URL from the image id (old links expire after 1h)
async function histThumbRetry(el, id) {
  if (!el || !id) return histThumbFallback(el);
  try {
    const r = await safeFetch('/api/images/' + id);
    const imgData = r.data?.data?.image || r.data?.data || r.data;
    const url = imgData.imageUrl || imgData.url || '';
    if (url && url.length > 15) {
      el.src = proxyMedia(url);
      el.onerror = null;
      return;
    }
  } catch (e) {}
  histThumbFallback(el);
}

// Open preview using a FRESH url fetched by image id (old links expire after 1h)
async function openPreviewById(url, isVideo, id) {
  let finalUrl = url;
  if (id) {
    try {
      const r = await safeFetch('/api/images/' + id);
      const imgData = r.data?.data?.image || r.data?.data || r.data;
      const fresh = (isVideo ? (imgData.videoUrl || imgData.url) : (imgData.imageUrl || imgData.url)) || '';
      if (fresh && fresh.length > 15) finalUrl = fresh;
    } catch (e) {}
  }
  openPreview(finalUrl, isVideo);
}

function renderSidebar() {
  const list = $('sidebarList');
  const empty = $('sidebarEmpty');
  if (!list || !empty) return;
  const items = loadHistory();
  if (!items.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = items.map((item) => {
    const icon = item.isVideo ? '🎬' : '🖼️';
    const label = item.isVideo ? 'Video' : 'Image';
    const time = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
    const prompt = (item.prompt || '').slice(0, 50);
    const url = item.resultUrl || '';
    const id = item.id || '';
    const thumb = item.isVideo
      ? `<div class="hist-thumb" style="background:linear-gradient(135deg,#a855f7,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:16px">🎬</div>`
      : `<img class="hist-thumb" data-id="${id}" src="${proxyMedia(url).replace(/"/g, '&quot;')}" loading="lazy" onerror="histThumbRetry(this,'${id.replace(/'/g, "\\'")}')">`;
    return `<div class="hist-item" onclick="openPreviewById('${url.replace(/'/g, "\\'")}',${item.isVideo},'${id.replace(/'/g, "\\'")}')">
      ${thumb}
      <div class="hist-body">
        <div class="hist-label">${label} · ${(item.tab||'').toUpperCase()}</div>
        <div class="hist-prompt">${prompt}${(item.prompt||'').length > 50 ? '…' : ''}</div>
        <div class="hist-time">${time}</div>
      </div>
    </div>`;
  }).join('');
}

async function initResumeSystem() {
  console.log('\n[Resume] ===== INIT RESUME SYSTEM =====');
  console.log('[Resume] Checking localStorage...');
  console.log('[Resume]   active_jobs:', localStorage.getItem(STORAGE_KEY));
  console.log('[Resume]   pre_gen_data:', localStorage.getItem(SAVED_GEN_KEY));
  console.log('[Resume]   history:', localStorage.getItem(HISTORY_KEY));
  try {
    // ─── Load & filter active jobs ───
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const recent = jobs.filter((j) => Date.now() - (j.timestamp || 0) < 7200000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    console.log('[Resume] Active jobs found:', recent.length, '| Filtered from:', jobs.length);

    // ─── Load pre-generated data ───
    const preGen = restorePreGen();
    console.log('[Resume] preGen data:', preGen ? 'EXISTS' : 'null');
    if (preGen) {
      console.log('[Resume]   tab:', preGen.tab, '| type:', preGen.type);
      console.log('[Resume]   jobId:', preGen.jobId || 'null (API call was interrupted!)');
      console.log('[Resume]   hasImage:', !!preGen.imageUrl, '| hasPrompt:', !!preGen.prompt);
      console.log('[Resume]   savedAt:', new Date(preGen.savedAt).toISOString());
    }

    // ─── Nothing to resume? Exit ───
    if (!recent.length && !preGen) {
      console.log('[Resume] Nothing to resume. Exiting.');
      return;
    }

    const banner = $('resumeBanner');
    const status = $('resumeStatus');
    if (!banner || !status) {
      console.warn('[Resume] Banner/status elements missing from DOM!');
      return;
    }
    banner.classList.add('active');
    let hadActiveJob = false;

    // ===== Phase 1: Resume active jobs (have taskId) =====
    console.log('[Resume] Phase 1 — Active jobs:', recent.length);
    for (const job of recent) {
      console.log('[Resume] → Processing active job:', job.id.slice(0, 16), '| tab:', job.tab);
      const tab = job.tab;
      if (!tab) continue;
      status.textContent = `⏳ Resuming ${tab.toUpperCase()}... ${job.id.slice(0, 12)}`;
      hadActiveJob = true;

      if (tab === 'i2v') {
        console.log('[Resume]   Checking video status...');
        const r = await safeFetch('/api/chat/video/' + job.id);
        if (!r.data) {
          console.log('[Resume]   ⚠️ Video API returned no data — keeping job for next refresh');
          continue;
        }
        const vd = r.data.data || r.data;
        const url = vd.videoUrl || vd.url || '';
        const statusText = vd.status || 'unknown';
        console.log('[Resume]   Video status:', statusText, '| url:', url ? 'ready' : 'pending');
        
        if (url && url.length > 15) {
          console.log('[Resume]   ✅ Video complete! Showing result...');
          switchTab('i2v');
          showResult('i2v', url, true);
          removeJob(job.id);
          addHistory(job.id, tab, job.prompt||'', url, true);
          status.textContent = `✅ Video ready!`;
          continue;
        }
        if (statusText === 'generating' || statusText === 'pending' || !statusText) {
          console.log('[Resume]   ⏳ Video still processing — polling...');
          switchTab('i2v');
          showProgress('i2v', '🎬 Resuming video...', 15, '');
          status.textContent = `⏳ Video processing...`;
          pollVideo(job.id, 'i2v').then(() => {
            console.log('[Resume]   ✅ Video polling complete!');
            removeJob(job.id);
            banner.classList.remove('active');
          }).catch(() => {
            console.log('[Resume]   ⚠️ Video polling failed');
          });
          continue;
        }
        if (statusText === 'failed' || statusText === 'completed') {
          console.log('[Resume]   ⚠️ Video ended (failed/completed without URL) — removing job');
          removeJob(job.id);
        }
      } else {
        console.log('[Resume]   Checking image status...');
        const r = await safeFetch('/api/images/' + job.id);
        if (!r.data) {
          console.log('[Resume]   ⚠️ Image API returned no data — keeping job for next refresh');
          continue;
        }
        const imgData = r.data.data?.image || r.data.data || r.data;
        const url = imgData.imageUrl || imgData.url || '';
        const statusText = imgData.generationStatus || imgData.status || '';
        console.log('[Resume]   Image status:', statusText, '| url:', url ? 'ready' : 'pending');
        
        if (url && url.length > 15) {
          console.log('[Resume]   ✅ Image complete! Showing result...');
          switchTab(tab);
          showResult(tab, url, false);
          removeJob(job.id);
          addHistory(job.id, tab, job.prompt||'', url, false);
          status.textContent = `✅ Image ready!`;
          continue;
        }
        if (statusText === 'generating' || statusText === 'pending' || !statusText) {
          console.log('[Resume]   ⏳ Image still rendering — polling...');
          switchTab(tab);
          showProgress(tab, '🖼️ Resuming...', 15, '');
          status.textContent = `⏳ Image rendering...`;
          pollImage(job.id, tab).then(() => {
            console.log('[Resume]   ✅ Image polling complete!');
            removeJob(job.id);
            banner.classList.remove('active');
          }).catch(() => {
            console.log('[Resume]   ⚠️ Image polling failed');
          });
          continue;
        }
        if (statusText === 'failed') {
          console.log('[Resume]   ⚠️ Image generation failed — removing job');
          removeJob(job.id);
        }
      }
    }

    // ===== Phase 2: Resume from preGen data (survives refresh during API call) =====
    console.log('[Resume] Phase 2 — preGen exists:', !!preGen, '| hadActiveJob:', hadActiveJob);
    if (preGen && !hadActiveJob) {
      const pTab = preGen.tab || 'i2v';
      const pType = preGen.type || (pTab === 'i2v' ? 'video' : 'image');
      console.log('[Resume] → Using preGen data: tab=', pTab, 'type=', pType);
      
      // ─── Case A: preGen has a taskId → poll for result ───
      if (preGen.jobId) {
        console.log('[Resume]   ✅ Case A: jobId exists — polling:', preGen.jobId.slice(0, 16));
        status.textContent = `⏳ Restoring ${pTab.toUpperCase()} from saved state...`;
        hadActiveJob = true;
        if (pType === 'video') {
          showProgress(pTab, '🔄 Restoring video...', 10, '');
          pollVideo(preGen.jobId, pTab).then(() => {
            console.log('[Resume]   ✅ Video restored! Clearing preGen.');
            removeJob(preGen.jobId); clearPreGen();
            banner.classList.remove('active');
          }).catch(() => {
            console.log('[Resume]   ⚠️ Video restore polling failed');
          });
        } else {
          showProgress(pTab, '🔄 Restoring image...', 10, '');
          pollImage(preGen.jobId, pTab).then(() => {
            console.log('[Resume]   ✅ Image restored! Clearing preGen.');
            removeJob(preGen.jobId); clearPreGen();
            banner.classList.remove('active');
          }).catch(() => {
            console.log('[Resume]   ⚠️ Image restore polling failed');
          });
        }
        
      // ─── Case B: preGen has NO taskId → API call was interrupted, re-submit ───
      } else if (preGen.prompt && (preGen.imageUrl || preGen.tab === 't2i')) {
        console.log('[Resume]   🔥 Case B: NO jobId — API call was interrupted! Re-submitting...');
        console.log('[Resume]     imageUrl:', preGen.imageUrl.slice(0, 60));
        console.log('[Resume]     prompt:', (preGen.prompt||'').slice(0, 60));
        status.textContent = `⏳ Re-submitting ${pTab.toUpperCase()} generation...`;
        hadActiveJob = true;
        showProgress(pTab, '🔄 Re-submitting generation...', 5, '');
        
        const imgUrl = preGen.imageUrl || '';
        const prompt = preGen.prompt || '';
        const negPrompt = preGen.negativePrompt || undefined;
        
        try {
          let newJobId;
          if (pType === 'video') {
            console.log('[Resume]   📡 Calling /api/chat/video...');
            const r = await safeFetch('/api/chat/video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrl: imgUrl,
                durationSeconds: 5,
                prompt,
                ...(negPrompt ? { negativePrompt: negPrompt } : {}),
              }),
            });
            if (r.data && r.data.success) {
              newJobId = r.data.taskId || r.data.data?.taskId || r.data.data?.id || r.data.id;
              console.log('[Resume]   ✅ Video re-submitted! newJobId:', newJobId);
            } else {
              console.log('[Resume]   ⚠️ Video re-submit failed:', r.data?.message || 'no data');
            }
          } else {
            console.log('[Resume]   📡 Calling /api/chat/image/async...');
            const r = await safeFetch('/api/chat/image/async', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt,
                operation: 'generate',
                ...(imgUrl ? { inputImages: [imgUrl] } : {}),
                ...(negPrompt ? { negativePrompt: negPrompt } : {}),
              }),
            });
            if (r.data && r.data.success) {
              newJobId = r.data.imageId || r.data.data?.imageId || r.data.data?.id || r.data.id || r.data.taskId || r.data.data?.taskId;
              console.log('[Resume]   ✅ Image re-submitted! newJobId:', newJobId);
            } else {
              console.log('[Resume]   ⚠️ Image re-submit failed:', r.data?.message || 'no data');
            }
          }
          
          if (newJobId) {
            console.log('[Resume]   💾 Saving new jobId and starting poll...');
            saveJob(newJobId, pTab, prompt);
            savePreGen({ ...preGen, jobId: newJobId });
            updateProgress(pTab, 10, '✅ Re-submitted! Polling...', '');
            if (pType === 'video') {
              pollVideo(newJobId, pTab).then(() => { removeJob(newJobId); clearPreGen(); banner.classList.remove('active'); }).catch(() => {});
            } else {
              pollImage(newJobId, pTab).then(() => { removeJob(newJobId); clearPreGen(); banner.classList.remove('active'); }).catch(() => {});
            }
          } else {
            console.log('[Resume]   ❌ Re-submit failed to get newJobId. Clearing preGen.');
            status.textContent = `❌ Could not re-submit ${pTab.toUpperCase()}. Try again manually.`;
            clearPreGen();
            setTimeout(() => banner.classList.remove('active'), 4000);
          }
        } catch (e) {
          console.log('[Resume]   ❌ Re-submit threw error:', e.message);
          status.textContent = `❌ Re-submit failed. Try again.`;
          clearPreGen();
          setTimeout(() => banner.classList.remove('active'), 4000);
        }
      } else {
        console.log('[Resume]   ⚠️ preGen exists but incomplete — missing imageUrl or prompt');
        console.log('[Resume]     imageUrl:', !!preGen.imageUrl, '| prompt:', !!preGen.prompt);
        clearPreGen();
      }
    } else if (preGen && hadActiveJob) {
      console.log('[Resume]   ℹ️ preGen exists but already handling an active job — skipping preGen');
    }

    if (!hadActiveJob) {
      console.log('[Resume] No active jobs — hiding banner in 2s');
      setTimeout(() => banner.classList.remove('active'), 2000);
    } else {
      console.log('[Resume] Active job(s) running — keeping banner visible');
    }
    console.log('[Resume] ===== RESUME INIT COMPLETE =====\n');
  } catch (e) {
    console.log('[Resume] ❌ Fatal error:', e.message, e.stack);
  }
}

// ─── UI HELPERS ───
function showProgress(tab, title, pct, label) {
  [tab + 'Progress', tab + 'Result', tab + 'Error'].forEach((id) => $(id)?.classList.remove('active'));
  const p = $(tab + 'Progress');
  if (p) p.classList.add('active');
  const t = $(tab + 'ProgTitle');
  if (t) t.textContent = title;
  const pctEl = $(tab + 'ProgPct');
  if (pctEl) pctEl.textContent = pct + '%';
  const l = $(tab + 'ProgLabel');
  if (l) l.textContent = label;
  const bar = $(tab + 'ProgBar');
  if (bar) bar.style.width = pct + '%';
  const st = $(tab + 'ProgStatus');
  if (st) st.textContent = '⏳ Working...';
}

function updateProgress(tab, pct, title, label) {
  const pctEl = $(tab + 'ProgPct');
  if (pctEl) pctEl.textContent = pct + '%';
  const bar = $(tab + 'ProgBar');
  if (bar) bar.style.width = pct + '%';
  if (title) { const t = $(tab + 'ProgTitle'); if (t) t.textContent = title; }
  if (label) { const s = $(tab + 'ProgStatus'); if (s) s.textContent = label; }
}

function showResult(tab, url, isVideo) {
  const res = $(tab + 'Result');
  if (res) res.classList.add('active');
  const prev = $(tab + 'ResultPreview');
  if (prev) {
    prev.innerHTML = isVideo
      ? `<video src="${url}" controls autoplay loop muted playsinline></video>`
      : `<img src="${url}" alt="Generated">`;
  }
  const title = $(tab + 'ResultTitle');
  if (title) title.textContent = isVideo ? '✅ Video Generated!' : '✅ Image Generated!';
  const p = $(tab + 'Progress');
  if (p) p.classList.remove('active');
}

function showError(tab, msg) {
  const err = $(tab + 'Error');
  if (err) {
    err.textContent = msg;
    err.classList.add('active');
  }
  [tab + 'Progress', tab + 'Result'].forEach((id) => $(id)?.classList.remove('active'));
  setTimeout(() => { if (err) err.classList.remove('active'); }, 8000);
}

function downloadResult(tab) {
  const prev = $(tab + 'ResultPreview');
  if (!prev) return;
  const el = prev.querySelector('img') || prev.querySelector('video');
  if (!el || !el.src) return;
  const a = document.createElement('a');
  a.href = el.src;
  a.download = tab === 'i2v' ? 'unsensor_video.mp4' : 'unsensor_image.png';
  a.click();
  showToast('⬇️ Downloading...');
}

function resetTab(tab) {
  state[tab].uploadedUrl = '';
  state[tab].jobId = null;
  state[tab].generating = false;
  const fi = $(tab + 'File');
  if (fi) fi.value = '';
  const pw = $(tab + 'PreviewWrap');
  if (pw) pw.style.display = 'none';
  const pv = $(tab + 'Preview');
  if (pv) pv.src = '';
  const ph = $(tab + 'Placeholder');
  if (ph) ph.style.display = 'block';
  const ua = $(tab + 'Upload');
  if (ua) ua.classList.remove('has-img');
  [tab + 'Progress', tab + 'Result', tab + 'Error'].forEach((id) => $(id)?.classList.remove('active'));
  const btn = $(tab + 'Btn');
  if (btn) {
    btn.disabled = tab !== 't2i';
    if (tab === 'i2v') btn.textContent = '🎬 Generate Video (5s)';
    else if (tab === 'i2i') btn.textContent = '🎨 Generate Image';
    else btn.textContent = '✨ Generate Image';
  }
}

// ─── RESOLUTION SELECTOR ───
// For T2I, we send width/height based on selection
function getResolution(selectId) {
  const sel = $(selectId);
  if (!sel) return { width: 1024, height: 1024 };
  const parts = sel.value.split('x');
  return { width: parseInt(parts[0]) || 1024, height: parseInt(parts[1]) || 1024 };
}

// ─── PREVIEW MODAL ───
// Media shown directly (no proxy) — original links work, old R2 links may expire.
function proxyMedia(url) {
  return url;
}

// Reliable cross-origin download: fetch via our server-side proxy, then save as blob.
async function downloadMedia(url, name) {
  try {
    showToast('⬇️ Downloading...');
    const res = await fetch('/api/download?url=' + encodeURIComponent(url));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
    showToast('✅ Downloaded');
  } catch (e) {
    showToast('❌ Download failed: ' + e.message);
    window.open(url, '_blank');
  }
}

function openPreview(url, isVideo) {
  const modal = $('previewModal');
  const body = $('modalBody');
  const title = $('modalTitle');
  if (!modal || !body) return;
  // Safety: only https URLs
  if (!url || !url.startsWith('https://')) return;
  
  const purl = proxyMedia(url);                   // inline preview (original url)
  title.textContent = isVideo ? '🎬 Video Preview' : '🖼️ Image Preview';
  const mediaTag = isVideo
    ? `<video src="${purl}" controls autoplay loop muted playsinline></video>`
    : `<img src="${purl}" alt="Preview">`;
  const dlName = isVideo ? 'unsensor_video.mp4' : 'unsensor_image.jpg';
  body.innerHTML = `${mediaTag}
    <div class="modal-actions">
      <button class="modal-dl" onclick="downloadMedia('${purl.replace(/'/g, "\\'")}','${dlName}')">⬇️ Download</button>
    </div>`;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  const modal = $('previewModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  const body = $('modalBody');
  if (body) body.innerHTML = '';
}

// Escape key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePreview();
});

// ─── INIT TEMPLATES (load from Firebase, fallback to hardcoded) ───
async function initTemplates() {
  try {
    const resp = await fetch(TEMPLATES_FIREBASE_URL);
    const data = await resp.json();
    if (data && data.i2v && data.i2v.length > 0 && data.i2i && data.i2i.length > 0) {
      TEMPLATES = data;
      // Backward compat: ensure enabled field
      Object.keys(TEMPLATES).forEach(cat => {
        TEMPLATES[cat].forEach(t => { if (t.enabled === undefined) t.enabled = true; });
      });
      console.log('✅ Templates loaded from Firebase:', data.i2v.length + ' i2v, ' + data.i2i.length + ' i2i');
      return;
    }
  } catch(e) {
    console.warn('⚠️ Firebase templates load failed:', e.message);
  }
  // Fallback: use hardcoded defaults + seed to Firebase
  TEMPLATES = DEFAULT_TEMPLATES;
  // Add enabled field to defaults
  Object.keys(TEMPLATES).forEach(cat => {
    TEMPLATES[cat].forEach(t => { t.enabled = true; });
  });
  // Seed Firebase with defaults for the admin panel
  try {
    const obj = {};
    Object.keys(DEFAULT_TEMPLATES).forEach((k, i) => { obj[k] = DEFAULT_TEMPLATES[k]; });
    await fetch(TEMPLATES_FIREBASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });
    console.log('🌱 Seeded Firebase with default templates');
  } catch(e) {
    console.warn('⚠️ Firebase seed failed:', e.message);
  }
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', async () => {
  await initTemplates();
  renderTemplates();
  setTimeout(initResumeSystem, 500);
  console.log('✦ UNSENSOR STUDIO loaded');
});
