/* =============================================
   BUILDER.JS – Live Resume Builder Logic
   ============================================= */

'use strict';

/* ---- State ---- */
const state = {
    currentStep: 1,
    totalSteps: 5,
    techSkills: [],
    softSkills: [],
    langSkills: [],
    targetRole: '',
    targetCompany: '',
    template: 'dublin'
};

const ROLE_KEYWORDS = {
    sde: ['python', 'javascript', 'react', 'java', 'c++', 'aws', 'cloud', 'api', 'backend', 'frontend', 'database', 'git', 'ci/cd', 'docker', 'kubernetes', 'microservices', 'typescript', 'node', 'sql', 'nosql', 'unit testing', 'agile'],
    ds: ['python', 'r', 'sql', 'statistics', 'machine learning', 'ml', 'ai', 'data visualization', 'tableau', 'modeling', 'pandas', 'spark', 'tensorflow', 'pytorch', 'scikit-learn', 'deep learning', 'nlp', 'big data', 'hadoop'],
    pm: ['roadmap', 'stakeholder', 'agile', 'scrum', 'user stories', 'product lifecycle', 'market research', 'analytics', 'kpi', 'strategy', 'backlog', 'prioritization', 'a/b testing', 'wireframing', 'mvp', 'go-to-market'],
    marketing: ['seo', 'sem', 'content strategy', 'social media', 'google analytics', 'copywriting', 'campaign', 'conversion', 'crm', 'email marketing', 'ppc', 'brand identity', 'influencer', 'market segmentation'],
    consultant: ['strategy', 'framework', 'problem solving', 'case study', 'governance', 'transformation', 'stakeholder management', 'efficiency', 'benchmarking', 'gap analysis', 'operational excellence', 'change management'],
    ib: ['financial modeling', 'valuation', 'excel', 'mergers', 'acquisitions', 'm&a', 'due diligence', 'capital markets', 'lbo', 'ipo', 'dcf', 'comparable analysis', 'pitch deck', 'equity research']
};

const COMPANY_TIPS = {
    google: "Google values technical depth and 'Googliness' (collaboration). Stress your algorithmic problem-solving.",
    meta: "Meta moves fast. Highlight your ability to ship quickly and use data/metrics for every decision.",
    amazon: "Focus on Amazon's 14 Leadership Principles—especially 'Customer Obsession' and 'Deliver Results'.",
    apple: "Design and detail matter at Apple. Keep your layout minimalist and your descriptions precise.",
    bcg: "Consulting firms look for MECE frameworks. Ensure your bullet points follow a logical structure.",
    jpm: "Finance roles require absolute precision. Double-check all numbers and use standard banking terminology."
};

/* ============================================================
   STEP NAVIGATION
   ============================================================ */
function changeStep(direction) {
    const newStep = state.currentStep + direction;
    if (newStep < 1 || newStep > state.totalSteps) return;

    // Hide current step
    document.getElementById(`step-${state.currentStep}`).classList.remove('active');
    const prevStepItem = document.querySelector(`.step-item[data-step="${state.currentStep}"]`);
    if (direction > 0) {
        prevStepItem.classList.remove('active');
        prevStepItem.classList.add('done');
        // Set connecting line as done
        const lines = document.querySelectorAll('.step-line');
        if (state.currentStep - 1 < lines.length) lines[state.currentStep - 1].classList.add('done');
    } else {
        prevStepItem.classList.remove('done', 'active');
        // Undo line
        const lines = document.querySelectorAll('.step-line');
        if (newStep - 1 < lines.length) lines[newStep - 1].classList.remove('done');
    }

    state.currentStep = newStep;

    // Show new step
    document.getElementById(`step-${state.currentStep}`).classList.add('active');
    const newStepItem = document.querySelector(`.step-item[data-step="${state.currentStep}"]`);
    newStepItem.classList.remove('done');
    newStepItem.classList.add('active');

    // Update buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) {
        prevBtn.classList.toggle('visible', state.currentStep > 1);
    }
    if (nextBtn) {
        if (state.currentStep === state.totalSteps) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = '';
            nextBtn.innerHTML = state.currentStep === state.totalSteps - 1
                ? '<i class="uil uil-check-circle"></i> Finish'
                : 'Next <i class="uil uil-arrow-right"></i>';
        }
    }

    // If going to preview step, run final ATS
    if (state.currentStep === 5) updateFinalATS();

    // Scroll form panel to top
    const fp = document.getElementById('form-panel');
    if (fp) fp.scrollTop = 0;
}

/* ============================================================
   LIVE PREVIEW UPDATER
   ============================================================ */
function updatePreview() {
    const firstName = v('firstName');
    const lastName = v('lastName');
    const fullName = (firstName + ' ' + lastName).trim() || 'Your Name';
    setText('rv-name', fullName);
    setText('rv-title', v('jobTitle') || 'Your Professional Title');

    // Contact line
    const email = v('email') || 'your@email.com';
    const phone = v('phone') || '+1 000 000 0000';
    const loc = v('location') || 'City, Country';
    document.getElementById('rv-contact').innerHTML =
        `<span><i class="uil uil-envelope"></i> ${email}</span>
         <span><i class="uil uil-phone"></i> ${phone}</span>
         <span><i class="uil uil-map-marker"></i> ${loc}</span>`;

    // Summary
    const summary = v('summary');
    setText('rv-summary', summary || 'Your professional summary will appear here.');

    // Summary char count
    const sc = document.getElementById('summary-count');
    if (sc) sc.textContent = `${summary.length} / 400`;

    // Experience
    renderExperience();

    // Education
    renderEducation();

    // Update State
    state.targetRole = v('targetRole');
    state.targetCompany = v('targetCompany');
}

function updateSuggestions() {
    const role = v('targetRole');
    const company = v('targetCompany');
    
    if (role || company) {
        let msg = "Tailored suggestion: ";
        if (role && company) msg += `Try the ${role.toUpperCase()} template in ${company.toUpperCase()} style!`;
        else if (role) msg += `Check out our new ${role.toUpperCase()} specialized templates.`;
        else msg += `We have templates specifically for ${company.toUpperCase()} style.`;
        
        if (company && COMPANY_TIPS[company.toLowerCase()]) {
            setTimeout(() => showToast(`Expert Tip: ${COMPANY_TIPS[company.toLowerCase()]}`), 2000);
        }
        
        showToast(msg);
    }
    updateATS();
}

function checkQuantification() {
    const descs = document.querySelectorAll('.exp-desc');
    let hasMetrics = false;
    descs.forEach(d => {
        if (/\d+%|\$\d+|\d+\s*users|increased|reduced/i.test(d.value)) {
            hasMetrics = true;
        }
    });
    
    if (!hasMetrics && descs.length > 0) {
        showToast("Pro Tip: Add numbers/metrics (%, $) to show your impact!");
    }
}

function v(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function renderExperience() {
    const entries = document.querySelectorAll('#experience-entries .entry-card');
    if (!entries.length) return;
    let html = '';
    entries.forEach(card => {
        const title = card.querySelector('.exp-title')?.value.trim() || '';
        const company = card.querySelector('.exp-company')?.value.trim() || '';
        const start = card.querySelector('.exp-start')?.value.trim() || '';
        const end = card.querySelector('.exp-end')?.value.trim() || '';
        const desc = card.querySelector('.exp-desc')?.value.trim() || '';
        if (!title && !company) return;
        html += `
        <div class="rv-entry">
            <div class="rv-entry-header">
                <div>
                    <div class="rv-entry-title">${escHtml(title || 'Job Title')}</div>
                    <div class="rv-entry-sub">${escHtml(company || 'Company')}</div>
                </div>
                <div class="rv-entry-date">${escHtml(start)} ${start && end ? '–' : ''} ${escHtml(end)}</div>
            </div>
            ${desc ? `<p class="rv-entry-desc">${escHtml(desc)}</p>` : ''}
        </div>`;
    });
    const rvExp = document.getElementById('rv-experience');
    if (rvExp) rvExp.innerHTML = html || '<p class="rv-entry-desc" style="color:#999;">Add your work experience above.</p>';
}

function renderEducation() {
    const entries = document.querySelectorAll('#education-entries .entry-card');
    if (!entries.length) return;
    let html = '';
    entries.forEach(card => {
        const degree = card.querySelector('.edu-degree')?.value.trim() || '';
        const school = card.querySelector('.edu-school')?.value.trim() || '';
        const year = card.querySelector('.edu-year')?.value.trim() || '';
        const gpa = card.querySelector('.edu-gpa')?.value.trim() || '';
        if (!degree && !school) return;
        html += `
        <div class="rv-entry">
            <div class="rv-entry-header">
                <div>
                    <div class="rv-entry-title">${escHtml(degree || 'Degree')}</div>
                    <div class="rv-entry-sub">${escHtml(school || 'Institution')} ${gpa ? `| ${escHtml(gpa)}` : ''}</div>
                </div>
                <div class="rv-entry-date">${escHtml(year)}</div>
            </div>
        </div>`;
    });
    const rvEdu = document.getElementById('rv-education');
    if (rvEdu) rvEdu.innerHTML = html || '<p class="rv-entry-desc" style="color:#999;">Add your education above.</p>';
}

function renderSkillsPreview() {
    const rv = document.getElementById('rv-skills');
    if (!rv) return;
    let html = '';
    if (state.techSkills.length) {
        html += `<div class="rv-skills-group">
            <div class="rv-skills-group-label">Technical Skills</div>
            <div class="rv-skills-tags">${state.techSkills.map(s => `<span class="rv-skill-pill">${escHtml(s)}</span>`).join('')}</div>
        </div>`;
    }
    if (state.softSkills.length) {
        html += `<div class="rv-skills-group">
            <div class="rv-skills-group-label">Soft Skills</div>
            <div class="rv-skills-tags">${state.softSkills.map(s => `<span class="rv-skill-pill">${escHtml(s)}</span>`).join('')}</div>
        </div>`;
    }
    if (state.langSkills.length) {
        html += `<div class="rv-skills-group">
            <div class="rv-skills-group-label">Languages</div>
            <div class="rv-skills-tags">${state.langSkills.map(s => `<span class="rv-skill-pill">${escHtml(s)}</span>`).join('')}</div>
        </div>`;
    }
    rv.innerHTML = html || '<p style="color:#999;font-size:0.85rem;">Add your skills on the Skills step.</p>';
}

function escHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/* ============================================================
   SKILL TAGS
   ============================================================ */
function handleSkillKey(event, type) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSkill(type);
    }
}

function addSkill(type) {
    const inputMap = { tech: 'skill-input', soft: 'soft-skill-input', lang: 'lang-input' };
    const stateMap = { tech: 'techSkills', soft: 'softSkills', lang: 'langSkills' };
    const tagContMap = { tech: 'tech-skill-tags', soft: 'soft-skill-tags', lang: 'lang-skill-tags' };

    const input = document.getElementById(inputMap[type]);
    const val = input?.value.trim();
    if (!val) return;

    const arr = state[stateMap[type]];
    if (arr.includes(val)) { input.value = ''; return; }

    arr.push(val);
    input.value = '';

    renderTagsToDOM(type, arr, tagContMap[type]);
    renderSkillsPreview();
    updateATS();
}

function removeSkill(type, index) {
    const stateMap = { tech: 'techSkills', soft: 'softSkills', lang: 'langSkills' };
    const tagContMap = { tech: 'tech-skill-tags', soft: 'soft-skill-tags', lang: 'lang-skill-tags' };
    state[stateMap[type]].splice(index, 1);
    renderTagsToDOM(type, state[stateMap[type]], tagContMap[type]);
    renderSkillsPreview();
    updateATS();
}

function renderTagsToDOM(type, arr, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = arr.map((skill, i) => `
        <span class="skill-tag">
            ${escHtml(skill)}
            <button onclick="removeSkill('${type}', ${i})" title="Remove"><i class="uil uil-times"></i></button>
        </span>
    `).join('');
}

/* ============================================================
   ADD / REMOVE EDUCATION & EXPERIENCE ENTRIES
   ============================================================ */
let eduCount = 1;
function addEducation() {
    const container = document.getElementById('education-entries');
    const id = `edu-${eduCount}`;
    const div = document.createElement('div');
    div.className = 'entry-card';
    div.id = id;
    div.innerHTML = `
        <div class="entry-card-header">
            <span>Education ${eduCount + 1}</span>
            <button type="button" class="remove-entry" onclick="removeEntry('${id}')"><i class="uil uil-times"></i></button>
        </div>
        <div class="form-group">
            <label>Degree / Qualification</label>
            <input type="text" class="edu-degree" placeholder="e.g. Bachelor of Science in Computer Science" oninput="updatePreview()">
        </div>
        <div class="form-grid-2">
            <div class="form-group">
                <label>Institution / University</label>
                <input type="text" class="edu-school" placeholder="e.g. MIT" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label>Graduation Year</label>
                <input type="text" class="edu-year" placeholder="e.g. 2022" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-group">
            <label>GPA / Achievements (optional)</label>
            <input type="text" class="edu-gpa" placeholder="e.g. GPA: 3.8 / 4.0 | Dean's List" oninput="updatePreview()">
        </div>`;
    container.appendChild(div);
    eduCount++;
}

let expCount = 1;
function addExperience() {
    const container = document.getElementById('experience-entries');
    const id = `exp-${expCount}`;
    const div = document.createElement('div');
    div.className = 'entry-card';
    div.id = id;
    div.innerHTML = `
        <div class="entry-card-header">
            <span>Experience ${expCount + 1}</span>
            <button type="button" class="remove-entry" onclick="removeEntry('${id}')"><i class="uil uil-times"></i></button>
        </div>
        <div class="form-grid-2">
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="exp-title" placeholder="e.g. Software Engineer" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="exp-company" placeholder="e.g. Google" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-grid-2">
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="exp-start" placeholder="e.g. Jan 2021" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="exp-end" placeholder="e.g. Present" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-group">
            <label>Key Responsibilities & Achievements</label>
            <textarea class="exp-desc" rows="4" placeholder="• Led a team..." oninput="updatePreview(); updateATS(); checkQuantification();"></textarea>
        </div>`;
    container.appendChild(div);
    expCount++;
}

function removeEntry(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => { el.remove(); updatePreview(); }, 300);
    }
}

/* ============================================================
   ATS SCORE
   ============================================================ */
const ACTION_VERBS = ['led', 'managed', 'developed', 'built', 'designed', 'improved', 'created', 'implemented', 'achieved', 'increased', 'reduced', 'delivered', 'coordinated', 'analyzed', 'launched', 'optimized', 'collaborated', 'spearheaded', 'drove', 'established', 'engineered', 'streamlined', 'authored', 'mentored', 'trained', 'negotiated', 'resolved', 'generated', 'maintained', 'oversaw'];

function updateATS() {
    const checks = computeATSChecks();
    const score = Math.round((checks.passed / checks.total) * 100);

    // Update bar
    const bar = document.getElementById('ats-bar');
    const val = document.getElementById('ats-value');
    if (bar) bar.style.width = score + '%';
    if (val) val.textContent = score + '%';

    // Update checklist items
    setCheck('check-name', checks.name);
    setCheck('check-contact', checks.contact);
    setCheck('check-summary', checks.summary);
    setCheck('check-exp', checks.exp);
    setCheck('check-skills', checks.skills);
    setCheck('check-edu', checks.edu);
    setCheck('check-keywords', checks.keywords);

    // Role Match UI
    const roleCheck = document.getElementById('check-role-match');
    if (roleCheck) {
        const role = v('targetRole');
        roleCheck.style.display = role ? 'block' : 'none';
        if (role) setCheck('check-role-match', checks.roleMatch);
    }
}

function computeATSChecks() {
    const firstName = v('firstName');
    const lastName = v('lastName');
    const email = v('email');
    const phone = v('phone');
    const summary = v('summary');

    const hasName = !!(firstName && lastName);
    const hasContact = !!(email && phone);
    const hasSummary = summary.length > 20;

    const expCards = document.querySelectorAll('#experience-entries .entry-card');
    const hasExp = Array.from(expCards).some(c => c.querySelector('.exp-title')?.value.trim() || c.querySelector('.exp-company')?.value.trim());

    const totalSkills = state.techSkills.length + state.softSkills.length;
    const hasSkills = totalSkills >= 3;

    const eduCards = document.querySelectorAll('#education-entries .entry-card');
    const hasEdu = Array.from(eduCards).some(c => c.querySelector('.edu-degree')?.value.trim() || c.querySelector('.edu-school')?.value.trim());

    // Check for action verbs in experience
    const allText = Array.from(document.querySelectorAll('.exp-desc')).map(t => t.value.toLowerCase()).join(' ');
    const hasKeywords = ACTION_VERBS.some(v => allText.includes(v));

    // Role-specific keywords
    const role = v('targetRole');
    let roleKeywordMatch = true;
    if (role && ROLE_KEYWORDS[role]) {
        const matches = ROLE_KEYWORDS[role].filter(kw => 
            allText.includes(kw) || 
            state.techSkills.some(s => s.toLowerCase().includes(kw))
        );
        roleKeywordMatch = matches.length >= 3;
    }

    const flags = [hasName, hasContact, hasSummary, hasExp, hasSkills, hasEdu, hasKeywords, roleKeywordMatch];
    return {
        name: hasName, contact: hasContact, summary: hasSummary,
        exp: hasExp, skills: hasSkills, edu: hasEdu, keywords: hasKeywords,
        roleMatch: roleKeywordMatch,
        passed: flags.filter(Boolean).length,
        total: flags.length
    };
}

function setCheck(id, passed) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.textContent.replace(/^[\s\S]*?(?=[A-Z])/, '');
    el.className = 'ats-check' + (passed ? ' passed' : '');
    el.innerHTML = `<i class="uil ${passed ? 'uil-check-circle' : 'uil-times-circle'}"></i> ${text.trim() || el.textContent.trim()}`;
}

function updateFinalATS() {
    const checks = computeATSChecks();
    const score = Math.round((checks.passed / checks.total) * 100);
    const fBar = document.getElementById('final-ats-bar');
    const fVal = document.getElementById('final-ats-value');
    if (fBar) fBar.style.width = score + '%';
    if (fVal) fVal.textContent = score + '%';
}

/* ============================================================
   UTILITY ACTIONS
   ============================================================ */
function copyResumeText() {
    const rv = document.getElementById('resume-output');
    if (!rv) return;
    const text = rv.innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Resume text copied to clipboard!');
    }).catch(() => {
        showToast('Copy failed – please try manually selecting the text.');
    });
}

function startOver() {
    if (confirm('Are you sure you want to clear everything and start a new resume?')) {
        location.reload();
    }
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
            background:linear-gradient(135deg,#6c63ff,#ff6584);color:white;
            padding:0.8rem 1.5rem;border-radius:2rem;font-size:0.9rem;font-weight:600;
            z-index:9999;opacity:0;transition:opacity 0.3s ease;font-family:Montserrat,sans-serif;
            box-shadow:0 4px 20px rgba(108,99,255,0.4);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

/* =============================================
   TEMPLATE INITIALIZATION
   ============================================= */
function initTemplate() {
    const params = new URLSearchParams(window.location.search);
    const tpl = params.get('template') || 'dublin';
    state.template = tpl;

    const preview = document.getElementById('resume-output');
    if (preview) {
        // Remove old tpl classes
        preview.classList.forEach(cls => {
            if (cls.startsWith('tpl-')) preview.classList.remove(cls);
        });
        // Add new one
        preview.classList.add(`tpl-${tpl}`);
    }

    // Pre-fill role/company if in URL
    const role = params.get('role');
    const company = params.get('company');
    if (role) {
        const roleSelect = document.getElementById('targetRole');
        if (roleSelect) {
            roleSelect.value = role;
            state.targetRole = role;
        }
    }
    if (company) {
        const compSelect = document.getElementById('targetCompany');
        if (compSelect) {
            compSelect.value = company;
            state.targetCompany = company;
        }
    }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Set first prev button state
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) prevBtn.classList.remove('visible');
    
    initTemplate();
    updatePreview();
    updateATS();
});
