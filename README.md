# Bank of Palestine Website Scraper & Embedding Pipeline

This project provides a pipeline to scrape the Bank of Palestine website, clean and process the data, convert it to human-readable formats, and embed Arabic content into a FAISS vector database for downstream NLP tasks.

## Project Structure

- `scrape_bop.py`: Scrapes the Bank of Palestine website, cleans the text, removes boilerplate, and saves the result as a JSON file.
- `redable.py`: Converts the cleaned JSON data into human-readable `.txt` and `.md` files.
- `app.py`: Loads the cleaned JSON, splits Arabic content into chunks, embeds them using a HuggingFace model, and stores them in a FAISS vector database.
- `scraped_data/`: Contains the output files:
  - `bop_website_cleaned.json`: Cleaned and filtered website data.
  - `bop_website_readable.txt`: Human-readable text version.
  - `bop_website_readable.md`: Human-readable markdown version.
- `requirements.txt`: Python dependencies for the project.
- `.env`: Environment variables (e.g., API keys).

## Data Pipeline Overview

### Data Collection

- Scrape BoP content from their website, social media (Facebook, LinkedIn, Twitter, etc.), and any other public resources.

### Data Preprocessing

- Clean and format the scraped data.
- Split content into semantically meaningful chunks.

### Document Embedding

- Use OpenAI's embedding model (e.g., `text-embedding-3-small`) to convert text chunks into vectors.

### Vector Database Storage

- Store vectors using a vector DB (e.g., FAISS for local setup, Chroma for LangChain integration, or Pinecone for managed scalable solution).

### User Query Handling

- On user input, embed the query and perform a similarity search in the vector DB to retrieve top-k relevant chunks.

### Prompt Composition

- Dynamically construct a prompt by combining a static system prompt with the retrieved context and user query.

### Response Generation

- Use OpenAI (GPT-4 or GPT-3.5) to generate a domain-specific answer with injected context.

### LangChain Orchestration

- Chain all the above steps using LangChain’s RetrievalQA or custom chains.

## Usage

### 1. install requirements file
``` sh
pip install -r requirements.txt
```
### 2. Scrape and Clean the Website

Run the scraper to crawl and clean the website:

```sh
python scrape_bop.py
python redable.py
```
### 3.  Chunk and Embed Arabic Content
```sh
python app.py
```

### 4. handle use query to retrieve relveant documents
```sh
python query_handle.py
```
