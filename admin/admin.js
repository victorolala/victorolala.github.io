const SESSION_KEY = 'portfolio_admin_session';
const QUOTES_KEY = 'portfolio_admin_quotes';
const INVOICES_KEY = 'portfolio_admin_invoices';
const SESSION_HOURS = 12;

const DEFAULT_PASSWORD_HASH = '057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86';

const BUSINESS = {
    name: 'Victor Olala',
    title: 'Cloud & Senior Software Engineer',
    email: 'olalavictor01@gmail.com',
    location: 'Nairobi, Kenya',
    website: 'victorolala.github.io'
};

/** Default payment details for new quotes — edit in admin.js */
const DEFAULT_PAYMENT = {
    method: 'Bank transfer / M-Pesa',
    accountName: 'Victor Olala',
    bankName: '',
    accountNumber: '',
    branchSwift: '',
    mpesa: '',
    instructions: 'Please use the quote number as your payment reference.'
};

const DEFAULT_PAYMENT_TERMS =
    '<p>60% deposit required before work begins. Balance due upon project completion.</p>';

const DEFAULT_NOTES =
    '<p>Payment due within 14 days of acceptance. Scope changes may affect pricing.</p>';

const DEFAULT_TERMS =
    '<p>This quote is valid until the date shown. Work begins upon written acceptance.</p>';

const DEFAULT_INVOICE_NOTES =
    '<p>Please remit payment by the due date shown above. Thank you for your business.</p>';

const INVOICE_STATUS_LABELS = {
    unpaid: 'Unpaid',
    partial: 'Partially paid',
    paid: 'Paid'
};

const QUILL_TOOLBAR = [
    ['bold', 'italic', 'underline'],
    [{ header: [2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
];

const RICH_EDITOR_SPECS = [
    {
        name: 'paymentInstructions',
        containerId: 'editorPaymentInstructions',
        placeholder: 'e.g. Use quote number as payment reference'
    },
    {
        name: 'paymentTerms',
        containerId: 'editorPaymentTerms',
        placeholder: 'Deposits, milestones, due dates…'
    },
    { name: 'notes', containerId: 'editorNotes', placeholder: 'Project notes, scope clarifications…' },
    { name: 'terms', containerId: 'editorTerms', placeholder: 'Quote validity, acceptance, scope…' }
];

const richEditors = {};
let richEditorsReady = false;

function mergePayment(payment) {
    return { ...DEFAULT_PAYMENT, ...(payment || {}) };
}

const CURRENCIES = {
    USD: { symbol: '$', label: 'USD' },
    KES: { symbol: 'KSh ', label: 'KES' },
    EUR: { symbol: '€', label: 'EUR' },
    GBP: { symbol: '£', label: 'GBP' }
};

function getPasswordHash() {
    return window.ADMIN_CONFIG?.passwordHash || DEFAULT_PASSWORD_HASH;
}

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function isAuthenticated() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return false;
        const session = JSON.parse(raw);
        return session.expiresAt > Date.now();
    } catch {
        return false;
    }
}

function setSession() {
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000 })
    );
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

function loadQuotes() {
    try {
        return JSON.parse(localStorage.getItem(QUOTES_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveQuotes(quotes) {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function loadInvoices() {
    try {
        return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveInvoices(invoices) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

function formatMoney(amount, currencyCode) {
    const { symbol } = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const n = Number(amount) || 0;
    return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDisplayDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return iso;
    }
}

function currencyLabel(code) {
    const c = CURRENCIES[code] || CURRENCIES.USD;
    return `${c.label} (${c.symbol.trim()})`;
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function generateQuoteNumber() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `Q-${y}${m}-${seq}`;
}

function generateInvoiceNumber() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `INV-${y}${m}-${seq}`;
}

function defaultQuote() {
    const issueDate = todayISO();
    return {
        id: crypto.randomUUID(),
        quoteNumber: generateQuoteNumber(),
        issueDate,
        validUntil: addDaysISO(issueDate, 30),
        currency: 'USD',
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        lineItems: [
            { description: 'Software engineering services', quantity: 1, rate: 0 }
        ],
        taxPercent: 0,
        discount: 0,
        notes: DEFAULT_NOTES,
        paymentTerms: DEFAULT_PAYMENT_TERMS,
        terms: DEFAULT_TERMS,
        payment: { ...DEFAULT_PAYMENT },
        updatedAt: new Date().toISOString()
    };
}

function defaultInvoice() {
    const issueDate = todayISO();
    return {
        id: crypto.randomUUID(),
        invoiceNumber: generateInvoiceNumber(),
        issueDate,
        dueDate: addDaysISO(issueDate, 14),
        quoteReference: '',
        status: 'unpaid',
        currency: 'USD',
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        lineItems: [
            { description: 'Software engineering services', quantity: 1, rate: 0 }
        ],
        taxPercent: 0,
        discount: 0,
        notes: DEFAULT_INVOICE_NOTES,
        paymentTerms: DEFAULT_PAYMENT_TERMS,
        terms: DEFAULT_TERMS,
        payment: { ...DEFAULT_PAYMENT },
        updatedAt: new Date().toISOString()
    };
}

let currentDocType = 'quote';
let currentQuote = defaultQuote();
let currentInvoice = defaultInvoice();

function getCurrentDoc() {
    return currentDocType === 'invoice' ? currentInvoice : currentQuote;
}

function getDocNumber(doc, type = currentDocType) {
    return type === 'invoice' ? doc.invoiceNumber : doc.quoteNumber;
}

function applyDocTypeUI() {
    const isInvoice = currentDocType === 'invoice';
    document.querySelectorAll('.quote-only-field, .quote-only-preview').forEach((el) => {
        el.classList.toggle('admin-hidden', isInvoice);
    });
    document.querySelectorAll('.invoice-only-field, .invoice-only-preview').forEach((el) => {
        el.classList.toggle('admin-hidden', !isInvoice);
    });

    const heading = document.getElementById('docDetailsHeading');
    const numLabel = document.getElementById('docNumberLabel');
    const previewBadge = document.getElementById('previewDocBadge');
    const previewNumLabel = document.getElementById('previewNumberLabel');
    const totalLabel = document.getElementById('previewTotalLabel');
    const saveBtn = document.getElementById('saveQuote');
    const newBtn = document.getElementById('newQuote');
    const dupBtn = document.getElementById('duplicateQuote');

    if (heading) heading.textContent = isInvoice ? 'Invoice details' : 'Quote details';
    if (numLabel) numLabel.textContent = isInvoice ? 'Invoice #' : 'Quote #';
    if (previewBadge) {
        previewBadge.textContent = isInvoice ? 'Invoice' : 'Quote';
        previewBadge.classList.toggle('invoice-badge', isInvoice);
    }
    if (previewNumLabel) previewNumLabel.textContent = isInvoice ? 'Invoice #' : 'Quote #';
    if (totalLabel) totalLabel.textContent = isInvoice ? 'Amount due' : 'Total due';
    if (saveBtn) saveBtn.textContent = isInvoice ? 'Save invoice' : 'Save quote';
    if (newBtn) newBtn.textContent = isInvoice ? 'New invoice' : 'New quote';
    if (dupBtn) dupBtn.textContent = isInvoice ? 'Duplicate invoice' : 'Duplicate quote';

    document.getElementById('validUntil').required = !isInvoice;
    document.getElementById('dueDate').required = isInvoice;
}

function invoiceFromQuote(quote) {
    const issueDate = todayISO();
    return {
        ...defaultInvoice(),
        id: crypto.randomUUID(),
        invoiceNumber: generateInvoiceNumber(),
        issueDate,
        dueDate: addDaysISO(issueDate, 14),
        quoteReference: quote.quoteNumber || '',
        currency: quote.currency,
        clientName: quote.clientName,
        clientCompany: quote.clientCompany,
        clientEmail: quote.clientEmail,
        lineItems: quote.lineItems.map((item) => ({ ...item })),
        taxPercent: quote.taxPercent,
        discount: quote.discount,
        notes: quote.notes || DEFAULT_INVOICE_NOTES,
        paymentTerms: quote.paymentTerms || DEFAULT_PAYMENT_TERMS,
        terms: quote.terms || DEFAULT_TERMS,
        payment: { ...mergePayment(quote.payment) },
        updatedAt: new Date().toISOString()
    };
}

function initRichEditors() {
    if (richEditorsReady || typeof Quill === 'undefined') return;

    RICH_EDITOR_SPECS.forEach((spec) => {
        const el = document.getElementById(spec.containerId);
        if (!el) return;

        richEditors[spec.name] = new Quill(el, {
            theme: 'snow',
            modules: { toolbar: QUILL_TOOLBAR },
            placeholder: spec.placeholder
        });
        richEditors[spec.name].on('text-change', onFormChange);
    });

    richEditorsReady = true;
}

function getEditorHtml(name) {
    if (!richEditors[name]) return '';
    return richEditors[name].root.innerHTML.trim();
}

function setEditorHtml(name, value) {
    if (!richEditors[name]) return;
    const html = normalizeRichContent(value);
    if (richEditors[name].root.innerHTML === html) return;
    richEditors[name].root.innerHTML = html;
}

function normalizeRichContent(value) {
    if (!value) return '';
    if (/<[a-z][\s\S]*>/i.test(value)) return value;
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('');
}

function isRichEmpty(html) {
    if (!html) return true;
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return !text;
}

function sanitizeRichHtml(html) {
    if (!html) return '';
    const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'H2', 'H3', 'SPAN']);
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const clean = (node) => {
        Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!allowed.has(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) fragment.appendChild(child.firstChild);
                    child.replaceWith(fragment);
                    clean(node);
                    return;
                }
                if (child.tagName === 'A') {
                    const href = child.getAttribute('href') || '';
                    if (!/^https?:\/\//i.test(href)) child.removeAttribute('href');
                    else {
                        child.setAttribute('target', '_blank');
                        child.setAttribute('rel', 'noopener noreferrer');
                    }
                }
                Array.from(child.attributes).forEach((attr) => {
                    if (!['href', 'target', 'rel'].includes(attr.name)) child.removeAttribute(attr.name);
                });
                clean(child);
            }
        });
    };

    clean(doc.body);
    return doc.body.innerHTML;
}

function richHtmlToPlainText(html) {
    if (isRichEmpty(html)) return '';
    const root = document.createElement('div');
    root.innerHTML = sanitizeRichHtml(html);
    const lines = [];

    root.querySelectorAll('h2, h3').forEach((el) => lines.push(el.textContent.trim()));
    root.querySelectorAll('p').forEach((el) => {
        const t = el.textContent.trim();
        if (t) lines.push(t);
    });
    root.querySelectorAll('ul > li').forEach((el) => lines.push(`• ${el.textContent.trim()}`));
    root.querySelectorAll('ol > li').forEach((el, i) => lines.push(`${i + 1}. ${el.textContent.trim()}`));

    if (!lines.length) lines.push(root.textContent.trim());
    return lines.filter(Boolean).join('\n');
}

function renderRichPreview(elementId, html) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (isRichEmpty(html)) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = sanitizeRichHtml(html);
}

function lineAmount(item) {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return qty * rate;
}

function computeTotals(quote) {
    const subtotal = quote.lineItems.reduce((sum, item) => sum + lineAmount(item), 0);
    const tax = subtotal * (Number(quote.taxPercent) || 0) / 100;
    const discount = Number(quote.discount) || 0;
    const total = Math.max(0, subtotal + tax - discount);
    return { subtotal, tax, discount, total };
}

function readFormIntoCurrent() {
    const doc = getCurrentDoc();
    const num = document.getElementById('quoteNumber').value.trim();
    if (currentDocType === 'invoice') {
        doc.invoiceNumber = num;
        doc.dueDate = document.getElementById('dueDate').value;
        doc.quoteReference = document.getElementById('quoteReference').value.trim();
        doc.status = document.getElementById('paymentStatus').value;
    } else {
        doc.quoteNumber = num;
        doc.validUntil = document.getElementById('validUntil').value;
    }
    doc.issueDate = document.getElementById('issueDate').value;
    doc.currency = document.getElementById('currency').value;
    doc.clientName = document.getElementById('clientName').value.trim();
    doc.clientCompany = document.getElementById('clientCompany').value.trim();
    doc.clientEmail = document.getElementById('clientEmail').value.trim();
    doc.taxPercent = Number(document.getElementById('taxPercent').value) || 0;
    doc.discount = Number(document.getElementById('discount').value) || 0;
    doc.notes = getEditorHtml('notes');
    doc.paymentTerms = getEditorHtml('paymentTerms');
    doc.terms = getEditorHtml('terms');
    doc.payment = {
        method: document.getElementById('paymentMethod').value.trim(),
        accountName: document.getElementById('paymentAccountName').value.trim(),
        bankName: document.getElementById('paymentBankName').value.trim(),
        accountNumber: document.getElementById('paymentAccountNumber').value.trim(),
        branchSwift: document.getElementById('paymentBranchSwift').value.trim(),
        mpesa: document.getElementById('paymentMpesa').value.trim(),
        instructions: getEditorHtml('paymentInstructions')
    };
    doc.updatedAt = new Date().toISOString();

    const rows = document.querySelectorAll('#lineItemsBody tr');
    doc.lineItems = Array.from(rows).map((row) => ({
        description: row.querySelector('[data-field="description"]').value.trim(),
        quantity: Number(row.querySelector('[data-field="quantity"]').value) || 0,
        rate: Number(row.querySelector('[data-field="rate"]').value) || 0
    }));
}

function populateForm(doc) {
    document.getElementById('quoteNumber').value = getDocNumber(doc, currentDocType);
    document.getElementById('issueDate').value = doc.issueDate;
    document.getElementById('validUntil').value = doc.validUntil || '';
    document.getElementById('dueDate').value = doc.dueDate || '';
    document.getElementById('quoteReference').value = doc.quoteReference || '';
    document.getElementById('paymentStatus').value = doc.status || 'unpaid';
    document.getElementById('currency').value = doc.currency;
    document.getElementById('clientName').value = doc.clientName;
    document.getElementById('clientCompany').value = doc.clientCompany;
    document.getElementById('clientEmail').value = doc.clientEmail;
    document.getElementById('taxPercent').value = doc.taxPercent;
    document.getElementById('discount').value = doc.discount;
    setEditorHtml('notes', doc.notes);
    setEditorHtml('paymentTerms', doc.paymentTerms || DEFAULT_PAYMENT_TERMS);
    setEditorHtml('terms', doc.terms);
    const payment = mergePayment(doc.payment);
    document.getElementById('paymentMethod').value = payment.method;
    document.getElementById('paymentAccountName').value = payment.accountName;
    document.getElementById('paymentBankName').value = payment.bankName;
    document.getElementById('paymentAccountNumber').value = payment.accountNumber;
    document.getElementById('paymentBranchSwift').value = payment.branchSwift;
    document.getElementById('paymentMpesa').value = payment.mpesa;
    setEditorHtml('paymentInstructions', payment.instructions);
    renderLineItems(doc.lineItems);
}

function renderLineItems(items) {
    const tbody = document.getElementById('lineItemsBody');
    tbody.innerHTML = '';
    items.forEach((item, index) => {
        tbody.appendChild(createLineRow(item, index === 0 && items.length === 1));
    });
    updateFormTotals();
    updatePreview();
}

function createLineRow(item = { description: '', quantity: 1, rate: 0 }, isOnlyRow) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" data-field="description" value="${escapeAttr(item.description)}" placeholder="Service or deliverable"></td>
        <td class="col-qty"><input type="number" data-field="quantity" min="0" step="any" value="${item.quantity}"></td>
        <td class="col-rate"><input type="number" data-field="rate" min="0" step="0.01" value="${item.rate}"></td>
        <td class="col-amount" data-amount>0.00</td>
        <td class="col-actions">
            <button type="button" class="btn-icon remove-line" title="Remove line" ${isOnlyRow ? 'disabled' : ''}>×</button>
        </td>
    `;
    tr.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', onFormChange);
    });
    tr.querySelector('.remove-line').addEventListener('click', () => {
        if (document.querySelectorAll('#lineItemsBody tr').length <= 1) return;
        tr.remove();
        onFormChange();
    });
    updateRowAmount(tr);
    return tr;
}

function escapeAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function updateRowAmount(row) {
    const qty = Number(row.querySelector('[data-field="quantity"]').value) || 0;
    const rate = Number(row.querySelector('[data-field="rate"]').value) || 0;
    row.querySelector('[data-amount]').textContent = (qty * rate).toFixed(2);
}

function updateFormTotals() {
    readFormIntoCurrent();
    const doc = getCurrentDoc();
    const { subtotal, tax, total } = computeTotals(doc);
    const currency = doc.currency;
    document.getElementById('formSubtotal').textContent = formatMoney(subtotal, currency);
    document.getElementById('formTax').textContent = formatMoney(tax, currency);
    document.getElementById('formTotal').textContent = formatMoney(total, currency);

    document.querySelectorAll('#lineItemsBody tr').forEach(updateRowAmount);
}

function onFormChange() {
    updateFormTotals();
    updatePreview();
}

function updatePreview() {
    readFormIntoCurrent();
    const doc = getCurrentDoc();
    const isInvoice = currentDocType === 'invoice';
    const { subtotal, tax, total } = computeTotals(doc);
    const currency = doc.currency;
    const docNum = getDocNumber(doc);

    const toolbarMeta = document.getElementById('previewToolbarMeta');
    const toolbarTotal = document.getElementById('previewToolbarTotal');
    if (toolbarMeta) {
        const clientLabel = doc.clientName || doc.clientCompany;
        toolbarMeta.textContent = clientLabel
            ? `${docNum} · ${clientLabel}`
            : docNum || (isInvoice ? 'Draft invoice' : 'Draft quote');
    }
    if (toolbarTotal) toolbarTotal.textContent = formatMoney(total, currency);

    document.getElementById('previewQuoteNumber').textContent = docNum || '—';
    document.getElementById('previewIssueDate').textContent = formatDisplayDate(doc.issueDate);
    document.getElementById('previewValidUntil').textContent = formatDisplayDate(doc.validUntil);
    document.getElementById('previewDueDate').textContent = formatDisplayDate(doc.dueDate);
    const currencyEl = document.getElementById('previewCurrency');
    if (currencyEl) currencyEl.textContent = currencyLabel(currency);

    const refRow = document.getElementById('previewQuoteRefRow');
    const refVal = doc.quoteReference?.trim();
    if (refRow) refRow.style.display = isInvoice && refVal ? 'flex' : 'none';
    const refEl = document.getElementById('previewQuoteReference');
    if (refEl) refEl.textContent = refVal || '—';

    const statusBadge = document.getElementById('previewStatusBadge');
    if (statusBadge) {
        if (isInvoice) {
            const status = doc.status || 'unpaid';
            statusBadge.textContent = INVOICE_STATUS_LABELS[status] || status;
            statusBadge.className = `invoice-status-badge status-${status}`;
            statusBadge.classList.remove('admin-hidden');
        } else {
            statusBadge.classList.add('admin-hidden');
        }
    }

    const clientEl = document.getElementById('previewClient');
    const clientParts = [doc.clientName, doc.clientCompany, doc.clientEmail].filter(Boolean);
    clientEl.classList.toggle('is-empty', !clientParts.length);
    clientEl.innerHTML = clientParts.length
        ? clientParts.map((p, i) => (i === 0 ? `<strong>${escapeHtml(p)}</strong>` : escapeHtml(p))).join('<br>')
        : '<span class="placeholder">Client details will appear here</span>';

    const footerEl = document.getElementById('previewDocFooter');
    if (footerEl) {
        footerEl.textContent = `${BUSINESS.name} · ${BUSINESS.email} · ${BUSINESS.website}`;
    }

    const tbody = document.getElementById('previewLineItems');
    const items = doc.lineItems.filter((item) => item.description || item.rate);
    tbody.innerHTML = items.length
        ? items.map(
            (item) => `
        <tr>
            <td class="desc">${escapeHtml(item.description || '—')}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${formatMoney(item.rate, currency)}</td>
            <td class="num">${formatMoney(lineAmount(item), currency)}</td>
        </tr>`
        ).join('')
        : '<tr class="empty-row"><td colspan="4">Add line items to see them here</td></tr>';

    document.getElementById('previewSubtotal').textContent = formatMoney(subtotal, currency);
    document.getElementById('previewTax').textContent = formatMoney(tax, currency);
    document.getElementById('previewDiscount').textContent = formatMoney(doc.discount, currency);
    document.getElementById('previewTotal').textContent = formatMoney(total, currency);
    document.getElementById('previewDiscountRow').style.display = doc.discount > 0 ? 'flex' : 'none';
    document.getElementById('previewTaxRow').style.display = doc.taxPercent > 0 ? 'flex' : 'none';

    renderRichPreview('previewNotes', doc.notes);
    renderRichPreview('previewTerms', doc.terms);
    renderRichPreview('previewPaymentTerms', doc.paymentTerms);
    document.getElementById('previewNotesBlock').style.display = isRichEmpty(doc.notes) ? 'none' : 'block';
    document.getElementById('previewTermsBlock').style.display = isRichEmpty(doc.terms) ? 'none' : 'block';
    document.getElementById('previewPaymentTermsBlock').style.display = isRichEmpty(doc.paymentTerms) ? 'none' : 'block';

    const payment = mergePayment(doc.payment);
    const paymentHtml = [
        paymentField('Method', payment.method),
        paymentField('Account name', payment.accountName),
        paymentField('Bank', payment.bankName),
        paymentField('Account no.', payment.accountNumber),
        paymentField('Branch / SWIFT', payment.branchSwift),
        paymentField('M-Pesa', payment.mpesa)
    ].filter(Boolean).join('');

    const hasInstructions = !isRichEmpty(payment.instructions);
    const hasPaymentFields = Boolean(paymentHtml);
    document.getElementById('previewPaymentBlock').style.display =
        hasPaymentFields || hasInstructions ? 'block' : 'none';
    document.getElementById('previewPayment').innerHTML = paymentHtml;

    const instrEl = document.getElementById('previewPaymentInstructions');
    if (hasInstructions) {
        renderRichPreview('previewPaymentInstructions', payment.instructions);
        instrEl.classList.remove('admin-hidden');
    } else {
        instrEl.innerHTML = '';
        instrEl.classList.add('admin-hidden');
    }
}

function paymentField(label, value) {
    if (!value) return '';
    return `<div class="payment-item">
        <span class="payment-label">${escapeHtml(label)}</span>
        <span class="payment-value">${escapeHtml(value)}</span>
    </div>`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showApp() {
    document.getElementById('loginScreen').classList.add('admin-hidden');
    document.getElementById('adminApp').classList.remove('admin-hidden');
    initRichEditors();
    applyDocTypeUI();
    populateForm(getCurrentDoc());
    renderSavedQuotes();
    renderSavedInvoices();
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('admin-hidden');
    document.getElementById('adminApp').classList.add('admin-hidden');
}

function switchTab(tabId) {
    if (tabId === 'builder' || tabId === 'invoice-builder') {
        readFormIntoCurrent();
        const targetType = tabId === 'invoice-builder' ? 'invoice' : 'quote';
        if (currentDocType !== targetType) {
            currentDocType = targetType;
            populateForm(getCurrentDoc());
        }
        applyDocTypeUI();
        updatePreview();
    }

    const panelId = tabId === 'invoice-builder' ? 'builder' : tabId;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `panel-${panelId}`);
    });
}

function persistCurrentDoc() {
    readFormIntoCurrent();
    const doc = getCurrentDoc();
    if (currentDocType === 'invoice') {
        const invoices = loadInvoices();
        const idx = invoices.findIndex((inv) => inv.id === doc.id);
        if (idx >= 0) invoices[idx] = { ...doc };
        else invoices.unshift({ ...doc });
        saveInvoices(invoices);
        renderSavedInvoices();
        showToast('Invoice saved', 'success');
    } else {
        const quotes = loadQuotes();
        const idx = quotes.findIndex((q) => q.id === doc.id);
        if (idx >= 0) quotes[idx] = { ...doc };
        else quotes.unshift({ ...doc });
        saveQuotes(quotes);
        renderSavedQuotes();
        showToast('Quote saved', 'success');
    }
}

function persistCurrentQuote() {
    persistCurrentDoc();
}

function renderSavedQuotes() {
    const list = document.getElementById('savedQuotesList');
    const quotes = loadQuotes();
    if (!quotes.length) {
        list.innerHTML = '<div class="empty-state">No saved quotes yet. Create one in the Quote Builder tab.</div>';
        return;
    }
    list.innerHTML = quotes
        .map((q) => {
            const { total } = computeTotals(q);
            const label = q.clientName || q.clientCompany || 'Untitled client';
            const date = new Date(q.updatedAt).toLocaleDateString();
            return `
            <div class="saved-item" data-id="${q.id}">
                <div class="saved-item-info">
                    <h3>${escapeHtml(q.quoteNumber)} — ${escapeHtml(label)}</h3>
                    <p>${date} · ${formatMoney(total, q.currency)}</p>
                </div>
                <div class="saved-item-actions">
                    <button type="button" class="btn btn-secondary load-quote">Edit</button>
                    <button type="button" class="btn btn-secondary to-invoice">→ Invoice</button>
                    <button type="button" class="btn btn-download btn-download-sm download-quote">Download</button>
                    <button type="button" class="btn btn-ghost delete-quote">Delete</button>
                </div>
            </div>`;
        })
        .join('');

    list.querySelectorAll('.load-quote').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            const quote = loadQuotes().find((q) => q.id === id);
            if (quote) {
                currentDocType = 'quote';
                currentQuote = { ...quote };
                applyDocTypeUI();
                populateForm(currentQuote);
                switchTab('builder');
            }
        });
    });

    list.querySelectorAll('.to-invoice').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            const quote = loadQuotes().find((q) => q.id === id);
            if (quote) {
                currentDocType = 'invoice';
                currentInvoice = invoiceFromQuote(quote);
                applyDocTypeUI();
                populateForm(currentInvoice);
                switchTab('invoice-builder');
                showToast('Invoice created from quote — review and save');
            }
        });
    });

    list.querySelectorAll('.download-quote').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            const quote = loadQuotes().find((q) => q.id === id);
            if (quote) {
                currentDocType = 'quote';
                currentQuote = { ...quote };
                applyDocTypeUI();
                populateForm(currentQuote);
                updatePreview();
                downloadQuotePdf(btn);
            }
        });
    });

    list.querySelectorAll('.delete-quote').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            if (!confirm('Delete this saved quote?')) return;
            saveQuotes(loadQuotes().filter((q) => q.id !== id));
            if (currentDocType === 'quote' && currentQuote.id === id) {
                currentQuote = defaultQuote();
                populateForm(currentQuote);
            }
            renderSavedQuotes();
        });
    });
}

function renderSavedInvoices() {
    const list = document.getElementById('savedInvoicesList');
    if (!list) return;
    const invoices = loadInvoices();
    if (!invoices.length) {
        list.innerHTML = '<div class="empty-state">No saved invoices yet. Create one in the Invoice Builder tab.</div>';
        return;
    }
    list.innerHTML = invoices
        .map((inv) => {
            const { total } = computeTotals(inv);
            const label = inv.clientName || inv.clientCompany || 'Untitled client';
            const date = new Date(inv.updatedAt).toLocaleDateString();
            const status = INVOICE_STATUS_LABELS[inv.status] || inv.status;
            return `
            <div class="saved-item" data-id="${inv.id}">
                <div class="saved-item-info">
                    <h3>${escapeHtml(inv.invoiceNumber)} — ${escapeHtml(label)}</h3>
                    <p>${date} · ${formatMoney(total, inv.currency)} · ${escapeHtml(status)}</p>
                </div>
                <div class="saved-item-actions">
                    <button type="button" class="btn btn-secondary load-invoice">Edit</button>
                    <button type="button" class="btn btn-download btn-download-sm download-invoice">Download</button>
                    <button type="button" class="btn btn-ghost delete-invoice">Delete</button>
                </div>
            </div>`;
        })
        .join('');

    list.querySelectorAll('.load-invoice').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            const inv = loadInvoices().find((i) => i.id === id);
            if (inv) {
                currentDocType = 'invoice';
                currentInvoice = { ...inv };
                applyDocTypeUI();
                populateForm(currentInvoice);
                switchTab('invoice-builder');
            }
        });
    });

    list.querySelectorAll('.download-invoice').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            const inv = loadInvoices().find((i) => i.id === id);
            if (inv) {
                currentDocType = 'invoice';
                currentInvoice = { ...inv };
                applyDocTypeUI();
                populateForm(currentInvoice);
                updatePreview();
                downloadQuotePdf(btn);
            }
        });
    });

    list.querySelectorAll('.delete-invoice').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.saved-item').dataset.id;
            if (!confirm('Delete this saved invoice?')) return;
            saveInvoices(loadInvoices().filter((i) => i.id !== id));
            if (currentDocType === 'invoice' && currentInvoice.id === id) {
                currentInvoice = defaultInvoice();
                populateForm(currentInvoice);
            }
            renderSavedInvoices();
        });
    });
}

function pdfFilename() {
    const doc = getCurrentDoc();
    const num = (getDocNumber(doc) || 'document').replace(/[^\w-]+/g, '_');
    const prefix = currentDocType === 'invoice' ? 'Invoice_' : 'Quote_';
    return `${prefix}${num}.pdf`;
}

function pdfEnsureSpace(doc, y, needed, margin) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + needed > pageH - margin) {
        doc.addPage();
        return margin;
    }
    return y;
}

function pdfDrawAccentBar(doc, pageW) {
    const h = 2.5;
    const third = pageW / 3;
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, third, h, 'F');
    doc.setFillColor(139, 92, 246);
    doc.rect(third, 0, third, h, 'F');
    doc.setFillColor(236, 72, 153);
    doc.rect(third * 2, 0, third, h, 'F');
}

function pdfDrawLogo(doc, x, y) {
    const size = 11;
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(x, y, size, size, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('VO', x + size / 2, y + 7.2, { align: 'center' });
    return size;
}

function pdfDrawTotalsBox(doc, pageW, margin, startY, rows, grandLabel, grandValue) {
    const boxW = 72;
    const boxX = pageW - margin - boxW;
    const pad = 4;
    const rowH = 5.2;
    const grandBarH = 10;
    const boxH = pad * 2 + rows.length * rowH + grandBarH + 4;

    let y = pdfEnsureSpace(doc, startY, boxH + 4, margin);

    doc.setFillColor(250, 251, 255);
    doc.setDrawColor(224, 231, 255);
    doc.setLineWidth(0.25);
    doc.roundedRect(boxX, y, boxW, boxH, 2.5, 2.5, 'FD');

    let ty = y + pad + 3.5;
    rows.forEach(({ label, value }) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label, boxX + pad, ty);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(value, boxX + boxW - pad, ty, { align: 'right' });
        ty += rowH;
    });

    ty += 2;
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(boxX + 1.5, ty, boxW - 3, grandBarH, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(grandLabel.toUpperCase(), boxX + pad + 1, ty + 6);
    doc.setFontSize(10.5);
    doc.text(grandValue, boxX + boxW - pad - 1, ty + 6.5, { align: 'right' });

    return y + boxH + 6;
}

function pdfAddDocumentFooters(doc, margin, pageW, quoteNumber) {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.2);
        doc.line(margin, pageH - 13, pageW - margin, pageH - 13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`${BUSINESS.name} · ${BUSINESS.email}`, margin, pageH - 8);
        doc.text(`${quoteNumber} · Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
    }
}

function pdfWriteRichSection(doc, margin, pageW, startY, title, html, style = 'plain') {
    const contentW = pageW - margin * 2;
    if (isRichEmpty(html)) return startY;

    const isBox = style === 'amber' || style === 'muted';
    const boxColors = style === 'amber'
        ? { fill: [255, 251, 235], stroke: [253, 230, 138], title: [146, 64, 14], text: [120, 53, 15] }
        : { fill: [250, 251, 252], stroke: [226, 232, 240], title: [100, 116, 139], text: [71, 85, 105] };

    let y = startY;
    if (isBox) {
        const plain = richHtmlToPlainText(html);
        const lines = doc.splitTextToSize(plain, contentW - 12);
        const boxH = 12 + lines.length * 4.2 + 5;
        y = pdfEnsureSpace(doc, y, boxH, margin);
        doc.setFillColor(...boxColors.fill);
        doc.setDrawColor(...boxColors.stroke);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...boxColors.title);
        doc.text(title.toUpperCase(), margin + 5, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...boxColors.text);
        doc.text(lines, margin + 5, y + 11);
        return y + boxH + 6;
    }

    y = pdfEnsureSpace(doc, y, 12, margin);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(title.toUpperCase(), margin, y);
    y += 5;

    const root = document.createElement('div');
    root.innerHTML = sanitizeRichHtml(html);

    function writeLines(text, opts = {}) {
        const { bold, indent = 0, fontSize = 8.5 } = opts;
        if (!text.trim()) return;
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(71, 85, 105);
        doc.splitTextToSize(text, contentW - indent).forEach((line) => {
            y = pdfEnsureSpace(doc, y, 5, margin);
            doc.text(line, margin + indent, y);
            y += 4.2;
        });
    }

    Array.from(root.childNodes).forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const tag = node.tagName.toLowerCase();
        if (tag === 'h2' || tag === 'h3') {
            y += 1;
            writeLines(node.textContent.trim(), { bold: true, fontSize: tag === 'h2' ? 9.5 : 9 });
            y += 1;
        } else if (tag === 'p') {
            writeLines(node.textContent.trim());
            y += 1;
        } else if (tag === 'ul') {
            Array.from(node.querySelectorAll(':scope > li')).forEach((li) => {
                writeLines(`• ${li.textContent.trim()}`, { indent: 3 });
            });
            y += 1;
        } else if (tag === 'ol') {
            Array.from(node.querySelectorAll(':scope > li')).forEach((li, i) => {
                writeLines(`${i + 1}. ${li.textContent.trim()}`, { indent: 3 });
            });
            y += 1;
        }
    });

    if (y === startY + 5) writeLines(richHtmlToPlainText(html));

    return y + 4;
}

function buildQuotePdf() {
    readFormIntoCurrent();
    const q = getCurrentDoc();
    const isInvoice = currentDocType === 'invoice';
    const docNum = getDocNumber(q);
    const { subtotal, tax, total } = computeTotals(q);
    const currency = q.currency;
    const payment = mergePayment(q.payment);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margin = 16;
    const pageW = doc.internal.pageSize.getWidth();
    const contentW = pageW - margin * 2;

    pdfDrawAccentBar(doc, pageW);

    const headerTop = 13;
    let y = 15;
    const logoSize = 11;

    const meta = isInvoice
        ? [
            ['Invoice #', docNum],
            ['Issued', formatDisplayDate(q.issueDate)],
            ['Due date', formatDisplayDate(q.dueDate)],
            ['Status', INVOICE_STATUS_LABELS[q.status] || q.status],
            ...(q.quoteReference ? [['Quote ref.', q.quoteReference]] : []),
            ['Currency', currencyLabel(currency)]
        ]
        : [
            ['Quote #', docNum],
            ['Issued', formatDisplayDate(q.issueDate)],
            ['Valid until', formatDisplayDate(q.validUntil)],
            ['Currency', currencyLabel(currency)]
        ];
    const metaEndY = y + 9 + meta.length * 4.5;
    const headerH = Math.max(y + logoSize, metaEndY) + 3 - headerTop;

    doc.setFillColor(250, 251, 255);
    doc.setDrawColor(232, 236, 244);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, headerTop, contentW, headerH, 2.5, 2.5, 'FD');

    pdfDrawLogo(doc, margin + 2, y);
    const brandX = margin + logoSize + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(BUSINESS.name, brandX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(BUSINESS.title, brandX, y + 8.5);
    doc.text(BUSINESS.email, brandX, y + 12.5);
    doc.text(BUSINESS.location, brandX, y + 16.5);

    const badgeW = isInvoice ? 26 : 22;
    const badgeX = pageW - margin - badgeW - 2;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(badgeX, y, badgeW, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isInvoice ? 6 : 6.5);
    doc.setTextColor(99, 102, 241);
    doc.text(isInvoice ? 'INVOICE' : 'QUOTE', badgeX + badgeW / 2, y + 4.2, { align: 'center' });

    let metaY = y + 9;
    meta.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(label, pageW - margin - 2 - 44, metaY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(String(value || '—'), pageW - margin - 2, metaY, { align: 'right' });
        metaY += 4.5;
    });

    y = headerTop + headerH + 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('BILL TO', margin, y);
    y += 5;

    const clientParts = [q.clientName, q.clientCompany, q.clientEmail].filter(Boolean);
    const bodyLines = clientParts.slice(1);
    const clientName = clientParts[0] || 'Client details pending';
    const nameLines = doc.splitTextToSize(clientName, contentW - 12);
    const bodySplit = bodyLines.length
        ? doc.splitTextToSize(bodyLines.join('  ·  '), contentW - 12)
        : [];
    const boxH = nameLines.length * 4.8 + bodySplit.length * 4.2 + 9;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'FD');
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1.2);
    doc.line(margin, y + 1, margin, y + boxH - 1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(clientParts.length ? 15 : 148, clientParts.length ? 23 : 163, clientParts.length ? 42 : 184);
    doc.text(nameLines, margin + 6, y + 6.5);
    if (bodySplit.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(bodySplit, margin + 6, y + 6.5 + nameLines.length * 4.8);
    }
    y += boxH + 8;

    const tableRows = q.lineItems
        .filter((item) => item.description || item.rate)
        .map((item) => [
            item.description || '—',
            String(item.quantity),
            formatMoney(item.rate, currency),
            formatMoney(lineAmount(item), currency)
        ]);

    doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: tableRows.length ? tableRows : [['—', '—', '—', '—']],
        theme: 'grid',
        styles: {
            overflow: 'linebreak',
            cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
            fontSize: 8.5,
            textColor: [51, 65, 85]
        },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [100, 116, 139],
            fontStyle: 'bold',
            fontSize: 7,
            cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 }
        },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        columnStyles: {
            0: { cellWidth: contentW - 72, fontStyle: 'bold', textColor: [15, 23, 42] },
            1: { halign: 'center', cellWidth: 14 },
            2: { halign: 'right', cellWidth: 28 },
            3: { halign: 'right', cellWidth: 30, fontStyle: 'bold', textColor: [15, 23, 42] }
        }
    });

    y = doc.lastAutoTable.finalY + 6;

    const totalRows = [{ label: 'Subtotal', value: formatMoney(subtotal, currency) }];
    if (Number(q.taxPercent) > 0) totalRows.push({ label: 'Tax', value: formatMoney(tax, currency) });
    if (Number(q.discount) > 0) totalRows.push({ label: 'Discount', value: formatMoney(q.discount, currency) });

    y = pdfDrawTotalsBox(
        doc, pageW, margin, y, totalRows,
        isInvoice ? 'Amount due' : 'Total due',
        formatMoney(total, currency)
    );

    const paymentFields = [
        ['Method', payment.method],
        ['Account name', payment.accountName],
        ['Bank', payment.bankName],
        ['Account no.', payment.accountNumber],
        ['Branch / SWIFT', payment.branchSwift],
        ['M-Pesa', payment.mpesa]
    ].filter(([, value]) => value);

    if (paymentFields.length || !isRichEmpty(payment.instructions)) {
        y = pdfEnsureSpace(doc, y, 20, margin);

        const colW = (contentW - 8) / 2;
        const fieldRows = Math.ceil(paymentFields.length / 2);
        const instrPlain = richHtmlToPlainText(payment.instructions);
        const instrLines = instrPlain ? doc.splitTextToSize(instrPlain, contentW - 10) : [];
        const payBoxH = 12 + fieldRows * 9 + instrLines.length * 4 + (instrLines.length ? 6 : 0);

        doc.setFillColor(238, 242, 255);
        doc.setDrawColor(199, 210, 254);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentW, payBoxH, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(67, 56, 202);
        doc.text('PAYMENT DETAILS', margin + 5, y + 6);

        let py = y + 11;
        paymentFields.forEach(([label, value], i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const fx = margin + 5 + col * (colW + 4);
            const fy = py + row * 9;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(99, 102, 241);
            doc.text(label.toUpperCase(), fx, fy);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(49, 46, 129);
            doc.text(String(value), fx, fy + 3.8);
        });

        if (instrLines.length) {
            const iy = py + fieldRows * 9 + 2;
            doc.setDrawColor(165, 180, 252);
            doc.setLineWidth(0.2);
            doc.line(margin + 5, iy, pageW - margin - 5, iy);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(instrLines, margin + 5, iy + 4);
        }

        y += payBoxH + 8;
    }

    y = pdfWriteRichSection(doc, margin, pageW, y, 'Payment terms', q.paymentTerms, 'amber');
    y = pdfWriteRichSection(doc, margin, pageW, y, 'Notes', q.notes, 'muted');
    y = pdfWriteRichSection(doc, margin, pageW, y, 'General terms', q.terms, 'muted');

    y = pdfEnsureSpace(doc, y, 10, margin);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(99, 102, 241);
    doc.text('Thank you for your business.', pageW / 2, y, { align: 'center' });

    pdfAddDocumentFooters(doc, margin, pageW, docNum);

    return doc;
}

async function downloadQuotePdf(triggerBtn) {
    if (!window.jspdf) {
        showToast('PDF library failed to load — check your connection', 'error');
        return;
    }

    const btn = triggerBtn || document.getElementById('downloadQuote');
    const labelEl = btn.querySelector('.btn-label');
    const originalLabel = labelEl ? labelEl.textContent : btn.textContent;

    btn.disabled = true;
    btn.classList.add('is-loading');
    if (labelEl) labelEl.textContent = 'Generating…';

    try {
        const doc = buildQuotePdf();
        doc.save(pdfFilename());
        showToast(`Saved ${pdfFilename()}`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Download failed — try again', 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        if (labelEl) {
            labelEl.textContent = originalLabel;
        } else {
            btn.textContent = originalLabel;
        }
    }
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    if (type === 'success') toast.classList.add('is-success');
    if (type === 'error') toast.classList.add('is-error');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add('admin-hidden'), 2800);
}

function bindFormEvents() {
    document.querySelectorAll('#quoteForm input, #quoteForm select').forEach((el) => {
        el.addEventListener('input', onFormChange);
        el.addEventListener('change', onFormChange);
    });

    document.getElementById('addLineItem').addEventListener('click', () => {
        document.getElementById('lineItemsBody').appendChild(
            createLineRow({ description: '', quantity: 1, rate: 0 }, false)
        );
        document.querySelector('#lineItemsBody .remove-line[disabled]')?.removeAttribute('disabled');
        onFormChange();
    });

    document.getElementById('issueDate').addEventListener('change', (e) => {
        if (currentDocType === 'invoice') {
            const due = document.getElementById('dueDate');
            if (!due.value || due.value < e.target.value) {
                due.value = addDaysISO(e.target.value, 14);
            }
        } else {
            const valid = document.getElementById('validUntil');
            if (!valid.value || valid.value < e.target.value) {
                valid.value = addDaysISO(e.target.value, 30);
            }
        }
        onFormChange();
    });

    document.getElementById('saveQuote').addEventListener('click', persistCurrentDoc);
    document.getElementById('downloadQuote').addEventListener('click', () => downloadQuotePdf());
    document.getElementById('newQuote').addEventListener('click', () => {
        const label = currentDocType === 'invoice' ? 'invoice' : 'quote';
        if (!confirm(`Start a new ${label}? Unsaved changes will be lost unless you saved.`)) return;
        if (currentDocType === 'invoice') {
            currentInvoice = defaultInvoice();
            populateForm(currentInvoice);
        } else {
            currentQuote = defaultQuote();
            populateForm(currentQuote);
        }
    });

    document.getElementById('duplicateQuote').addEventListener('click', () => {
        readFormIntoCurrent();
        if (currentDocType === 'invoice') {
            currentInvoice = {
                ...currentInvoice,
                id: crypto.randomUUID(),
                invoiceNumber: generateInvoiceNumber(),
                issueDate: todayISO(),
                dueDate: addDaysISO(todayISO(), 14),
                status: 'unpaid',
                updatedAt: new Date().toISOString()
            };
            populateForm(currentInvoice);
            showToast('Duplicated as new invoice');
        } else {
            currentQuote = {
                ...currentQuote,
                id: crypto.randomUUID(),
                quoteNumber: generateQuoteNumber(),
                issueDate: todayISO(),
                validUntil: addDaysISO(todayISO(), 30),
                updatedAt: new Date().toISOString()
            };
            populateForm(currentQuote);
            showToast('Duplicated as new quote');
        }
    });
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function initAuth() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const hash = await sha256(password);
        const err = document.getElementById('loginError');

        if (hash === getPasswordHash()) {
            setSession();
            err.textContent = '';
            showApp();
        } else {
            err.textContent = 'Invalid password.';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        document.getElementById('password').value = '';
        showLogin();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('bizName').textContent = BUSINESS.name;
    document.getElementById('bizTitle').textContent = BUSINESS.title;
    document.getElementById('bizEmail').textContent = BUSINESS.email;
    document.getElementById('bizLocation').textContent = BUSINESS.location;
    document.getElementById('previewFromName').textContent = BUSINESS.name;
    document.getElementById('previewFromTitle').textContent = BUSINESS.title;
    document.getElementById('previewFromEmail').textContent = BUSINESS.email;
    document.getElementById('previewFromLocation').textContent = BUSINESS.location;

    initAuth();
    initTabs();
    bindFormEvents();

    if (isAuthenticated()) {
        showApp();
    } else {
        showLogin();
    }
});
