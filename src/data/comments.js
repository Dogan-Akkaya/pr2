// ═══════════════════════════════════════════════════════════════════
// Comments source — mirrors Imported_HTMLs/comments.md verbatim.
// Two surfaces consume this:
//   1. CommentsPanel  — full-page commentary keyed by route
//   2. HoverComment   — short, container-scoped tooltips keyed by anchor
// ═══════════════════════════════════════════════════════════════════

// General preamble shown above every page's commentary in the panel.
export const GENERAL_COMMENTS = [
  "We want to target enterprises with the data we show and how we show.",
  "Our goal is to communicate the data that we can collect so they can see the data even though they may not have an active threat from the particular threat.",
];

// Section 1 — full-page commentary keyed by route pathname.
// `/n` tokens from comments.md are normalised to real line breaks.
const norm = (s) => s.replace(/\s*\/n\s*/g, "\n").trim();

export const PAGE_COMMENTS = {
  "/dashboard": norm(
    "The new dashboard will be focusing on two goals /n " +
    "1. Showing their own latest findings and security stand at a glance /n " +
    "2. Showing latest global news about darkweb and cyber security. /n " +
    "The screen starts with a info card where it's own explaination is on top right corner. Then we divided screen for clarity /n " +
    "1. Yours Part: this is dedicated with widgets showing findings — something similar to what we have already. /n " +
    "2. Global part: this is new. Our goal is to only show some findings that we choosed; we aim to catch their attention and show off. " +
    "Do not focus on practicality here. Our goal is to show different stuff — even it is not fully related to their region/industry — " +
    "we seek to catch their attention through showing interesting information here. " +
    "The hard part is they have to be updated stuff so instead of prebuilt things we want to focus on live widgets where we can manage to change " +
    "(for example a Dark Web News widget where we choose the 3 news, or a Threat Actor similarly we choose). " +
    "The choosement can be done via an admin settings page."
  ),

  "/global-threats": norm(
    "Global Threats is focusing on providing the global data on the dashboard in a more practical and query-based way. " +
    "This is why we wanted to keep it restricted on the dashboard. That being said, this page consists of /n " +
    "1. Search bar: with query operators that can be nested — just like threat hunting — don't forget to enable country, region and industry filtering. /n " +
    "2. Pre-built filter buttons: exactly like shown here. Save buttons and saves, as users may want to save and check certain queries. /n " +
    "3. Lastly data containers: these will be data containers tied to our query. They will change according to the search and consist of data we can provide as shown. /n " +
    "Our goal is to make this page a no-brainer for people to search news within or out their context. Despite we are showing practicality, " +
    "it is not focusing on showing them their findings — instead we aim to show what SOCRadar tracks and is able to find in general."
  ),

  "/protection-coverage": norm(
    "This page hasn't changed much practically unlike the others. Here we tried to pursue a visual change. " +
    "Similarly this page is a management interface regarding their tracking limits, so our goal is to make sure they are adding stuff until they fill up one of their rights. " +
    "When that happens, instead we should change our language and then say \"hey it looks like you filled up this — do you need more? if you want we can help you, contact us!\" " +
    "Nonetheless there are some CEO comments regarding the page; please ensure these are complied with. /n " +
    "1. We want to ditch the previous excel look. /n " +
    "2. Please add visuals showing about how they fill, just like in example."
  ),

  "/data-on-sale": norm(
    "This is our old Black Market screen. Similarly we tried to reach a page without an excel look. Many things remain the same."
  ),
  "/black-market": norm(
    "This is our old Black Market screen. Similarly we tried to reach a page without an excel look. Many things remain the same."
  ),

  "/customer-leaks": norm(
    "This one is a new page. Our goal is to detect and show off with customer findings that we have. " +
    "While doing that, consider both ones actively on sale or not. Our goal is to create the value and show them they have that many customer leaks on the dark web — " +
    "and they could be able to collect, and if someone would do that and share as a customer leak of X (customer name) it may cost Y million dollars under " +
    "US laws or GDPR (depending on user region). /n Page starts with a summary card and then proceeds with in-detail cards."
  ),

  "/domain-exposure": norm(
    "This is a digested page combining our domain-related findings like botnet. The goal is to keep headlines no-brainer for the users."
  ),

  "/pii": norm(
    "This one is the updated version of our PII. We want to take a step further and show more than just leak account credentials — " +
    "we want to show SSN, national ID number, financial data with names, address, phone number, or just email address and leak context. /n " +
    "Our goal is to gather attention on all PII leaked online. If possible we may try to search for findings with matching names on LinkedIn, but this can be full of FPs " +
    "therefore this can be alarm- or search-based. Meanwhile you can add general data — just like on Global Threats — to the bottom of the page to show the data and catch their attention."
  ),

  "/executive-protection": norm(
    "This will be an updated version of our previous VIP radar. We want to keep a look out of our excel look — we can have cards for each added VIP from Protection Coverage."
  ),

  "/third-party": norm(
    "This is a new page. Basically we want to snapshot our power in supply chain. As it is not conceptually in DWI we can ask them to check their third party companies. " +
    "So in nutshell we want you to connect our supply chain data here, where they can see at a glance how many companies we track, and should be able to search and add " +
    "themselves country to track — similar with supply chain reports, but the name should be \"Third Party Security Audit Reports\" or something like that."
  ),

  "/telegram": norm(
    "This is again a new page only focusing on showing our capability on Telegram data. We want to communicate more on how Telegram is now the new dark web and how we are good to track depth and breadth of it. /n " +
    "In this page we may again show some statistics in general, but this page's focus is more about this live Telegram-account-mimicking thing. " +
    "Just like threat hunting we want them to query and see messages — even if possible reach and see the collected messages we have from certain channels — as if they are visiting the Telegram channel by themselves via a cellphone (this is why the visual is like that). " +
    "Again we want to provide some filters on time and keywords for them to easily check on and see stuff."
  ),

  "/fraud-intelligence": norm(
    "This is an extended view of our fraud part. In first it was just credit cards — now we are able to provide as many exposures as we can shown here."
  ),

  "/insider-threat": norm(
    "This is another new page. Our goal is to show this as a concept and the feeling that we got it covered. " +
    "Therefore if we find anything regarding this and regarding their domains we should show it on top rather than this green screen. " +
    "But let's be honest — this will be green 99% of the time. Therefore the page is designed more about showing general data from dark web chatter showing — with screenshots — " +
    "how threat actors may look for insider help to start their attacks. Show available data and digest screenshots here like Dark Web News. " +
    "Also add widgets like most-targeted industries etc. using the labels in our data."
  ),

  "/iab-monitor": norm(
    "This is good old Identity & Access Intelligence with a new name. Nothing else has changed."
  ),

  "/dark-web-search": norm(
    "This is our Dark Web Search — threat hunting. Nothing changed."
  ),

  "/dark-web-news": norm(
    "Will be mostly the same; only difference is we stripped away ransomware intelligence and are showing it as a separate screen."
  ),

  "/ransomware-news": norm(
    "Similar to Dark Web News we want to copy the same page and dedicate it for ransomware for more visibility on the topic."
  ),

  "/rfi": norm(
    "This is basically a page showing the information here and having a working \"Contact our team.\" The Contact-our-team form should be connected to a new form and should be connected to a different automation to HubSpot. " +
    "Contact Doğan Akkaya for more info when you are building this."
  ),

  "/coverage": norm(
    "This is the page where we are showing all the sources that we track — also that we can disclose. " +
    "I get those from threat hunting but you may use something else to put more sources if we can. This is again a page showing only what we do."
  ),

  "/breach-index": norm(
    "This page is like our combolist sources. Basically we want to show the latest added breaches etc. " +
    "It should be something live showing what data we cover. We also inspired from Have I Been Pwned's source website."
  ),

  "/incidents": norm(
    "Same as before — see the General Comments above. Operational triage page; no commentary changes for this round."
  ),

  "/reports": norm(
    "Same as before — see the General Comments above. Reporting hub; no commentary changes for this round."
  ),
};

// Section 2 — short, container-scoped tooltips keyed by anchor.
export const HOVER_COMMENTS = {
  "dashboard.info-card": norm(
    "This is a live widget placed on top. Our goal is to bring most-important findings to make them act on. " +
    "If they have nothing that important — or something mildly critical — then the color will ease, shifting to green or yellow accordingly. " +
    "You may use the settings on top-right to change the severity to dynamically see how it works. " +
    "Also it shows and directs the user to commit more if they are not full; if they are full, instead of directing them to coverage we may say \"increase your coverage\" " +
    "(a text that will trigger the contact-us form)."
  ),
  "dashboard.global-intel": norm(
    "These data widgets should be arranged from an admin panel — they will be pre-chosen stuff. " +
    "When clicked on, they should either direct to their dedicated channels — like Telegram and Dark Web News — or to Global Threats."
  ),
  "global-threats.context": norm(
    "These buttons will be live and trigger certain nested queries. Also we have save options where we'll save the query and enable the user to directly see the query."
  ),
  "global-threats.heatmap": norm(
    "Heat map of top industries with attack types that we can track."
  ),
  "global-threats.telegram": norm(
    "This will show the live data. On the left we'll have search operators and bar, while we show pre-chosen \"trending topics\" on the right."
  ),
  "global-threats.news": norm(
    "A snapshot of what we have, showing latest data according to our query."
  ),
  "protection-coverage.attention": norm(
    "This is the modal where I said we'll show and push them to add more until they fill any of their rights. " +
    "Then immediately we'll change this to \"You look like you are out of this. Would you like to contact us to get more?\""
  ),
  "customer-leaks.infocard": norm(
    "This will be a synthesis of the data we show them — rather than something AI-generated, I think of something with fixed data and categorization. " +
    "Some users may not have that wide customer data or may not care at all; if the numbers are too low we could change the text to something more general. " +
    "Here we should choose the compliance cost estimator's country according to the user's country."
  ),
};

// Helper: pretty-print a route as a label (e.g. "/dashboard" → "DASHBOARD")
export function routeLabel(pathname) {
  if (!pathname || pathname === "/") return "ROOT";
  return pathname.replace(/^\//, "").replace(/-/g, " ").toUpperCase();
}
