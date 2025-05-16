#  Description: This script scrapes BOP website, cleans the data, and saves it in a JSON file.
import os
import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from collections import Counter

# --- Configuration ---
BASE_URL    = "https://www.bankofpalestine.com/"
MAX_PAGES   = 20  # Max pages to crawl
OUTPUT_DIR  = "scraped_data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "bop_website_cleaned.json")

# --- Globals ---
visited          = set()
GLOBAL_LINE_FREQ = Counter()
ALL_PAGES_RAW    = []  # Stores {"url": ..., "lines": [...]}

# --- Helpers ---

def clean_unicode_control_chars(text: str) -> str:
    return re.sub(
        r'[\u200E\u200F\u202A-\u202E\u2066-\u2069\u0000-\u001F\u007F-\u009F]',
        "",
        text
    )

def is_suspicious_text(text: str) -> bool:
    words = text.split()
    cap_words = sum(1 for w in words if w.isupper())
    if cap_words > 3 and cap_words > len(words)/2:
        return True
    if len(set(words)) < len(words)/2:
        return True
    return False

def extract_text_from_url(url: str,
                          min_word_count: int = 2,
                          min_char_count: int = 12) -> list[str]:
    """Fetch page, strip HTML, split into lines, filter out rubbish."""
    resp = requests.get(url)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding

    cleaned_html = clean_unicode_control_chars(resp.text)
    soup         = BeautifulSoup(cleaned_html, "html.parser")
    raw_text     = soup.get_text(separator="\n")

    lines = []
    for line in raw_text.split("\n"):
        line = line.strip()
        if (not line
            or len(line) < min_char_count
            or len(line.split()) < min_word_count
            or is_suspicious_text(line)):
            continue
        lines.append(line)

    # --- DEDUPE LINES WITHIN THIS PAGE, PRESERVE ORDER ---
    unique = []
    seen   = set()
    for l in lines:
        if l not in seen:
            unique.append(l)
            seen.add(l)
    return unique

def is_valid_url(url: str) -> bool:
    return url.startswith(BASE_URL)

# --- Crawl & collect ---

def crawl_site(start_url: str, max_pages: int = 2) -> list[dict]:
    to_visit = [start_url]

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        if url in visited or not is_valid_url(url):
            continue

        visited.add(url)
        print(f"({len(visited)}) Crawling: {url}")

        try:
            texts = extract_text_from_url(url)
        except requests.RequestException:
            continue

        # update global frequency (each line counts at most once per page)
        for line in texts:
            GLOBAL_LINE_FREQ[line] += 1

        ALL_PAGES_RAW.append({"url": url, "lines": texts})

        # enqueue same-domain links
        soup = BeautifulSoup(requests.get(url).text, "html.parser")
        for a in soup.find_all("a", href=True):
            full = urljoin(url, a["href"])
            if full not in visited and is_valid_url(full):
                to_visit.append(full)

    return ALL_PAGES_RAW

def filter_repeated_lines(lines: list[str],
                          min_freq: float,
                          total_pages: int) -> list[str]:
    """
    Remove lines that appear on ≥ min_freq * total_pages pages
    (i.e. boilerplate).
    """
    threshold = min_freq * total_pages
    return [l for l in lines if GLOBAL_LINE_FREQ[l] < threshold]

# --- Orchestrator ---

def run():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1) Crawl
    pages_raw = crawl_site(BASE_URL, max_pages=MAX_PAGES)
    total     = len(pages_raw)

    # 2) Filter & package
    cleaned = []
    for pg in pages_raw:
        kept_text = filter_repeated_lines(pg["lines"], min_freq=0.5, total_pages=total)
        content   = "\n".join(kept_text)
        if len(content) > 200:
            cleaned.append({
                "url":     pg["url"],
                "lang":    "ar" if "/ar/" in pg["url"] else "en",
                "content": content
            })

    # 3) Save JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"\n[✓] Cleaned {len(cleaned)} pages → '{OUTPUT_FILE}'")

if __name__ == "__main__":
    run()
