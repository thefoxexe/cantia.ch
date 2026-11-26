# Builds the Black Friday e-mail for unfinished sign-ups (FR/DE/IT): plain,
# table-based HTML with inline styles, readable in Gmail, Outlook and Apple
# Mail. One image only, the official logo served by cantia.ch, with alt text.
LINK = 'https://cantia.ch{p}/black-friday?utm_source=email&utm_medium=email&utm_campaign=bf2026-relance'

C = {
 'fr': dict(p='', subject='Votre compte Cantia, à moitié prix jusqu’à lundi',
   preheader='Notre premier Black Friday : jusqu’à -54 % à vie, jusqu’au lundi 30 novembre à minuit.',
   hello='Bonjour,',
   p1='Vous aviez commencé à créer votre compte Cantia, sans aller jusqu’au bout.',
   p2='C’est notre premier Black Friday, alors je préfère vous prévenir directement : jusqu’au <b>lundi 30 novembre à minuit</b>, tous les plans sont à prix réduit. Et ce prix reste le vôtre tant que vous gardez l’abonnement.',
   rows=[('Essentiel', '39.–', '25.–'), ('Équipe', '79.–', '45.–'), ('Entreprise', '129.–', '59.–')],
   head=('Plan', 'Avant', 'Black Friday'), per='par mois, à vie',
   cta='Voir l’offre',
   p3='Vous avez déjà un compte : choisissez votre plan sur la page, puis connectez-vous avec votre adresse habituelle. Les prix Black Friday s’affichent directement.',
   p4='Si Cantia ne vous convient pas, vous êtes remboursé pendant 14 jours, sans justification.',
   p5='Une question avant de vous décider ? Répondez simplement à ce mail, je vous réponds moi-même.',
   bye='Belle journée,', sign='Bastien', role='Fondateur de Cantia',
   foot='Vous recevez ce mail parce que vous avez créé un compte sur cantia.ch. Pour ne plus recevoir nos offres, répondez « stop ».'),
 'de': dict(p='/de', subject='Ihr Cantia-Konto, zum halben Preis bis Montag',
   preheader='Unser erster Black Friday: bis zu -54 % lebenslang, bis Montag, 30. November, Mitternacht.',
   hello='Grüezi',
   p1='Sie hatten begonnen, Ihr Cantia-Konto zu erstellen, sind aber nicht ganz fertig geworden.',
   p2='Es ist unser erster Black Friday, deshalb sage ich es Ihnen lieber direkt: Bis <b>Montag, 30. November, Mitternacht</b> sind alle Pläne günstiger. Und dieser Preis bleibt Ihrer, solange Sie das Abo behalten.',
   rows=[('Essentiel', '39.–', '25.–'), ('Équipe', '79.–', '45.–'), ('Entreprise', '129.–', '59.–')],
   head=('Plan', 'Vorher', 'Black Friday'), per='pro Monat, lebenslang',
   cta='Zum Angebot',
   p3='Sie haben schon ein Konto: Wählen Sie Ihren Plan auf der Seite und melden Sie sich dann mit Ihrer gewohnten Adresse an. Die Black-Friday-Preise erscheinen direkt.',
   p4='Passt Cantia nicht, erhalten Sie Ihr Geld innerhalb von 14 Tagen zurück, ohne Begründung.',
   p5='Eine Frage, bevor Sie sich entscheiden? Antworten Sie einfach auf diese E-Mail, ich antworte Ihnen persönlich.',
   bye='Freundliche Grüsse', sign='Bastien', role='Gründer von Cantia',
   foot='Sie erhalten diese E-Mail, weil Sie ein Konto auf cantia.ch erstellt haben. Um keine Angebote mehr zu erhalten, antworten Sie mit «Stopp».'),
 'it': dict(p='/it', subject='Il suo account Cantia, a metà prezzo fino a lunedì',
   preheader='Il nostro primo Black Friday: fino a -54 % a vita, fino a lunedì 30 novembre a mezzanotte.',
   hello='Buongiorno,',
   p1='Aveva iniziato a creare il suo account Cantia, senza arrivare fino in fondo.',
   p2='È il nostro primo Black Friday, quindi preferisco avvisarla direttamente: fino a <b>lunedì 30 novembre a mezzanotte</b> tutti i piani sono scontati. E questo prezzo resta suo finché mantiene l’abbonamento.',
   rows=[('Essentiel', '39.–', '25.–'), ('Équipe', '79.–', '45.–'), ('Entreprise', '129.–', '59.–')],
   head=('Piano', 'Prima', 'Black Friday'), per='al mese, a vita',
   cta='Vedere l’offerta',
   p3='Ha già un account: scelga il piano sulla pagina, poi acceda con il suo indirizzo abituale. I prezzi Black Friday appaiono direttamente.',
   p4='Se Cantia non fa per lei, viene rimborsato entro 14 giorni, senza giustificazioni.',
   p5='Una domanda prima di decidere? Risponda semplicemente a questa e-mail, le rispondo personalmente.',
   bye='Cordiali saluti,', sign='Bastien', role='Fondatore di Cantia',
   foot='Riceve questa e-mail perché ha creato un account su cantia.ch. Per non ricevere più le nostre offerte, risponda «stop».'),
}

INK = '#1f221c'; MUTED = '#6b6f63'; FLAME = '#ff5b1f'; LINE = '#e7e4da'; BG = '#f4f2ec'; NIGHT = '#0b0c09'
FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
# The official white logo, already served by cantia.ch (public/email/).
LOGO = 'https://cantia.ch/email/04_blanc_logo_et_texte.png'
ADDRESS = 'Cantia · Ryser Creative · Sion, Suisse'

def build(loc):
    c = C[loc]
    link = LINK.format(p=c['p'])
    para = lambda t, extra='': f'<p class="t" style="margin:0 0 16px;font-size:16px;line-height:25px;color:{INK};{extra}">{t}</p>'
    rows = ''.join(
        f'<tr><td style="padding:13px 0;border-top:1px solid {LINE};font-size:16px;color:{INK};font-weight:600;">{n}</td>'
        f'<td align="right" style="padding:13px 0;border-top:1px solid {LINE};font-size:14px;color:{MUTED};"><s>CHF {a}</s></td>'
        f'<td align="right" style="padding:13px 0 13px 14px;border-top:1px solid {LINE};font-size:18px;color:{FLAME};font-weight:800;white-space:nowrap;">CHF {b}</td></tr>'
        for n, a, b in c['rows'])
    return f"""<!doctype html>
<html lang="{loc}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{c['subject']}</title>
<style>
  body{{margin:0;padding:0;-webkit-text-size-adjust:100%;}}
  a{{color:{FLAME};}}
  @media only screen and (max-width:600px){{
    .wrap{{padding:14px 8px !important;}}
    .pad{{padding-left:22px !important;padding-right:22px !important;}}
    .btn,.btn a{{display:block !important;width:100% !important;text-align:center !important;box-sizing:border-box;}}
    .logo{{width:150px !important;height:auto !important;}}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">{c['preheader']}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BG};">
<tr><td align="center" class="wrap" style="padding:28px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid {LINE};font-family:{FONT};">
    <tr><td class="pad" style="background:{NIGHT};padding:24px 32px;border-bottom:3px solid {FLAME};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td><a href="https://cantia.ch" style="text-decoration:none;"><img class="logo" src="{LOGO}" width="170" height="31" alt="Cantia" style="display:block;border:0;width:170px;height:31px;color:#ffffff;font-size:20px;font-weight:700;"></a></td>
        <td align="right" style="font-size:12px;font-weight:700;letter-spacing:1px;color:{FLAME};white-space:nowrap;">Black Friday</td>
      </tr></table>
    </td></tr>
    <tr><td class="pad" style="padding:30px 32px 8px;">
      {para(c['hello'])}
      {para(c['p1'])}
      {para(c['p2'])}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px;">
        <tr><td style="padding:0 0 8px;font-size:12px;color:{MUTED};">{c['head'][0]}</td>
            <td align="right" style="padding:0 0 8px;font-size:12px;color:{MUTED};">{c['head'][1]}</td>
            <td align="right" style="padding:0 0 8px 14px;font-size:12px;color:{FLAME};font-weight:700;">{c['head'][2]}</td></tr>
        {rows}
      </table>
      <p style="margin:0 0 24px;font-size:13px;color:{MUTED};text-align:right;">{c['per']}</p>
      <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr><td class="btn" align="center" style="background:{FLAME};border-radius:10px;">
          <a href="{link}" style="display:inline-block;padding:15px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">{c['cta']}</a>
        </td></tr>
      </table>
      {para(c['p3'], f'color:{MUTED};font-size:14px;line-height:22px;')}
      {para(c['p4'])}
      {para(c['p5'])}
      {para(c['bye'] + '<br>' + c['sign'] + f'<br><span style="color:{MUTED};font-size:14px;">' + c['role'] + '</span>', 'margin-bottom:28px;')}
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;font-family:{FONT};">
    <tr><td class="pad" style="padding:16px 32px;font-size:12px;line-height:18px;color:{MUTED};text-align:center;">{c['foot']}<br>{ADDRESS} · <a href="https://cantia.ch" style="color:{MUTED};">cantia.ch</a></td></tr>
  </table>
</td></tr>
</table>
</body>
</html>
"""

def build_text(loc):
    import re, html
    c = C[loc]
    strip = lambda t: html.unescape(re.sub('<[^>]+>', '', t))
    lines = [c['hello'], '', strip(c['p1']), '', strip(c['p2']), '']
    lines += [f"- {n} : CHF {b} au lieu de CHF {a}" if loc == 'fr' else f"- {n}: CHF {b} ({c['head'][1]} CHF {a})" for n, a, b in c['rows']]
    lines += [f"({c['per']})", '', f"{c['cta']} : {LINK.format(p=c['p'])}", '', strip(c['p3']), '', strip(c['p4']), '', strip(c['p5']), '', c['bye'], c['sign'], c['role'], '', '--', strip(c['foot']), ADDRESS]
    return '\n'.join(lines) + '\n'

import json
meta = {}
for loc in C:
    open(f'black-friday-relance-{loc}.html', 'w').write(build(loc))
    open(f'black-friday-relance-{loc}.txt', 'w').write(build_text(loc))
    meta[loc] = {'subject': C[loc]['subject'], 'preheader': C[loc]['preheader']}
json.dump(meta, open('objets.json', 'w'), ensure_ascii=False, indent=1)
print('ok')
