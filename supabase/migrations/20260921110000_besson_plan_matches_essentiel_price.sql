-- Correct the price (39.00, matching what was actually created in Stripe —
-- not the original 39.90 draft) and bring the feature set up to full parity
-- with Essentiel (customization, email sending, AI assistant quota), on top
-- of the two additions this plan exists for: Bexio integration and
-- profitability tracking.
update public.plans
set
  price_chf_monthly = 39.00,
  has_customization = true,
  has_email_sending = true,
  max_ai_uses_per_month = 150
where id = 'custom-besson';
