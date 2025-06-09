# -*- coding: utf-8 -*-
import os
import json
import re
from pathlib import Path
from collections import defaultdict
from transformers.pipelines import pipeline
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema.document import Document

# Path configurations
BACKEND_DIR = Path(__file__).resolve().parent
INDEX_DIR = BACKEND_DIR / "faiss_index2"
DATA_DIR = BACKEND_DIR / "scraped_data"
JSON_FILE = DATA_DIR / "bop_website_cleaned.json"

# Load NER pipeline from Hugging Face (no spaCy required)
print("Loading NER model from Hugging Face...")
try:
    ner_pipeline = pipeline(
        "token-classification", 
        model="CAMeL-Lab/bert-base-arabic-camelbert-ca-ner",
        aggregation_strategy="simple"
    )
    print("NER model loaded successfully!")
except Exception as e:
    print(f"Error loading NER model: {e}")
    print("Will use regex-based entity extraction as fallback")
    ner_pipeline = None

def load_raw_data():
    """Load data directly from the JSON file"""
    if JSON_FILE.exists():
        print(f"Loading data from {JSON_FILE}")
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    print(f"Warning: {JSON_FILE} not found")
    return []

def load_vector_db():
    """Load the FAISS vector database with the bank information"""
    try:
        embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        db = FAISS.load_local(str(INDEX_DIR), 
                            embeddings=embedding_model, 
                            allow_dangerous_deserialization=True)
        return db
    except Exception as e:
        print(f"Error loading FAISS index: {e}")
        # Create a sample document if index doesn't exist
        print("Using the predefined bank profile for entity extraction...")
        bank_profile = """
        Bank of Palestine was founded in 1960 in Gaza by Hashim Atta Al-Shawa. It is the largest and first national bank in Palestine.
        The bank's headquarters is located in Ramallah and manages a network of 74 branches across the West Bank and Gaza Strip.
        
        The Chairman of the Board is Hashim Al-Shawa, who took over in 2007.
        The CEO is Mahmoud Al-Shawa.
        The CFO is Saqer Al-Nimri.
        Board members include Ms. Maha Awad from the Palestinian Businesswomen Council and Dr. Nabil Qaddumi.
        
        The bank has received the Best Bank in Financial Inclusion award from The Banker Magazine in 2016.
        
        CSR programs include:
        - "Palestine in the Heart" campaign for humanitarian relief
        - COVID-19 Response, contributing 6.5 million shekels to government efforts
        - Education Support Fund for Palestinian students in Lebanese universities
        - Disaster Relief for Palestinian refugees affected by earthquakes in Syria and Turkey
        
        Innovation initiatives include:
        - Innovation Intersection Hub (IIH) supported by a 1 million euro grant from FISEA+
        - Green financing program "Sunref II" in partnership with PROPARCO and the European Union
        
        Branch locations include Ramallah, Jenin, Nablus, Haifa Street, and Salfit.
        The bank has representative offices in Dubai, UAE and Santiago, Chile.
        """
        return {"sample_document": Document(page_content=bank_profile)}

def extract_bank_services(documents):
    """Extract bank services and products from the documents"""
    services = {
        "accounts": [],
        "loans": [],
        "cards": [],
        "digital_services": [],
        "investment_products": [],
        "transfer_services": []
    }
    
    # Keywords to identify different service types (Arabic and English)
    service_keywords = {
        "accounts": ["حساب", "الحسابات", "وديعة", "الودائع", "توفير", "account", "deposit", "savings"],
        "loans": ["قرض", "القروض", "تمويل", "الرهن", "loan", "mortgage", "financing"],
        "cards": ["بطاقة", "البطاقات", "فيزا", "ماستركارد", "card", "visa", "mastercard"],
        "digital_services": ["الكتروني", "رقمي", "انترنت", "موبايل", "تطبيق", "digital", "online", "mobile", "app"],
        "investment_products": ["استثمار", "الأوراق المالية", "صندوق", "investment", "securities", "fund"],
        "transfer_services": ["حوالة", "تحويل", "سويفت", "transfer", "swift", "remittance"]
    }
    
    # Process each document
    for doc in documents:
        text = doc.page_content if hasattr(doc, "page_content") else doc.get("content", "")
        
        # Skip non-Arabic content if specifically marked
        if hasattr(doc, "metadata") and doc.metadata.get("lang") != "ar":
            continue
            
        # Extract section titles and their content
        sections = re.findall(r'([^\n]+)\n([^\n]+(?:\n[^\n]+)*)', text)
        
        for title, content in sections:
            # Check which service category this section belongs to
            for category, keywords in service_keywords.items():
                if any(keyword in title.lower() for keyword in keywords):
                    # Clean up the service name
                    service_name = title.strip()
                    
                    # Add to appropriate category if not already there
                    if service_name not in services[category]:
                        services[category].append(service_name)
                        
                    # Extract specific features from content
                    features = re.findall(r'(?:•|\-|\*)\s*([^\n•\-\*]+)', content)
                    for feature in features:
                        feature_text = f"{service_name}: {feature.strip()}"
                        if feature_text not in services[category]:
                            services[category].append(feature_text)
    
    return services

def extract_branch_locations(data):
    """Extract branch locations from the bank website data"""
    branches = set()
    
    # Known branch locations in Palestine
    palestinian_cities = [
        "رام الله", "غزة", "نابلس", "جنين", "طولكرم", "الخليل", "بيت لحم", "أريحا", "قلقيلية", "طوباس",
        "سلفيت", "دير البلح", "خان يونس", "رفح", "البيرة", "النصيرات"
    ]
    
    for entry in data:
        content = entry.get("content", "")
        
        # Look for branch codes in IBAN generator page
        branch_codes = re.findall(r'(\d{4})\s*-\s*([^\n]+)', content)
        for code, name in branch_codes:
            if name.strip():
                branches.add(f"{name.strip()} ({code})")
        
        # Look for city names in text
        for city in palestinian_cities:
            if city in content:
                # Get context around city name for better branch identification
                city_indices = [m.start() for m in re.finditer(city, content)]
                for idx in city_indices:
                    start = max(0, idx - 30)
                    end = min(len(content), idx + 30)
                    context = content[start:end]
                    
                    # If "فرع" (branch) is in context, this is likely a branch reference
                    if "فرع" in context:
                        branch_name = extract_branch_name(context, city)
                        if branch_name:
                            branches.add(branch_name)
                        else:
                            branches.add(city)
    
    return sorted(list(branches))

def extract_branch_name(context, city):
    """Extract the full branch name from context"""
    # Try to find "فرع [city]" or "[city] فرع"
    branch_patterns = [
        f"فرع {city}", 
        f"{city} فرع",
        f"فرع {city} [^\n]*"
    ]
    
    for pattern in branch_patterns:
        match = re.search(pattern, context)
        if match:
            return match.group(0)
    
    return None

def extract_fees_and_rates(data):
    """Extract fees, charges, and interest rates"""
    fees_and_rates = {
        "fees": [],
        "interest_rates": []
    }
    
    fee_keywords = ["رسوم", "عمولة", "تكلفة", "fee", "charge", "commission"]
    rate_keywords = ["فائدة", "نسبة", "rate", "interest", "margin"]
    
    for entry in data:
        content = entry.get("content", "")
        
        # Extract fee information
        for keyword in fee_keywords:
            fee_matches = re.findall(f"[^\n.]*{keyword}[^\n.]*", content)
            for match in fee_matches:
                if match.strip() and len(match) < 200:  # Reasonable length
                    fees_and_rates["fees"].append(match.strip())
        
        # Extract rate information
        for keyword in rate_keywords:
            rate_matches = re.findall(f"[^\n.]*{keyword}[^\n.]*", content)
            for match in rate_matches:
                if match.strip() and len(match) < 200:  # Reasonable length
                    fees_and_rates["interest_rates"].append(match.strip())
    
    # Remove duplicates
    fees_and_rates["fees"] = list(set(fees_and_rates["fees"]))
    fees_and_rates["interest_rates"] = list(set(fees_and_rates["interest_rates"]))
    
    return fees_and_rates

def extract_digital_features(data):
    """Extract digital banking features and capabilities"""
    features = []
    
    digital_keywords = [
        "تطبيق", "انترنت", "الكتروني", "رقمي", "موبايل", "بنكي", "app", "internet", "digital", "mobile", "online"
    ]
    
    for entry in data:
        content = entry.get("content", "")
        
        # Check if this page is about digital services
        if any(keyword in content.lower() for keyword in digital_keywords):
            # Extract bullet points which often describe features
            bullet_features = re.findall(r'(?:•|\-|\*)\s*([^\n•\-\*]+)', content)
            for feature in bullet_features:
                if feature.strip() and len(feature) < 200:  # Reasonable length
                    features.append(feature.strip())
            
            # Extract features from sections with digital keywords
            for keyword in digital_keywords:
                sections = re.findall(f"([^\n]+{keyword}[^\n]+)\n([^\n]+(?:\n[^\n]+)*)", content)
                for title, section_content in sections:
                    features.append(f"{title.strip()}")
                    section_features = re.findall(r'(?:•|\-|\*|[0-9]+\.)\s*([^\n•\-\*]+)', section_content)
                    for feat in section_features:
                        if feat.strip() and len(feat) < 200:
                            features.append(f"  - {feat.strip()}")
    
    # Remove duplicates while preserving order
    unique_features = []
    for feature in features:
        if feature not in unique_features:
            unique_features.append(feature)
    
    return unique_features

def extract_known_entities(documents):
    """Extract commonly known entities that might be missed by the NER model"""
    known_entities = {
        "founders": ["هاشم عطا الشوا", "Hashim Atta Al-Shawa", "Hashim Al-Shawa", "المرحوم هاشم عطا الشوا"],
        "staff": [
            "هاشم الشوا", "محمود الشوا", "صقر النمري", "مها عوض", "نبيل قدومي",
            "Hashim Al-Shawa", "Mahmoud Al-Shawa", "Saqer Al-Nimri", "Maha Awad", "Nabil Qaddumi",
            "رئيس مجلس الإدارة", "المدير التنفيذي", "المدير المالي"
        ],
        "branches": [
            "رام الله", "غزة", "نابلس", "جنين", "طولكرم", "الخليل", "بيت لحم", "أريحا", "قلقيلية", 
            "طوباس", "سلفيت", "دير البلح", "خان يونس", "رفح", "البيرة", "النصيرات", "الرمال",
            "Ramallah", "Gaza", "Nablus", "Jenin", "Tulkarm", "Hebron", "Bethlehem", "Jericho", "Qalqilya"
        ],
        "csr_programs": [
            "فلسطين في القلب", "Palestine in the Heart", "صندوق دعم التعليم", "Education Support Fund",
            "المسؤولية الاجتماعية", "CSR", "مبادرات"
        ],
        "partners": [
            "IFC", "EBRD", "PROPARCO", "FISEA+", "SANAD", "TechnoPark", 
            "مؤسسة التمويل الدولية", "البنك الأوروبي لإعادة الإعمار والتنمية",
            "الاتحاد الأوروبي", "European Union", "سلطة النقد الفلسطينية"
        ],
        "awards": [
            "Best Bank in Financial Inclusion", "أفضل بنك في الشمول المالي",
            "جائزة", "award", "تكريم", "recognition"
        ],
        "contact_info": [
            "1700150150", "www.bankofpalestine.com", "البريد الالكتروني", "email",
            "رقم الهاتف", "phone number", "العنوان", "address"
        ]
    }
    
    results = {category: [] for category in known_entities}
    
    # Check each document for known entities
    for doc in documents:
        text = doc.page_content if hasattr(doc, "page_content") else doc
        for category, entities in known_entities.items():
            for entity in entities:
                if entity in text:
                    if entity not in results[category]:
                        results[category].append(entity)
    
    return results

def main():
    print("Loading source data...")
    raw_data = load_raw_data()
    
    print("Loading vector database...")
    db = load_vector_db()
    
    print("Processing data...")
    
    # Create document objects from raw data
    documents = [Document(page_content=entry["content"]) for entry in raw_data]
    
    # Extract different types of information
    branch_locations = extract_branch_locations(raw_data)
    bank_services = extract_bank_services(documents)
    fees_and_rates = extract_fees_and_rates(raw_data)
    digital_features = extract_digital_features(raw_data)
    known_entities = extract_known_entities(documents)
    
    # Combine all extracted information
    combined_data = {
        "founders": known_entities.get("founders", []),
        "key_personnel": known_entities.get("staff", []),
        "branch_locations": branch_locations,
        "accounts": bank_services.get("accounts", []),
        "loans": bank_services.get("loans", []),
        "cards": bank_services.get("cards", []),
        "digital_services": digital_features,
        "transfer_services": bank_services.get("transfer_services", []),
        "investment_services": bank_services.get("investment_products", []),
        "fees": fees_and_rates.get("fees", []),
        "interest_rates": fees_and_rates.get("interest_rates", []),
        "csr_programs": known_entities.get("csr_programs", []),
        "awards": known_entities.get("awards", []),
        "partners": known_entities.get("partners", []),
        "contact_info": known_entities.get("contact_info", [])
    }
    
    # Display results
    print("\n===== EXTRACTED BANK INFORMATION =====\n")
    
    print("🏦 FOUNDERS:")
    for founder in combined_data["founders"][:3]:
        print(f"  • {founder}")
    
    print("\n👥 KEY PERSONNEL:")
    for person in combined_data["key_personnel"][:10]:
        print(f"  • {person}")
    
    print("\n🏢 BRANCH LOCATIONS:")
    for branch in combined_data["branch_locations"][:15]:
        print(f"  • {branch}")
    
    print("\n💳 BANKING PRODUCTS:")
    print("  ACCOUNTS:")
    for account in combined_data["accounts"][:5]:
        print(f"  • {account}")
    
    print("\n  LOANS:")
    for loan in combined_data["loans"][:5]:
        print(f"  • {loan}")
    
    print("\n  CARDS:")
    for card in combined_data["cards"][:5]:
        print(f"  • {card}")
    
    print("\n💻 DIGITAL SERVICES:")
    for service in combined_data["digital_services"][:8]:
        print(f"  • {service}")
    
    print("\n💰 FEES & RATES:")
    print("  FEES:")
    for fee in combined_data["fees"][:5]:
        print(f"  • {fee}")
    
    print("\n  INTEREST RATES:")
    for rate in combined_data["interest_rates"][:5]:
        print(f"  • {rate}")
    
    print("\n🤝 CSR PROGRAMS:")
    for program in combined_data["csr_programs"][:5]:
        print(f"  • {program}")
    
    print("\n🏆 AWARDS & RECOGNITIONS:")
    for award in combined_data["awards"][:5]:
        print(f"  • {award}")
    
    print("\n🔄 PARTNERS:")
    for partner in combined_data["partners"][:8]:
        print(f"  • {partner}")
    
    # Save results to JSON file
    output_file = BACKEND_DIR / "data" / "bank_profile_data.json"
    os.makedirs(output_file.parent, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nData extraction complete. Results saved to {output_file}")

if __name__ == "__main__":
    main()