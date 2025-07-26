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

# Chatbot UI

A lightweight and modern chat interface for LLM interactions with Markdown support!

## Overview

A minimalist chat interface built with React and TypeScript, designed to be easily integrated with any LLM backend. Features a clean and modern design.

![Demo](demo/image.png)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/ChristophHandschuh/chatbot-ui.git
cd chatbot-ui
```

2. Install dependencies
```bash
npm i
```

3. Start the development server
```bash
npm run dev
```

## Test Mode

The project includes a test backend for development and testing purposes. To use the test mode:

1. Navigate to the testbackend directory
2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```
3. Install the required package:
```bash
pip install websockets
```
4. Run the test backend:
```bash
python test.py
```



Some code components were inspired by and adapted from [Vercel's AI Chatbot](https://github.com/vercel/ai-chatbot).




## code description:
Our Bank Of Palestine project (Using LLM and Prompt engineering to build a profile for an
institution (Bank, Hospital, University: Given an institution and search
results search one needs to build a profile using LLMs, prompt engineering with
preference to recent or quality data) achievements:
1- BOP official website has been scraped to feed LLAMA with data.
1.1- the scraped data from official website has been saved as json file.
1.2- FAISS (Facebook AI Similarity Search) index was created through a systematic process designed to efficiently store and retrieve Arabic language documents. The index creation follows a well-structured pipeline that transforms raw text data into searchable vector embeddings.:
The chunk_and_embed() function processes the source documents with specific filtering criteria:

Only Arabic language documents (where lang == 'ar') are selected for indexing
Each document is preserved as a complete unit rather than being subdivided
Empty content documents are excluded from indexing. Vector embeddings are created using a specialized multilingual model:

This model is particularly effective for Arabic text, producing 768-dimensional vectors that capture semantic meaning.

4. FAISS Index Construction
The system constructs a FAISS index from the document embeddings:

Each document is indexed with metadata containing:

Source URL (source)
Language identifier (lang)
5. Persistence Mechanism
The index is saved to the filesystem for future use:

6. Initialization Controls
The system employs two layers of initialization controls:

Initial Check: During application startup, it verifies if the index exists

Startup Event: The FastAPI application's startup event includes a secondary verification using initialize_vector_store() from the pipeline module

Technical Specifications
Embedding Model: intfloat/multilingual-e5-base (optimized for multilingual text)
Computing Resources: Utilizes GPU acceleration when available, with CPU fallback
Storage Format: Standard FAISS flat index with separate index and metadata files
Target Language: Specifically optimized for Arabic text documents..
ser Query Processing in the Bank of Palestine Information System
Query Processing Methodology
When a user submits a query to the Bank of Palestine information system, the query undergoes a sophisticated retrieval and response generation process incorporating multilingual semantic search technology.

Processing Sequence
The system employs a progressive retrieval-augmented generation approach:

Query Reception and Authentication
Upon receipt, each query is authenticated within its corresponding chat session to ensure appropriate access controls are maintained.

Semantic Embedding Generation
The query is transformed into a high-dimensional vector representation using the multilingual-e5-base embedding model, which accurately captures the semantic meaning across both Arabic and English content.

Knowledge Base Consultation
The system consults a FAISS (Facebook AI Similarity Search) index containing comprehensive Bank of Palestine documentation. This index maintains the original document structure without fragmentation to preserve contextual integrity.

Intelligent Document Prioritization
The system employs special handling for overview-related queries, automatically prioritizing foundational institutional information when such context is requested.

Relevance-Based Document Selection
The top-ranking documents are selected based on semantic similarity scores, ensuring the most pertinent information is retrieved for each query.

Context Assembly
Selected documents are assembled into a comprehensive context block with clear demarcations between different information sources.

Response Generation
The user query and assembled context are transmitted to a specialized natural language processing service that generates coherent, contextually appropriate responses.

Response Delivery
The system delivers the final response to the user within the appropriate chat context, maintaining conversation continuity.
2- Bank reviews (stars rank and review text) for the bank branches from Google maps have been scraped.
Sentiment Analysis Implementation in the Bank of Palestine Information System
Methodology Overview
The Bank of Palestine customer feedback analysis system employs a sophisticated multi-class sentiment analysis framework to automatically categorize customer reviews based on their emotional valence. This implementation leverages transfer learning techniques through a pre-trained multilingual transformer model to accommodate the diverse linguistic characteristics of the customer base.

Technical Implementation
Model Architecture and Selection
The system utilizes the bert-base-multilingual-uncased-sentiment model developed by NLP Town, which is built upon the BERT architecture (Bidirectional Encoder Representations from Transformers). This particular model variant offers several strategic advantages for the financial institution's feedback analysis requirements:

Multilingual Capability: Supports both Arabic and English content without requiring separate model implementations
Fine-tuned Classification: Pre-trained specifically for sentiment classification tasks within a 5-point scale framework
Context-aware Analysis: Captures nuanced sentiment expressions through contextual embeddings
Classification Framework
The sentiment analysis pipeline employs a three-tier classification system:

Initial Classification: Customer feedback text is processed through the transformer-based model to produce a 5-point sentiment score (1-5 stars)

Normalization Protocol: The numerical scores are then mapped to a standardized sentiment taxonomy:

Scores of 1-2 stars → Negative sentiment designation
Score of 3 stars → Neutral sentiment designation
Scores of 4-5 stars → Positive sentiment designation
Input Processing Controls: Implementation includes systematic controls to:

Handle empty input gracefully (defaulting to neutral classification)
Limit input processing to the initial 512 tokens to ensure computational efficiency while maintaining analytical integrity
Implement error handling to ensure system resilience
System Integration
The sentiment analysis functionality is systematically integrated within the broader customer feedback processing framework:

Initialization Phase: The sentiment classification pipeline is instantiated during application initialization to minimize computational overhead

Review Processing Workflow: During the application startup event, all customer reviews undergo sentiment classification and enrichment:

Each review is processed through the sentiment analysis pipeline
The derived sentiment classification is appended to the review metadata
The enriched review objects are stored in memory for efficient querying
Query Support: The sentiment classifications enable sophisticated filtering capabilities within the API, allowing stakeholders to isolate reviews based on their emotional valence as part of comprehensive feedback analysis

Performance Considerations
The implementation balances analytical performance with computational efficiency through:

Single-load Model Instantiation: The model is loaded once during application initialization
Input Length Optimization: Processing is limited to the first 512 characters to prevent unnecessary computation while preserving analytical accuracy
Exception Handling: Robust exception handling ensures system stability even when processing atypical input
 Bank of Palestine Profile Generation Methodology
Comprehensive Framework Overview
The Bank of Palestine profile generation system employs an advanced natural language processing architecture that synthesizes multiple data sources into a comprehensive institutional profile. This system integrates static institutional knowledge with dynamic data points to produce a multidimensional representation of the financial institution.

Core Architectural Components
1. Foundational Knowledge Repository
The system maintains a comprehensive Arabic-language knowledge base containing authoritative institutional information. This repository includes:

Historical establishment context dating to 1960
Organizational leadership structure
Service offerings portfolio
Corporate social responsibility initiatives
Branch network infrastructure
Strategic partnerships and investment relationships
2. Multi-source Data Integration Framework
The profile generation process systematically aggregates information from four distinct data channels:

Vector-embedded Institutional Documentation: Retrieved from a FAISS (Facebook AI Similarity Search) index containing semantically searchable Arabic documents
Customer Sentiment Corpus: Collected from structured review data with sentiment classifications
Branch Performance Metrics: Compiled from numerical rating assessments across the institution's branch network
Geographic Distribution Data: Sourced from branch location records spanning the West Bank and Gaza Strip
3. Context Assembly Process
The system employs a deterministic context assembly algorithm that:

Prioritizes Authoritative Content: The core Arabic institution profile is inserted at the beginning of the context window to ensure authoritative information receives processing priority
Supplements with Retrieved Documents: Additional contextually relevant documents are retrieved using semantic similarity search via the FAISS index
Enforces Information Resilience: Even in cases where vector search operations fail, the system maintains functionality by defaulting to the core institutional profile
4. Prompt Engineering Protocol
A sophisticated prompt engineering methodology structures the generation request into distinct analytical components:

Institution historical and operational description
Public perception analysis based on review sentiment
Branch network geographical distribution
Quantitative branch performance assessment
Strengths and weaknesses analysis
Service portfolio enumeration
Recent institutional developments
5. Generation and Verification Mechanisms
The system employs a dual-phase generation and verification approach:

Initial Profile Generation: Utilizing the Meta-Llama-3-8B-Instruct language model with controlled temperature settings (0.3) to ensure factual consistency
Post-generation Verification: Implementing programmatic checks to ensure critical information components (particularly branch ratings) are present in the final output
Information Remediation: Automatically supplementing missing critical information when verification checks fail
Implementation Architecture
The profile generation capability is exposed through a RESTful API endpoint (/institution-profile) that:

Invokes the generation pipeline with appropriate error handling
Returns the structured profile in a standardized JSON response format
Implements proper HTTP status code handling for error conditions
This methodological approach ensures the consistent production of comprehensive, accurate, and structured institutional profiles that incorporate both authoritative information and dynamic performance metrics, providing stakeholders with a holistic view of the Bank of Palestine's operational characteristics and performance indicators.

