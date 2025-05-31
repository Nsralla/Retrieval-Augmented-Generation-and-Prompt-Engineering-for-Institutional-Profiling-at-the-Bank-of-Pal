# Description: This script converts the cleaned JSON data into a human-readable format in both TXT and Markdown files.
import json
import os

# Load the cleaned JSON file
input_file = "scraped_data/bop_website_cleaned.json"
output_txt_file = "scraped_data/bop_website_readable.txt"
output_md_file = "scraped_data/bop_website_readable.md"

# Ensure directory exists
os.makedirs("scraped_data", exist_ok=True)

# Load data
with open(input_file, encoding="utf-8") as f:
    pages = json.load(f)

# Convert to TXT and Markdown
with open(output_txt_file, "w", encoding="utf-8") as txt_out, \
     open(output_md_file, "w", encoding="utf-8") as md_out:

    for page in pages:
        header = f"{'='*80}\nURL: {page['url']}\nLanguage: {page['lang']}\n{'='*80}\n\n"
        txt_out.write(header)
        md_out.write(f"# {page['url']}\n\n")

        for line in page['content'].split("\n"):
            line = line.strip()
            if line:
                txt_out.write(f"• {line}\n")
                md_out.write(f"- {line}\n")

        txt_out.write("\n\n")
        md_out.write("\n\n")


